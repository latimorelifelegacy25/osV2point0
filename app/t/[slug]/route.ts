import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const link = await db.trackingLink.findUnique({ where: { slug: params.slug } });

  if (!link || !link.active) {
    return new Response('Not found', { status: 404 });
  }

  // Record click
  await db.trackingClick.create({
    data: {
      linkId: link.id,
      ip: req.ip ?? req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      referer: req.headers.get('referer') ?? undefined,
    },
  });

  // Build destination with UTM params
  const url = new URL(link.destination);
  url.searchParams.set('utm_source', link.utmSource);
  url.searchParams.set('utm_medium', link.utmMedium);
  url.searchParams.set('utm_campaign', link.utmCampaign);
  if (link.utmContent) url.searchParams.set('utm_content', link.utmContent);
  if (link.utmTerm) url.searchParams.set('utm_term', link.utmTerm);

  redirect(url.toString());
}
