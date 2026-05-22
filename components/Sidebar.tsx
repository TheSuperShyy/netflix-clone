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
    <>
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

      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm">
        <Link href="/" aria-label="Home" className="flex items-center gap-2">
          <span className="text-brand-red font-black text-2xl leading-none">N</span>
          <span className="text-white font-bold text-xs tracking-[0.3em]">NETFLIX NI YUL</span>
        </Link>
        <Link
          href="/search"
          aria-label="Search"
          aria-current={pathname?.startsWith('/search') ? 'page' : undefined}
          className={
            'p-2 rounded-full transition-colors ' +
            (pathname?.startsWith('/search')
              ? 'text-white bg-white/10'
              : 'text-zinc-200 hover:text-white hover:bg-white/10')
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
            <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
          </svg>
        </Link>
      </header>
    </>
  );
}
