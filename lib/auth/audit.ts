import { db } from '@/lib/db/client';

export async function logAudit(opts: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  await db.auditEvent.create({ data: opts });
}
