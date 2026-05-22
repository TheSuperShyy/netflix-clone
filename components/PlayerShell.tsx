'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  Track,
  type MediaPlayerInstance,
} from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import type { Title, StreamSource, Subtitle } from '@/lib/types';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function PlayerShell({ title }: { title: Title }) {
  const streams = title.streams ?? [];
  const subtitles = title.subtitles ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const resumeAtRef = useRef<number | null>(null);

  const current: StreamSource | undefined = streams[activeIndex];

  useEffect(() => {
    if (resumeAtRef.current == null) return;
    const player = playerRef.current;
    if (!player) return;
    const target = resumeAtRef.current;
    const onCanPlay = () => {
      player.currentTime = target;
      void player.play().catch(() => {});
      resumeAtRef.current = null;
      player.removeEventListener('can-play', onCanPlay);
    };
    player.addEventListener('can-play', onCanPlay);
    return () => player.removeEventListener('can-play', onCanPlay);
  }, [activeIndex]);

  const switchServer = (next: number) => {
    if (next === activeIndex) return;
    const player = playerRef.current;
    resumeAtRef.current = player?.currentTime ?? 0;
    setActiveIndex(next);
  };

  if (!current) {
    return (
      <div className="aspect-video w-full grid place-items-center bg-zinc-900 text-zinc-400 text-sm">
        No playable stream available for this title.
      </div>
    );
  }

  const srcType = current.kind === 'hls' ? 'application/x-mpegurl' : 'video/mp4';

  return (
    <div className="w-full">
      <MediaPlayer
        ref={playerRef}
        title={title.title}
        src={{ src: current.url, type: srcType }}
        playsInline
        crossOrigin
        className="w-full aspect-video bg-black"
      >
        <MediaProvider />
        {subtitles.map((s, i) => (
          <Track
            key={s.url}
            kind="subtitles"
            src={s.url}
            language={s.lang}
            label={s.label}
            default={i === 0}
          />
        ))}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {streams.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 px-1 py-3 text-sm">
          <span className="text-zinc-400 mr-1">Server:</span>
          {streams.map((s, i) => (
            <button
              key={s.url}
              onClick={() => switchServer(i)}
              className={
                'px-3 py-1.5 rounded-full border transition-colors ' +
                (i === activeIndex
                  ? 'bg-brand-red border-brand-red text-white'
                  : 'bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10')
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <SubtitleStatus subtitles={subtitles} />
    </div>
  );
}

function SubtitleStatus({ subtitles }: { subtitles: Subtitle[] }) {
  if (subtitles.length === 0) {
    return (
      <p className="px-1 text-xs text-zinc-500">
        No subtitles found. (Set <code className="text-zinc-300">OPENSUBTITLES_API_KEY</code> in
        <code className="text-zinc-300"> .env.local</code> and reload to enable.)
      </p>
    );
  }
  return (
    <p className="px-1 text-xs text-zinc-500">
      {subtitles.length} subtitle track{subtitles.length === 1 ? '' : 's'} available —
      open the CC menu in the player controls.
    </p>
  );
}
