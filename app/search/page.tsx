'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/Card';
import type { Title } from '@/lib/types';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setTouched(true);
    const handle = setTimeout(() => {
      const ctl = new AbortController();
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d: { results: Title[] }) => setResults(d.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
      return () => ctl.abort();
    }, 280);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 md:px-10 lg:px-14 py-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Search</h1>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies and shows…"
              className="w-full bg-zinc-900/80 ring-1 ring-white/10 focus:ring-brand-red focus:outline-none rounded-md pl-10 pr-4 py-3 text-base placeholder:text-zinc-500"
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Searches across TMDB (movies & shows) and Internet Archive (public-domain films).
          </div>
        </div>

        <section className="mt-8">
          {loading && (
            <div className="text-zinc-400 text-sm animate-fade-in">Searching…</div>
          )}
          {!loading && touched && q.trim().length >= 2 && results.length === 0 && (
            <div className="text-zinc-500 text-sm">No results for "{q.trim()}".</div>
          )}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
              {results.map((title) => (
                <div key={`${title.source}:${title.id}`} className="w-full">
                  <div className="flex justify-center">
                    <Card title={title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
