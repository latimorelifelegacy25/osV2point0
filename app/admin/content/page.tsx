import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

const statuses = [
  'PENDING', 'PROCESSING', 'REVIEW',
  'APPROVED_INTERNAL', 'APPROVED_CLIENT_FACING',
  'RESTRICTED', 'ARCHIVED',
];

export default async function KnowledgePage() {
  const assets = await db.knowledgeAsset.findMany({
    orderBy: { createdAt: 'desc' },
    include: { citations: true, reviewedBy: true },
  });

  const counts = statuses.reduce<Record<string, number>>((acc, s) => {
    acc[s] = assets.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <OSShell title="Knowledge Base">
      {/* Pipeline strip */}
      <div className="mb-5 grid grid-cols-7 gap-2">
        {statuses.map((s) => (
          <div key={s} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
            <p className="text-lg font-bold text-[#c49a6c]">{counts[s] ?? 0}</p>
            <p className="text-[10px] capitalize text-white/40">{s.replaceAll('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {assets.length === 0 && (
          <p className="text-sm text-white/40">No assets yet. Upload documents via Importer.</p>
        )}
        {assets.map((asset) => (
          <ModuleCard
            key={asset.id}
            title={asset.title}
            eyebrow={`${asset.category ?? 'uncategorized'} · ${asset.mimeType}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={asset.status} />
              {asset.internalUse && <StatusBadge status="internal use" />}
              {asset.clientFacing && <StatusBadge status="client facing" />}
              <span className="text-xs text-white/30">
                {asset.citations.length} citation{asset.citations.length !== 1 ? 's' : ''}
              </span>
              {asset.reviewedBy && (
                <span className="text-xs text-white/30">
                  Reviewed by {asset.reviewedBy.name ?? asset.reviewedBy.email}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={`/api/knowledge/${asset.id}/approve-internal`} method="POST">
                <button className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20">
                  Approve Internal
                </button>
              </form>
              <form action={`/api/knowledge/${asset.id}/approve-client`} method="POST">
                <button className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs text-green-300 hover:bg-green-500/20">
                  Approve Client-Facing
                </button>
              </form>
              <form action={`/api/knowledge/${asset.id}/restrict`} method="POST">
                <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20">
                  Restrict
                </button>
              </form>
            </div>
          </ModuleCard>
        ))}
      </div>
    </OSShell>
  );
}
