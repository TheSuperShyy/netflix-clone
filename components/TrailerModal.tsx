'use client';

import { useEffect, useState } from 'react';
import type { Title } from '@/lib/types';

export default function TrailerModal({
  title,
  onClose,
}: {
  title: Title;
  onClose: () => void;
}) {
  const [youtubeId, setYoutubeId] = useState<string | undefined>(title.trailerYoutubeId);
  const [loading, setLoading] = useState(!title.trailerYoutubeId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (youtubeId || !title.tmdbId) return;
    setLoading(true);
    fetch(`/api/trailer/${title.tmdbId}`)
      .then((r) => r.json())
      .then((d: { youtubeId?: string }) => setYoutubeId(d.youtubeId))
      .finally(() => setLoading(false));
  }, [title.tmdbId, youtubeId]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white text-lg leading-none flex items-center justify-center"
        >
          ×
        </button>
        {loading ? (
          <div className="absolute inset-0 grid place-items-center text-zinc-400 text-sm">
            Loading trailer…
          </div>
        ) : youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={`${title.title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400 text-sm px-6 text-center">
            No trailer available for {title.title}.
          </div>
        )}
      </div>
    </div>
  );
}
