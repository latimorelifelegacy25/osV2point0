import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function CRMPage() {
  const [leads, stages] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
        stage: true,
        tasks: { where: { status: 'OPEN' } },
        interactions: { orderBy: { occurredAt: 'desc' }, take: 1 },
      },
    }),
    db.leadStage.findMany({ orderBy: { position: 'asc' } }),
  ]);

  const byStage = stages.map((s) => ({
    ...s,
    leads: leads.filter((l) => l.stageId === s.id),
  }));
  const unsorted = leads.filter((l) => !l.stageId);

  const personaLabels: Record<string, string> = {
    LICENSED_AGENT: 'Licensed Agent',
    ASPIRING_AGENT: 'Aspiring Agent',
    CAREER_CHANGER: 'Career Changer',
    REFERRAL_PARTNER: 'Referral Partner',
    ENTREPRENEUR: 'Entrepreneur',
  };

  return (
    <OSShell title="CRM / Leads">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-white/50">{leads.length} total leads</p>
        <div className="flex gap-2 text-xs text-white/40">
          <span>Lead stages are database-owned.</span>
          <span>AI summaries are read-only.</span>
          <span>No AI auto-send.</span>
        </div>
      </div>

      {/* Pipeline board */}
      <div className="grid gap-4 lg:grid-cols-4">
        {byStage.map((stage) => (
          <div key={stage.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: stage.color }}>{stage.name}</span>
              <span className="text-xs text-white/30">{stage.leads.length}</span>
            </div>
            <div className="space-y-2">
              {stage.leads.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-medium">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </p>
                  <p className="text-xs text-white/40">
                    {lead.persona ? personaLabels[lead.persona] : 'Unknown'}
                  </p>
                  {lead.utmSource && (
                    <p className="mt-1 text-[10px] text-white/30">
                      {lead.utmSource}/{lead.utmMedium} · {lead.utmCampaign}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#c49a6c]">Score: {lead.score}</span>
                    {lead.tasks.length > 0 && (
                      <span className="text-xs text-yellow-400">· {lead.tasks.length} task{lead.tasks.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {lead.aiNextAction && (
                    <p className="mt-1.5 text-[11px] text-white/40 italic">{lead.aiNextAction}</p>
                  )}
                </div>
              ))}
              {stage.leads.length === 0 && (
                <p className="text-xs text-white/20">Empty</p>
              )}
            </div>
          </div>
        ))}

        {unsorted.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/40">Unassigned</span>
              <span className="text-xs text-white/30">{unsorted.length}</span>
            </div>
            <div className="space-y-2">
              {unsorted.map((lead) => (
                <div key={lead.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-medium">
                    {lead.contact.firstName} {lead.contact.lastName}
                  </p>
                  <p className="text-xs text-white/40">
                    {lead.persona ? personaLabels[lead.persona] : 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No stages yet */}
      {stages.length === 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 p-6 text-center">
          <p className="text-sm text-white/40">
            No lead stages configured. Add stages via Settings or seed script.
          </p>
        </div>
      )}
    </OSShell>
  );
}
