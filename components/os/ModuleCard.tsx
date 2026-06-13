import type { ReactNode } from 'react';

export function ModuleCard({
  title,
  eyebrow,
  children,
  className = '',
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      {eyebrow && (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c49a6c]">
          {eyebrow}
        </p>
      )}
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </article>
  );
}

const statusColors: Record<string, string> = {
  draft: 'border-white/20 bg-white/5 text-white/60',
  review: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  approved: 'border-green-500/40 bg-green-500/10 text-green-300',
  approved_internal: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  approved_client_facing: 'border-green-500/40 bg-green-500/10 text-green-300',
  published: 'border-[#c49a6c]/40 bg-[#c49a6c]/10 text-[#f3d8ad]',
  active: 'border-green-500/40 bg-green-500/10 text-green-300',
  paused: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  pending: 'border-white/20 bg-white/5 text-white/50',
  restricted: 'border-red-500/40 bg-red-500/10 text-red-300',
  archived: 'border-white/10 bg-white/[0.02] text-white/30',
  completed: 'border-[#c49a6c]/40 bg-[#c49a6c]/10 text-[#f3d8ad]',
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cls = statusColors[key] ?? 'border-white/20 bg-white/5 text-white/60';
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${cls}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
