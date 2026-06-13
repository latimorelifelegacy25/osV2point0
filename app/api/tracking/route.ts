import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createTrackingLinkSchema } from '@/lib/validators/schemas';
import { requireSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = Object.fromEntries(await req.formData());
    const data = createTrackingLinkSchema.parse(body);

    const existing = await db.trackingLink.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    const link = await db.trackingLink.create({ data });

    await logAudit({
      userId: session.userId,
      action: 'tracking_link.created',
      entityType: 'TrackingLink',
      entityId: link.id,
      metadata: { slug: data.slug, utmCampaign: data.utmCampaign },
    });

    return NextResponse.redirect(new URL('/admin/campaigns', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
