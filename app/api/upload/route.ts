import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';
import { getObjectUrl } from '@/lib/storage/client';
import crypto from 'crypto';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const title = String(formData.get('title') ?? '').trim();
    const category = String(formData.get('category') ?? '').trim() || null;

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required.' }, { status: 400 });
    }

    const mimeType = file.type;
    if (!ALLOWED_TYPES[mimeType]) {
      return NextResponse.json(
        { error: `File type not allowed: ${mimeType}. Allowed: PDF, DOC, DOCX, PNG, JPG, WEBP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum 20MB.' }, { status: 400 });
    }

    // Generate unique storage key
    const ext = ALLOWED_TYPES[mimeType];
    const key = `knowledge/${crypto.randomUUID()}.${ext}`;

    // Upload to object storage
    const storageEndpoint = process.env.OBJECT_STORAGE_ENDPOINT ?? '';
    const bucket = process.env.OBJECT_STORAGE_BUCKET ?? '';

    if (!storageEndpoint || !bucket) {
      // Dev fallback — store metadata only, no actual file upload
      const asset = await db.knowledgeAsset.create({
        data: {
          title,
          sourceFileName: file.name,
          mimeType,
          storagePath: `local/${key}`,
          category,
          status: 'PENDING',
        },
      });

      await logAudit({
        userId: session.userId,
        action: 'knowledge_asset.uploaded',
        entityType: 'KnowledgeAsset',
        entityId: asset.id,
        metadata: { fileName: file.name, mimeType, size: file.size, devMode: true },
        ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
      });

      return NextResponse.redirect(new URL('/admin/importer', req.url));
    }

    // Production: upload file bytes to storage
    const bytes = await file.arrayBuffer();
    const uploadUrl = getObjectUrl(key);

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: bytes,
    });

    if (!uploadRes.ok) {
      throw new Error(`Storage upload failed: ${uploadRes.status}`);
    }

    // Create KnowledgeAsset record — status PENDING, never auto-approved
    const asset = await db.knowledgeAsset.create({
      data: {
        title,
        sourceFileName: file.name,
        mimeType,
        storagePath: key,
        category,
        status: 'PENDING',
      },
    });

    await logAudit({
      userId: session.userId,
      action: 'knowledge_asset.uploaded',
      entityType: 'KnowledgeAsset',
      entityId: asset.id,
      metadata: { fileName: file.name, mimeType, size: file.size },
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.redirect(new URL('/admin/importer', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('[upload]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
