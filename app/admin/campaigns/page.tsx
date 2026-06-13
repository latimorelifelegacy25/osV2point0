import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function CampaignsPage() {
  const [campaigns, links] = await Promise.all([
    db.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        trackingLinks: { include: { clicks: true } },
        leads: { select: { id: true } },
      },
    }),
    db.trackingLink.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { campaign: { select: { name: true } }, clicks: true },
    }),
  ]);

  return (
    <OSShell title="Campaigns & UTM">
      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Create Campaign */}
        <ModuleCard title="New Campaign" eyebrow="Campaign">
          <form action="/api/campaigns" method="POST" className="space-y-3">
            <input name="name" type="text" required placeholder="Campaign name" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <select name="type" required className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
              <option value="">— Type —</option>
              <option value="PERSONA_SPOTLIGHT">Persona Spotlight</option>
              <option value="URGENCY">Urgency</option>
              <option value="REENGAGEMENT">Re-engagement</option>
              <option value="REFERRAL_PUSH">Referral Push</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="RETAIL_EDUCATION">Retail — Education</option>
              <option value="RETAIL_PAHS">Retail — PAHS</option>
              <option value="RETAIL_COMMUNITY">Retail — Community</option>
            </select>
            <select name="persona" className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
              <option value="">— Persona (optional) —</option>
              <option value="LICENSED_AGENT">Licensed Agent</option>
              <option value="ASPIRING_AGENT">Aspiring Agent</option>
              <option value="CAREER_CHANGER">Career Changer</option>
              <option value="REFERRAL_PARTNER">Referral Partner</option>
              <option value="ENTREPRENEUR">Entrepreneur</option>
            </select>
            <input name="durationDays" type="number" required placeholder="Duration (days)" min={1} max={90} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <input name="targetEvent" type="text" placeholder="GA4 event (e.g. join_form_submit)" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <button type="submit" className="w-full rounded-xl bg-[#c49a6c] py-2.5 text-sm font-semibold text-[#07111f] hover:bg-[#d4aa7c]">
              Create Campaign
            </button>
          </form>
        </ModuleCard>

        {/* Create Tracking Link */}
        <ModuleCard title="New Tracking Link" eyebrow={`go.latimorelifelegacy.com/t/:slug`}>
          <form action="/api/tracking" method="POST" className="space-y-3">
            <select name="campaignId" required className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
              <option value="">— Campaign —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="slug" type="text" required placeholder="slug (e.g. la-week-ig)" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <input name="destination" type="url" required placeholder="https://os.latimorelifelegacy.com/join" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <div className="grid grid-cols-3 gap-2">
              <input name="utmSource" type="text" required placeholder="source" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
              <input name="utmMedium" type="text" required placeholder="medium" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
              <input name="utmCampaign" type="text" required placeholder="campaign" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#c49a6c] py-2.5 text-sm font-semibold text-[#07111f] hover:bg-[#d4aa7c]">
              Create Tracking Link
            </button>
          </form>
        </ModuleCard>
      </div>

      {/* Campaign list */}
      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.length === 0 && (
          <p className="text-sm text-white/40">No campaigns yet.</p>
        )}
        {campaigns.map((c) => (
          <ModuleCard key={c.id} title={c.name} eyebrow={c.persona?.replaceAll('_', ' ') ?? c.type.replaceAll('_', ' ')}>
            <dl className="grid gap-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-white/50">Duration</dt><dd>{c.durationDays}d</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Target Event</dt><dd className="font-mono text-xs">{c.targetEvent ?? '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Leads</dt><dd>{c.leads.length}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Links</dt><dd>{c.trackingLinks.length}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Clicks</dt><dd>{c.trackingLinks.reduce((n, l) => n + l.clicks.length, 0)}</dd></div>
            </dl>
            <div className="mt-3"><StatusBadge status={c.status} /></div>
          </ModuleCard>
        ))}
      </div>

      {/* Link table */}
      {links.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-white/60">Recent Tracking Links</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/50">
                <tr>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Campaign</th>
                  <th className="p-3">Source / Medium</th>
                  <th className="p-3 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id} className="border-t border-white/10">
                    <td className="p-3 font-mono text-xs text-[#c49a6c]">
                      go.latimorelifelegacy.com/t/{l.slug}
                    </td>
                    <td className="p-3">{l.campaign.name}</td>
                    <td className="p-3 text-white/50">{l.utmSource} / {l.utmMedium}</td>
                    <td className="p-3 text-right">{l.clicks.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </OSShell>
  );
}
