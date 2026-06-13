import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLeadSchema } from '@/lib/validators/schemas';
import { logAudit } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createLeadSchema.parse(body);

    // Find or create contact
    let contact = data.email
      ? await db.contact.findFirst({ where: { email: data.email } })
      : null;

    if (!contact) {
      contact = await db.contact.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          state: data.state,
          source: data.utmSource ?? 'direct',
        },
      });
    }

    // Find default stage
    const defaultStage = await db.leadStage.findFirst({ orderBy: { position: 'asc' } });

    const lead = await db.lead.create({
      data: {
        contactId: contact.id,
        stageId: defaultStage?.id,
        persona: data.persona,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmContent: data.utmContent,
        utmTerm: data.utmTerm,
        campaignId: data.campaignId,
        heardFrom: data.heardFrom,
        notes: data.notes,
      },
    });

    await db.interaction.create({
      data: {
        leadId: lead.id,
        type: 'FORM_SUBMIT',
        body: 'Join form submitted',
        direction: 'inbound',
      },
    });

    await logAudit({
      action: 'lead.created',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: { utmSource: data.utmSource, persona: data.persona },
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
