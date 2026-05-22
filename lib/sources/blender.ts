import type { Title, StreamSource } from '@/lib/types';

type BlenderFilm = {
  id: string;
  title: string;
  year: number;
  overview: string;
  archiveIdentifier: string;
  streamPath: string;
  trailerYoutubeId?: string;
};

const BLENDER_FILMS: BlenderFilm[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    year: 2008,
    overview:
      'A peaceful giant rabbit takes revenge on three bullying rodents in this classic Blender open movie.',
    archiveIdentifier: 'BigBuckBunny_124',
    streamPath: 'Content/big_buck_bunny_720p_surround.mp4',
    trailerYoutubeId: 'YE7VzlLtp-4',
  },
  {
    id: 'sintel',
    title: 'Sintel',
    year: 2010,
    overview:
      'A lonely young woman searches for the baby dragon she befriended in this Blender open movie.',
    archiveIdentifier: 'Sintel',
    streamPath: 'sintel-2048-stereo.mp4',
    trailerYoutubeId: 'eRsGyueVLvQ',
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    year: 2012,
    overview:
      'A group of warriors and scientists must save the world from destruction by giant robots in this sci-fi Blender open movie.',
    archiveIdentifier: 'tears-of-steel_202604',
    streamPath: 'Tears of Steel.ia.mp4',
    trailerYoutubeId: 'R6MlUcmOul8',
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream',
    year: 2006,
    overview:
      'The first Blender open movie: two characters explore a strange mechanical world.',
    archiveIdentifier: 'ElephantsDream',
    streamPath: 'ed_1024_512kb.mp4',
    trailerYoutubeId: 'TLkA0RELQ1g',
  },
];

export function getBlenderCatalog(): Title[] {
  return BLENDER_FILMS.map(filmToTitle);
}

export function resolveBlender(id: string): Title | null {
  const film = BLENDER_FILMS.find((f) => f.id === id);
  return film ? filmToTitle(film) : null;
}

function filmToTitle(film: BlenderFilm): Title {
  const posterUrl = `https://archive.org/services/img/${film.archiveIdentifier}`;
  const streamUrl = `https://archive.org/download/${film.archiveIdentifier}/${encodeURIComponent(film.streamPath)}`;
  const streams: StreamSource[] = [
    { label: 'Server 1 — Internet Archive (MP4)', kind: 'mp4', url: streamUrl },
  ];
  return {
    id: film.id,
    source: 'blender',
    title: film.title,
    year: film.year,
    poster: posterUrl,
    backdrop: posterUrl,
    overview: film.overview,
    trailerYoutubeId: film.trailerYoutubeId,
    streams,
  };
}
