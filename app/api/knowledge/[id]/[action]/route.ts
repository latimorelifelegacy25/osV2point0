import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';

type Action = 'approve-internal' | 'approve-client' | 'restrict' | 'archive';

const actionToStatus: Record<Action, string> = {
  'approve-internal': 'APPROVED_INTERNAL',
  'approve-client': 'APPROVED_CLIENT_FACING',
  'restrict': 'RESTRICTED',
  'archive': 'ARCHIVED',
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: Action } }
) {
  try {
    const session = await requireSession();

    // Reviewers and admins only
    if (!['ADMIN', 'REVIEWER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action } = params;
    const newStatus = actionToStatus[action];

    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const asset = await db.knowledgeAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Cannot re-approve a restricted or archived asset without going through review
    if (['RESTRICTED', 'ARCHIVED'].includes(asset.status) && action.startsWith('approve')) {
      return NextResponse.json(
        { error: 'Restricted or archived assets must be moved to REVIEW before approval.' },
        { status: 409 }
      );
    }

    const updated = await db.knowledgeAsset.update({
      where: { id },
      data: {
        status: newStatus as any,
        reviewedById: session.userId,
        reviewedAt: new Date(),
        internalUse: action === 'approve-internal' || action === 'approve-client',
        clientFacing: action === 'approve-client',
      },
    });

    await logAudit({
      userId: session.userId,
      action: `knowledge_asset.${action.replace('-', '_')}`,
      entityType: 'KnowledgeAsset',
      entityId: id,
      metadata: { previousStatus: asset.status, newStatus },
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.redirect(new URL('/admin/content', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Review action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
