import { db } from '@/lib/db/client';
import type { Prisma } from '@prisma/client';

export async function logAudit(opts: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
}) {
  const data: Prisma.AuditEventCreateInput = {
    action: opts.action,
    entityType: opts.entityType,
    entityId: opts.entityId,
    metadata: opts.metadata,
    ip: opts.ip,
    ...(opts.userId ? { user: { connect: { id: opts.userId } } } : {}),
  };

  await db.auditEvent.create({ data });
}
