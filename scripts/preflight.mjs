const required = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAILS',
];

const recommended = [
  'NEXT_PUBLIC_BASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'QSTASH_TOKEN',
  'STORAGE_ENDPOINT',
  'STORAGE_ACCESS_KEY_ID',
  'STORAGE_SECRET_ACCESS_KEY',
];

const missingRequired = required.filter((key) => !process.env[key]);
const missingRecommended = recommended.filter((key) => !process.env[key]);

console.log('Latimore OS v2 preflight');
console.log('Required env present:', required.length - missingRequired.length, '/', required.length);
console.log('Recommended env present:', recommended.length - missingRecommended.length, '/', recommended.length);

if (missingRecommended.length) {
  console.warn('Missing recommended env:', missingRecommended.join(', '));
}

if (missingRequired.length) {
  console.error('Missing required env:', missingRequired.join(', '));
  process.exit(1);
}

console.log('Preflight passed.');
