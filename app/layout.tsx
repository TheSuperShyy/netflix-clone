import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import SessionSplash from '@/components/SessionSplash';
import './globals.css';

export const metadata: Metadata = {
  title: 'Netflix ni Yul',
  description: 'A legal aggregator of public-domain and free-licensed streaming content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-zinc-100 font-sans antialiased">
        <SessionSplash />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
