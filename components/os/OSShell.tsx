'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const nav = [
  { href: '/admin', label: 'Command Center', icon: '⌂' },
  { href: '/admin/importer', label: 'Importer', icon: '↑' },
  { href: '/admin/content', label: 'Knowledge', icon: '◈' },
  { href: '/admin/composer', label: 'Composer', icon: '✎' },
  { href: '/admin/crm', label: 'CRM', icon: '◉' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '⚡' },
  { href: '/admin/analytics', label: 'Analytics', icon: '▦' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

export function OSShell({
  title,
  children,
  userName,
}: {
  title: string;
  children: ReactNode;
  userName?: string;
}) {
  const path = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-white/10 bg-[#060e1a]">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c49a6c]">
            Latimore OS
          </p>
          <p className="mt-0.5 text-xs text-white/40">v2.0 — Recruiting</p>
        </div>

        <nav className="flex flex-col gap-0.5 p-3">
          {nav.map((item) => {
            const active =
              item.href === '/admin'
                ? path === '/admin'
                : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[#c49a6c]/15 text-[#c49a6c]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="w-4 text-center text-xs">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          {userName && (
            <p className="mb-2 truncate px-2 text-xs text-white/40">{userName}</p>
          )}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/40 hover:bg-white/5 hover:text-white"
            >
              ← Sign out
            </button>
          </form>
          <p className="mt-2 px-2 text-[10px] text-white/20">os.latimorelifelegacy.com</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col">
        <header className="border-b border-white/10 px-6 py-4">
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <section className="flex-1 overflow-auto p-6">{children}</section>
      </main>
    </div>
  );
}
