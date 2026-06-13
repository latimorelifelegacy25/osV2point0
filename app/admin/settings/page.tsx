import { OSShell } from '@/components/os/OSShell';
import { ModuleCard } from '@/components/os/ModuleCard';

export default function SettingsPage() {
  return (
    <OSShell title="Settings & Integrations">
      <div className="grid gap-5 lg:grid-cols-2">
        <ModuleCard title="Domain Config" eyebrow="Routing">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/50">Admin</dt><dd className="font-mono text-xs">os.latimorelifelegacy.com/admin</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Tracking</dt><dd className="font-mono text-xs">go.latimorelifelegacy.com/t/:slug</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Retail</dt><dd className="font-mono text-xs">latimorelifelegacy.com</dd></div>
          </dl>
        </ModuleCard>

        <ModuleCard title="Required Environment Variables" eyebrow="Verify before deploy">
          <ul className="space-y-1.5 font-mono text-xs text-white/60">
            <li>DATABASE_URL</li>
            <li>DIRECT_URL</li>
            <li>NEXTAUTH_SECRET</li>
            <li>NEXTAUTH_URL</li>
            <li>UPSTASH_REDIS_REST_URL</li>
            <li>UPSTASH_REDIS_REST_TOKEN</li>
            <li>QSTASH_TOKEN</li>
            <li>OBJECT_STORAGE_BUCKET</li>
            <li>OBJECT_STORAGE_ENDPOINT</li>
          </ul>
        </ModuleCard>

        <ModuleCard title="Integrations" eyebrow="Official APIs only — no scraping">
          <div className="space-y-3">
            {['Google Contacts', 'Google Drive', 'Google Analytics (GA4)', 'Google Gemini', 'Facebook', 'Instagram', 'LinkedIn'].map((provider) => (
              <div key={provider} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
                <span className="text-sm">{provider}</span>
                <span className="text-xs text-white/30">Not connected</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/20">
            All provider tokens are stored server-side only. Never exposed to client.
          </p>
        </ModuleCard>

        <ModuleCard title="Account Separation" eyebrow="Retail vs Recruiting">
          <div className="space-y-3 text-sm text-white/60">
            <div className="rounded-xl border border-[#c49a6c]/20 bg-[#c49a6c]/5 p-3">
              <p className="font-semibold text-[#c49a6c]">OS v2 — Recruiting (this system)</p>
              <p className="mt-1 text-xs">os.latimorelifelegacy.com · Separate social accounts · Agent recruiting funnel</p>
            </div>
            <div className="rounded-xl border border-white/10 p-3">
              <p className="font-medium text-white/70">Retail — Latimore Life & Legacy LLC</p>
              <p className="mt-1 text-xs">latimorelifelegacy.com · hub.latimorelifelegacy.com · Client-facing insurance</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/30">
            No cross-posting. No shared CTAs. Paid ads targeted independently.
          </p>
        </ModuleCard>
      </div>
    </OSShell>
  );
}
