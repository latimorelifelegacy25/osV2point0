import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function ImporterPage() {
  const assets = await db.knowledgeAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <OSShell title="Importer">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <ModuleCard title="Upload Document" eyebrow="Supported: PDF · DOC · DOCX · PNG · JPG · WEBP">
          <form action="/api/upload" method="POST" encType="multipart/form-data" className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">File</label>
              <input
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                required
                className="block w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#c49a6c] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#07111f]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. Schuylkill County Market Research 2026"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Category</label>
              <select
                name="category"
                className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]"
              >
                <option value="">— Select —</option>
                <option value="market_research">Market Research</option>
                <option value="compliance">Compliance</option>
                <option value="playbook">Playbook</option>
                <option value="campaign">Campaign</option>
                <option value="carrier">Carrier / Product</option>
                <option value="legal">Legal</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#c49a6c] py-2.5 text-sm font-semibold text-[#07111f] hover:bg-[#d4aa7c]"
            >
              Upload & Queue for Review
            </button>
          </form>
          <p className="mt-3 text-xs text-white/30">
            Uploaded knowledge is never made active automatically. All assets enter review before
            Composer can use them.
          </p>
        </ModuleCard>

        <ModuleCard title="Asset Queue" eyebrow={`${assets.length} assets`}>
          {assets.length === 0 ? (
            <p className="text-sm text-white/40">No assets yet. Upload a document to get started.</p>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{asset.title}</p>
                    <p className="text-xs text-white/40">
                      {asset.category ?? 'uncategorized'} · {asset.mimeType} ·{' '}
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
              ))}
            </div>
          )}
        </ModuleCard>
      </div>
    </OSShell>
  );
}
