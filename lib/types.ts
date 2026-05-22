export type Source = 'archive' | 'blender' | 'pluto' | 'tmdb';

export type StreamKind = 'hls' | 'mp4' | 'iframe';

export type StreamSource = {
  label: string;
  kind: StreamKind;
  url: string;
};

export type Subtitle = {
  lang: string;
  label: string;
  url: string;
};

export type Title = {
  id: string;
  source: Source;
  title: string;
  year?: number;
  rating?: number;
  poster: string;
  backdrop?: string;
  overview: string;
  trailerYoutubeId?: string;
  streams?: StreamSource[];
  subtitles?: Subtitle[];
  justWatchUrl?: string;
  imdbId?: string;
  tmdbId?: number;
  mediaType?: 'movie' | 'tv';
  genres?: string[];
  certification?: string;
  runtimeMinutes?: number;
  releaseDate?: string;
  tagline?: string;
};

export type RowKey =
  | 'hero'
  | 'new-this-week'
  | 'trending'
  | 'classics'
  | 'open-movies'
  | 'pluto-live';

export type CatalogRow = {
  key: RowKey;
  label: string;
  titles: Title[];
};
