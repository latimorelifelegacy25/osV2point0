import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Latimore OS v2',
  description: 'Latimore Life & Legacy — Recruiting Operating System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#07111f] text-white antialiased">{children}</body>
    </html>
  );
}
