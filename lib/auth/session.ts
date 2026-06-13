import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';

export async function getSession() {
  const token = cookies().get('os_session')?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== 'ADMIN') throw new Error('Forbidden');
  return session;
}
