import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const requiredEnv = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAILS',
];

export async function GET() {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  let database = 'unknown';
  let databaseError: string | null = null;

  try {
    await prisma.$queryRaw`select 1`;
    database = 'ok';
  } catch (error) {
    database = 'error';
    databaseError = error instanceof Error ? error.message : 'Unknown database error';
  } finally {
    await prisma.$disconnect();
  }

  const ok = missingEnv.length === 0 && database === 'ok';

  return NextResponse.json(
    {
      ok,
      service: 'latimore-os-v2',
      timestamp: new Date().toISOString(),
      env: {
        ok: missingEnv.length === 0,
        missing: missingEnv,
      },
      database: {
        status: database,
        error: databaseError,
      },
    },
    { status: ok ? 200 : 503 },
  );
}
