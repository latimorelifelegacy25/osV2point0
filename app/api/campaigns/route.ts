import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createCampaignSchema } from '@/lib/validators/schemas';
import { requireSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = Object.fromEntries(await req.formData());
    const data = createCampaignSchema.parse({
      ...body,
      durationDays: Number(body.durationDays),
    });

    const campaign = await db.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        persona: data.persona,
        durationDays: data.durationDays,
        targetEvent: data.targetEvent,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    await logAudit({
      userId: session.userId,
      action: 'campaign.created',
      entityType: 'Campaign',
      entityId: campaign.id,
    });

    return NextResponse.redirect(new URL('/admin/campaigns', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
