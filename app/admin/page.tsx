import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function CommandCenterPage() {
  const [leads, drafts, campaigns, assets] = await Promise.all([
    db.lead.count(),
    db.composerDraft.count({ where: { status: { in: ['DRAFT', 'REVIEW'] } } }),
    db.campaign.count({ where: { status: 'ACTIVE' } }),
    db.knowledgeAsset.count({ where: { status: 'REVIEW' } }),
  ]);

  const recentLeads = await db.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { contact: true, stage: true },
  });

  const stats = [
    { label: 'Total Leads', value: leads, sub: 'in CRM' },
    { label: 'Active Campaigns', value: campaigns, sub: 'running now' },
    { label: 'Drafts Pending', value: drafts, sub: 'need review' },
    { label: 'Knowledge Pending', value: assets, sub: 'awaiting review' },
  ];

  return (
    <OSShell title="Command Center">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-3xl font-bold text-[#c49a6c]">{s.value}</p>
            <p className="mt-1 font-medium">{s.label}</p>
            <p className="text-sm text-white/40">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ModuleCard title="Recent Leads" eyebrow="CRM">
          {recentLeads.length === 0 ? (
            <p className="text-sm text-white/40">No leads yet. Leads appear here after form submission.</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {lead.contact.firstName} {lead.contact.lastName}
                    </p>
                    <p className="text-xs text-white/40">
                      {lead.persona?.replaceAll('_', ' ') ?? 'Unknown'} ·{' '}
                      {lead.utmSource ?? 'direct'}
                    </p>
                  </div>
                  <StatusBadge status={lead.stage?.name ?? 'new'} />
                </div>
              ))}
            </div>
          )}
        </ModuleCard>

        <ModuleCard title="System Rules" eyebrow="SPEC-1 Governance">
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> External platforms are sources</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> Raw provider payloads are evidence</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> PostgreSQL is the system of record</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> Knowledge must be reviewed before Composer use</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> AI cannot approve, publish, or bypass gates</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> UTM required on all publishable output</li>
            <li className="flex gap-2"><span className="text-[#c49a6c]">→</span> Citations required for factual claims</li>
          </ul>
        </ModuleCard>
      </div>
    </OSShell>
  );
}
