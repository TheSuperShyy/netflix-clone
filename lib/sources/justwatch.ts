export function justWatchUrlFor(title: string, year?: number): string {
  const locale = process.env.JUSTWATCH_LOCALE || 'us';
  const q = encodeURIComponent(year ? `${title} ${year}` : title);
  return `https://www.justwatch.com/${locale}/search?q=${q}`;
}
