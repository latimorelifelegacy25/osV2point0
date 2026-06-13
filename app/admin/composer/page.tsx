import { OSShell } from '@/components/os/OSShell';
import { ModuleCard, StatusBadge } from '@/components/os/ModuleCard';
import { db } from '@/lib/db/client';

export default async function ComposerPage() {
  const [drafts, campaigns, approvedKnowledge] = await Promise.all([
    db.composerDraft.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { campaign: true, author: { select: { name: true, email: true } } },
    }),
    db.campaign.findMany({ where: { status: { in: ['DRAFT', 'ACTIVE'] } }, select: { id: true, name: true } }),
    db.knowledgeAsset.findMany({
      where: { status: { in: ['APPROVED_INTERNAL', 'APPROVED_CLIENT_FACING'] } },
      select: { id: true, title: true, status: true },
    }),
  ]);

  const pending = drafts.filter((d) => ['DRAFT', 'REVIEW'].includes(d.status));
  const approved = drafts.filter((d) => d.status === 'APPROVED');

  return (
    <OSShell title="Composer">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <ModuleCard title="Create Draft" eyebrow="New Output">
          <form action="/api/composer" method="POST" className="space-y-3">
            <input name="title" type="text" required placeholder="Draft title" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c]" />
            <div className="grid grid-cols-2 gap-2">
              <select name="outputType" required className="rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
                <option value="">— Type —</option>
                <option value="SOCIAL_POST">Social Post</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="ARTICLE">Article</option>
                <option value="SCRIPT">Script</option>
                <option value="FOLLOW_UP">Follow-Up</option>
                <option value="GRANT_DOCUMENT">Grant Document</option>
              </select>
              <select name="platform" className="rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
                <option value="">— Platform —</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="TIKTOK">TikTok</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select name="persona" className="rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
                <option value="">— Persona —</option>
                <option value="LICENSED_AGENT">Licensed Agent</option>
                <option value="ASPIRING_AGENT">Aspiring Agent</option>
                <option value="CAREER_CHANGER">Career Changer</option>
                <option value="REFERRAL_PARTNER">Referral Partner</option>
                <option value="ENTREPRENEUR">Entrepreneur</option>
              </select>
              <select name="funnelStage" className="rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
                <option value="">— Stage —</option>
                <option value="AWARENESS">Awareness</option>
                <option value="INTEREST">Interest</option>
                <option value="CONSIDERATION">Consideration</option>
                <option value="JOIN">Join</option>
                <option value="ACTIVATE">Activate</option>
                <option value="REFER">Refer</option>
              </select>
            </div>
            <select name="campaignId" className="w-full rounded-xl border border-white/10 bg-[#0b1728] px-3 py-2 text-sm outline-none focus:border-[#c49a6c]">
              <option value="">— Campaign (required for UTM) —</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea name="body" required rows={6} placeholder="Draft body. All factual claims must have citations. All outbound links must use go.latimorelifelegacy.com/t/:slug tracking links." className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#c49a6c] resize-none" />
            <button type="submit" className="w-full rounded-xl bg-[#c49a6c] py-2.5 text-sm font-semibold text-[#07111f] hover:bg-[#d4aa7c]">
              Save Draft
            </button>
          </form>
          <p className="mt-3 text-xs text-white/30">
            AI output stays in DRAFT until a reviewer approves. No AI auto-publish.
          </p>
        </ModuleCard>

        <div className="space-y-4">
          <ModuleCard title="Compliance Gates" eyebrow="Required before APPROVED">
            <ul className="space-y-1.5 text-sm text-white/60">
              <li className="flex gap-2"><span className="text-[#c49a6c]">□</span> Campaign attached (UTM)</li>
              <li className="flex gap-2"><span className="text-[#c49a6c]">□</span> Knowledge sources cited</li>
              <li className="flex gap-2"><span className="text-[#c49a6c]">□</span> Tracking links used (no raw URLs)</li>
              <li className="flex gap-2"><span className="text-[#c49a6c]">□</span> Compliance reviewed</li>
              <li className="flex gap-2"><span className="text-[#c49a6c]">□</span> Reviewer/admin approval</li>
            </ul>
          </ModuleCard>

          <ModuleCard title="Approved Knowledge" eyebrow={`${approvedKnowledge.length} assets`}>
            {approvedKnowledge.length === 0 ? (
              <p className="text-sm text-white/40">No approved knowledge yet.</p>
            ) : (
              <div className="space-y-2">
                {approvedKnowledge.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm">{a.title}</p>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </ModuleCard>
        </div>
      </div>

      {/* Draft queue */}
      <div className="mt-6 grid gap-4">
        <h2 className="text-sm font-semibold text-white/50">
          Pending Review — {pending.length} draft{pending.length !== 1 ? 's' : ''}
        </h2>
        {pending.map((d) => (
          <ModuleCard key={d.id} title={d.title} eyebrow={`${d.outputType} · ${d.platform ?? 'no platform'}`}>
            <p className="mb-3 line-clamp-3 text-sm text-white/60">{d.body}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={d.status} />
              {d.campaign && <span className="text-xs text-white/30">{d.campaign.name}</span>}
              {!d.complianceChecked && <span className="text-xs text-red-400">⚠ compliance not checked</span>}
              {d.utmRequired && !d.campaignId && <span className="text-xs text-yellow-400">⚠ no campaign / UTM</span>}
            </div>
            {d.status === 'REVIEW' && (
              <div className="mt-3 flex gap-2">
                <form action={`/api/composer/${d.id}/approve`} method="POST">
                  <button className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs text-green-300">
                    Approve
                  </button>
                </form>
              </div>
            )}
          </ModuleCard>
        ))}
        {pending.length === 0 && (
          <p className="text-sm text-white/30">No drafts pending review.</p>
        )}

        {approved.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-white/50">Approved — {approved.length}</h2>
            {approved.map((d) => (
              <ModuleCard key={d.id} title={d.title} eyebrow={`${d.outputType} · ${d.platform ?? 'no platform'}`}>
                <p className="mb-3 line-clamp-2 text-sm text-white/60">{d.body}</p>
                <StatusBadge status={d.status} />
              </ModuleCard>
            ))}
          </>
        )}
      </div>
    </OSShell>
  );
}
