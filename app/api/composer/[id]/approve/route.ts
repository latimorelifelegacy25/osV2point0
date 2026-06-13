import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();

    if (!['ADMIN', 'REVIEWER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const draft = await db.composerDraft.findUnique({
      where: { id: params.id },
      include: { citations: true, trackingLinks: true },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    // Enforce compliance gates
    const errors: string[] = [];

    if (draft.utmRequired && !draft.campaignId) {
      errors.push('Campaign (UTM) required before approval.');
    }

    if (draft.citationRequired && draft.citations.length === 0) {
      errors.push('At least one citation required before approval.');
    }

    if (!draft.complianceChecked) {
      errors.push('Compliance review must be checked before approval.');
    }

    if (draft.status !== 'REVIEW') {
      errors.push('Draft must be in REVIEW status to approve.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(' ') }, { status: 422 });
    }

    const approved = await db.composerDraft.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.userId,
      },
    });

    await logAudit({
      userId: session.userId,
      action: 'composer_draft.approved',
      entityType: 'ComposerDraft',
      entityId: params.id,
      metadata: { outputType: draft.outputType, platform: draft.platform },
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.redirect(new URL('/admin/composer', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Approval failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
