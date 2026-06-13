import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { logAudit } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('os_session')?.value;

  if (token) {
    const session = await db.session.findUnique({ where: { token } });
    if (session) {
      await db.session.delete({ where: { token } });
      await logAudit({
        userId: session.userId,
        action: 'auth.logout',
        ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
      });
    }
  }

  const res = NextResponse.redirect(new URL('/login', req.url));
  res.cookies.delete('os_session');
  return res;
}
