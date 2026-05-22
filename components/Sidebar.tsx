'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  {
    key: 'home',
    label: 'Home',
    href: '/',
    d: 'M3 11l9-8 9 8M5 10v10h14V10',
  },
  {
    key: 'search',
    label: 'Search',
    href: '/search',
    d: 'M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col items-center w-14 lg:w-16 py-6 gap-6 bg-black/40 border-r border-white/5 shrink-0">
      {ITEMS.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={
              'relative group p-2 transition-colors ' +
              (active ? 'text-white' : 'text-zinc-400 hover:text-white')
            }
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.d} />
            </svg>
            {active && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-red rounded-full" />
            )}
          </Link>
        );
      })}
    </aside>
  );
}
