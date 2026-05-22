import Sidebar from '@/components/Sidebar';
import Hero from '@/components/Hero';
import Row from '@/components/Row';
import { getHeroTitles, getLandingRows } from '@/lib/sources';

export const revalidate = 3600;

export default async function HomePage() {
  const tmdbConfigured = Boolean(process.env.TMDB_API_KEY);
  const [heroes, rows] = await Promise.all([getHeroTitles('PH'), getLandingRows()]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {!tmdbConfigured && (
          <div className="px-6 md:px-10 lg:px-14 pt-4 text-amber-300 text-sm">
            TMDB_API_KEY is not set. Modern-title rows are disabled until you add it to
            <code className="mx-1 text-amber-200">.env.local</code>.
          </div>
        )}
        <Hero titles={heroes} />
        <div className="pb-16">
          {rows.length === 0 ? (
            <div className="px-6 md:px-10 lg:px-14 py-10 text-zinc-400">
              No catalog rows loaded. Check your API keys and network.
            </div>
          ) : (
            rows.map((row, i) => <Row key={row.key} row={row} index={i} />)
          )}
        </div>
      </main>
    </div>
  );
}
