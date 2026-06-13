import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { logAudit } from '@/lib/auth/audit';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + process.env.NEXTAUTH_SECRET).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const email = String(body.get('email') ?? '').toLowerCase().trim();
    const password = String(body.get('password') ?? '');

    if (!email || !password) {
      return NextResponse.redirect(new URL('/login?error=invalid', req.url));
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.redirect(new URL('/login?error=invalid', req.url));
    }

    const hash = hashPassword(password);
    if (hash !== user.passwordHash) {
      await logAudit({
        action: 'auth.login_failed',
        entityType: 'User',
        entityId: user.id,
        ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
      });
      return NextResponse.redirect(new URL('/login?error=invalid', req.url));
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await db.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    await logAudit({
      userId: user.id,
      action: 'auth.login_success',
      entityType: 'User',
      entityId: user.id,
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
    });

    const res = NextResponse.redirect(new URL('/admin', req.url));
    res.cookies.set('os_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.redirect(new URL('/login?error=unknown', req.url));
  }
}
