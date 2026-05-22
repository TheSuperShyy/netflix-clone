'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nny-splash-shown';
const MIN_DISPLAY_MS = 2400;
const FADE_MS = 500;

export default function SessionSplash() {
  const [phase, setPhase] = useState<'hidden' | 'show' | 'fade' | 'done'>('hidden');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      setPhase('done');
      return;
    }
    setPhase('show');
    const fadeAt = window.setTimeout(() => setPhase('fade'), MIN_DISPLAY_MS);
    const doneAt = window.setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(STORAGE_KEY, '1');
    }, MIN_DISPLAY_MS + FADE_MS);
    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(doneAt);
    };
  }, []);

  if (phase === 'done' || phase === 'hidden') return null;

  return (
    <div
      aria-hidden
      className={
        'fixed inset-0 bg-black flex items-center justify-center z-[100] overflow-hidden transition-opacity ease-out ' +
        (phase === 'fade' ? 'opacity-0' : 'opacity-100')
      }
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="relative">
        <div className="text-brand-red font-black text-[8rem] md:text-[12rem] leading-none tracking-tighter animate-logo-pulse select-none">
          N
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 -inset-x-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sheen" />
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-zinc-500 text-[10px] md:text-xs uppercase tracking-[0.5em] animate-fade-in">
        Netflix ni Yul
      </div>
    </div>
  );
}
