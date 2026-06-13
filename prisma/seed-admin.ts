/**
 * Run once to create the admin user:
 * npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const db = new PrismaClient();

const ADMIN_EMAIL = 'jackson1989@latimorelegacy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ChangeMe2026!';
const SECRET = process.env.NEXTAUTH_SECRET ?? '';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SECRET).digest('hex');
}

async function main() {
  if (!SECRET) {
    throw new Error('NEXTAUTH_SECRET must be set in environment before running seed-admin');
  }

  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const user = await db.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: 'Jackson Latimore',
      role: 'ADMIN',
      passwordHash: hashPassword(ADMIN_PASSWORD),
    },
  });

  console.log(`✓ Admin user created: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('\n  Change your password after first login.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
