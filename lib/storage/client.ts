/**
 * S3-compatible object storage client.
 * Works with Supabase Storage, Cloudflare R2, AWS S3, or any S3-compatible provider.
 * Configure via environment variables — no hardcoded credentials.
 */

const BUCKET = process.env.OBJECT_STORAGE_BUCKET ?? '';
const ENDPOINT = process.env.OBJECT_STORAGE_ENDPOINT ?? '';
const ACCESS_KEY = process.env.OBJECT_STORAGE_ACCESS_KEY ?? '';
const SECRET_KEY = process.env.OBJECT_STORAGE_SECRET_KEY ?? '';
const REGION = process.env.OBJECT_STORAGE_REGION ?? 'us-east-1';

function assertConfig() {
  if (!BUCKET || !ENDPOINT || !ACCESS_KEY || !SECRET_KEY) {
    throw new Error(
      'Object storage not configured. Set OBJECT_STORAGE_BUCKET, OBJECT_STORAGE_ENDPOINT, OBJECT_STORAGE_ACCESS_KEY, OBJECT_STORAGE_SECRET_KEY in environment.'
    );
  }
}

/**
 * Generate a signed upload URL for client-side direct upload.
 * Expires in 5 minutes.
 */
export async function getSignedUploadUrl(key: string, contentType: string): Promise<string> {
  assertConfig();

  // Use Supabase Storage signed URL if endpoint matches Supabase pattern
  if (ENDPOINT.includes('supabase')) {
    return getSupabaseSignedUrl(key, contentType);
  }

  // Generic S3 presigned URL generation
  return getS3PresignedUrl(key, contentType, 'PUT');
}

/**
 * Get a public or signed download URL for a stored object.
 */
export function getObjectUrl(storagePath: string): string {
  assertConfig();
  if (ENDPOINT.includes('supabase')) {
    return `${ENDPOINT}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  }
  return `${ENDPOINT}/${BUCKET}/${storagePath}`;
}

/**
 * Delete an object from storage.
 */
export async function deleteObject(storagePath: string): Promise<void> {
  assertConfig();
  const url = `${ENDPOINT}/${BUCKET}/${storagePath}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: await getAuthHeaders('DELETE', storagePath),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete object: ${res.status} ${res.statusText}`);
  }
}

// ─── Supabase Storage ─────────────────────────────────────────────────────────

async function getSupabaseSignedUrl(key: string, _contentType: string): Promise<string> {
  const supabaseUrl = ENDPOINT.replace('/storage/v1', '');
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/sign/${BUCKET}/${key}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET_KEY}`,
        apikey: ACCESS_KEY,
      },
      body: JSON.stringify({ expiresIn: 300 }),
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase signed URL failed: ${res.status}`);
  }

  const data = await res.json() as { signedURL: string };
  return `${supabaseUrl}/storage/v1${data.signedURL}`;
}

// ─── Generic S3 ───────────────────────────────────────────────────────────────

async function getS3PresignedUrl(
  key: string,
  contentType: string,
  method: string
): Promise<string> {
  // AWS Signature V4 presigned URL
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';

  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const credential = `${ACCESS_KEY}/${credentialScope}`;

  const params = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': '300',
    'X-Amz-SignedHeaders': 'content-type;host',
  });

  const host = new URL(ENDPOINT).host;
  const canonicalRequest = [
    method,
    `/${key}`,
    params.toString(),
    `content-type:${contentType}\nhost:${host}\n`,
    'content-type;host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const { createHmac, createHash } = await import('crypto');
  const hash = (data: string) => createHash('sha256').update(data).digest('hex');
  const hmac = (key: Buffer | string, data: string) =>
    createHmac('sha256', key).update(data).digest();

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join('\n');

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${SECRET_KEY}`, dateStamp), REGION), 's3'),
    'aws4_request'
  );
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  params.set('X-Amz-Signature', signature);
  return `${ENDPOINT}/${BUCKET}/${key}?${params.toString()}`;
}

async function getAuthHeaders(method: string, key: string): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp = amzDate.slice(0, 8);

  const { createHmac, createHash } = await import('crypto');
  const hmac = (k: Buffer | string, d: string) => createHmac('sha256', k).update(d).digest();
  const hash = (d: string) => createHash('sha256').update(d).digest('hex');

  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
  const host = new URL(ENDPOINT).host;

  const canonicalRequest = [method, `/${key}`, '', `host:${host}\nx-amz-date:${amzDate}\n`, 'host;x-amz-date', hash('')].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, hash(canonicalRequest)].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${SECRET_KEY}`, dateStamp), REGION), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  return {
    'x-amz-date': amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=host;x-amz-date, Signature=${signature}`,
  };
}
