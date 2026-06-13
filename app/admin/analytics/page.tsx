import { OSShell } from '@/components/os/OSShell';
import { ModuleCard } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function AnalyticsPage() {
  const [
    totalLeads,
    totalClicks,
    totalCampaigns,
    topLinks,
    leadsByPersona,
    leadsBySource,
    sourceHealth,
  ] = await Promise.all([
    db.lead.count(),
    db.trackingClick.count(),
    db.campaign.count({ where: { status: 'ACTIVE' } }),
    db.trackingLink.findMany({
      orderBy: { clicks: { _count: 'desc' } },
      take: 5,
      include: { clicks: true, campaign: { select: { name: true } } },
    }),
    db.lead.groupBy({ by: ['persona'], _count: { id: true } }),
    db.lead.groupBy({ by: ['utmSource'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 8 }),
    db.sourceHealth.findMany({ orderBy: { provider: 'asc' } }),
  ]);

  const personaLabels: Record<string, string> = {
    LICENSED_AGENT: 'Licensed Agent',
    ASPIRING_AGENT: 'Aspiring Agent',
    CAREER_CHANGER: 'Career Changer',
    REFERRAL_PARTNER: 'Referral Partner',
    ENTREPRENEUR: 'Entrepreneur',
  };

  return (
    <OSShell title="Analytics">
      <p className="mb-5 text-xs text-white/30">
        All data reads from PostgreSQL. No live provider calls during render.
      </p>

      {/* Summary stats */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Leads', value: totalLeads },
          { label: 'Total Link Clicks', value: totalClicks },
          { label: 'Active Campaigns', value: totalCampaigns },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-3xl font-bold text-[#c49a6c]">{s.value}</p>
            <p className="mt-1 text-sm text-white/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top tracking links */}
        <ModuleCard title="Top Tracking Links" eyebrow="By clicks">
          {topLinks.length === 0 ? (
            <p className="text-sm text-white/40">No tracking clicks yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-white/50">
                  <tr>
                    <th className="p-2.5">Slug</th>
                    <th className="p-2.5">Campaign</th>
                    <th className="p-2.5 text-right">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((l) => (
                    <tr key={l.id} className="border-t border-white/10">
                      <td className="p-2.5 font-mono text-xs text-[#c49a6c]">/t/{l.slug}</td>
                      <td className="p-2.5 text-white/60">{l.campaign.name}</td>
                      <td className="p-2.5 text-right">{l.clicks.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModuleCard>

        {/* Leads by persona */}
        <ModuleCard title="Leads by Persona" eyebrow="CRM breakdown">
          {leadsByPersona.length === 0 ? (
            <p className="text-sm text-white/40">No leads yet.</p>
          ) : (
            <div className="space-y-2">
              {leadsByPersona.map((row) => (
                <div key={row.persona ?? 'unknown'} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">
                    {row.persona ? personaLabels[row.persona] : 'Unknown'}
                  </span>
                  <span className="font-bold text-[#c49a6c]">{row._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </ModuleCard>

        {/* Leads by UTM source */}
        <ModuleCard title="Lead Attribution" eyebrow="By UTM source">
          {leadsBySource.length === 0 ? (
            <p className="text-sm text-white/40">No UTM data yet.</p>
          ) : (
            <div className="space-y-2">
              {leadsBySource.map((row) => (
                <div key={row.utmSource ?? 'direct'} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{row.utmSource ?? 'direct'}</span>
                  <span className="font-bold text-[#c49a6c]">{row._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </ModuleCard>

        {/* Source health */}
        <ModuleCard title="Source Health" eyebrow="Integration status">
          {sourceHealth.length === 0 ? (
            <p className="text-sm text-white/40">
              No integrations configured yet. Add via Settings.
            </p>
          ) : (
            <div className="space-y-2">
              {sourceHealth.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-white/70">{s.provider}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                    <span className="text-xs text-white/40">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModuleCard>
      </div>
    </OSShell>
  );
}
