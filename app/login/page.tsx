import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (session) redirect('/admin');

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#c49a6c]">
            Latimore OS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">v2.0 — Recruiting</h1>
          <p className="mt-1 text-xs text-white/30">os.latimorelifelegacy.com</p>
        </div>

        {/* Error */}
        {searchParams.error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {searchParams.error === 'invalid' ? 'Invalid email or password.' : 'Something went wrong. Try again.'}
          </div>
        )}

        {/* Form */}
        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#c49a6c]"
              placeholder="jackson1989@latimorelegacy.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/60">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#c49a6c]"
              placeholder="••••••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#c49a6c] py-3 text-sm font-bold text-[#07111f] hover:bg-[#d4aa7c] transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/20">
          Protecting Today. Securing Tomorrow. #TheBeatGoesOn
        </p>
      </div>
    </main>
  );
}
