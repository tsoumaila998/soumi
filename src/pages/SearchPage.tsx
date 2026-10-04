import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Film } from 'lucide-react';
import { searchMedia, getMovieVideos, getTVVideos } from '../services/tmdb';
import { MediaCard } from '../components/MediaCard';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { TrailerModal } from '../components/TrailerModal';
import { MediaItem } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';

export const SearchPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);

  usePageSEO({
    title: query.trim()
      ? `${query.trim()} — ${language === 'fr' ? 'Recherche' : 'Search'} — SOUMI`
      : language === 'fr' ? 'SOUMI — Recherche' : 'SOUMI — Search',
    description: language === 'fr'
      ? 'Recherchez des films, séries et acteurs dans le catalogue SOUMI.'
      : 'Search movies, TV shows, and cast across the SOUMI catalog.',
  });
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Trailer modal state
  const [activeTrailerItem, setActiveTrailerItem] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  // Sync state with URL parameter if it changes from navbar
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    if (urlQ !== query) {
      setQuery(urlQ);
    }
  }, [searchParams]);

  // Execute search when query or language or filter changes
  useEffect(() => {
    let isMounted = true;
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMedia(query.trim(), filterType, 1, language);
        if (isMounted) {
          setResults(data.results);
          setTotalResults(data.total_results);
        }
      } catch (err) {
        console.error('Failed to search TMDb:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, filterType, language]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  const handleSelectKeyword = (keyword: string) => {
    setQuery(keyword);
    setSearchParams({ q: keyword }, { replace: true });
  };

  const handleOpenTrailer = async (item: MediaItem) => {
    setActiveTrailerItem(item);
    setTrailerKey(item.trailerYoutubeId || null);

    try {
      const key = item.mediaType === 'movie'
        ? await getMovieVideos(item.id, language)
        : await getTVVideos(item.id, language);
      setTrailerKey(key || item.trailerYoutubeId || null);
    } catch (e) {
      console.error('Failed to load trailer:', e);
    }
  };

  const handleCloseTrailer = () => {
    setActiveTrailerItem(null);
    setTrailerKey(null);
  };

  const popularKeywords = ['Avatar', 'Dune', 'Oppenheimer', 'Shōgun', 'Sci-Fi', 'Stranger Things', 'Action', 'Anime'];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {t('search.title')}
        </h1>
        <p className="text-sm text-zinc-400">
          {t('search.subtitle')}
        </p>
      </div>

      {/* Large Search Input */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={t('search.inputPlaceholder')}
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 bg-[#16161d] text-white text-base rounded-2xl border border-white/10 focus:border-[#e50914] focus:outline-none focus:ring-1 focus:ring-[#e50914] transition-all shadow-xl"
          />
          {query && (
            <button
              onClick={handleClear}
              aria-label={t('search.clearSearch')}
              className="absolute right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Popular Keyword Suggestions */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-400 no-scrollbar">
          <span className="shrink-0 text-zinc-500 font-medium">
            {t('search.popularSearches')}
          </span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => handleSelectKeyword(kw)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors shrink-0"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs if query is active */}
      {query.trim() && (
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterType === 'all'
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow'
                  : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {t('search.filterAll')}
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterType === 'movie'
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow'
                  : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {t('search.filterMovies')}
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterType === 'tv'
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow'
                  : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {t('search.filterTv')}
            </button>
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            {t('catalog.resultsCount', { count: totalResults })}
          </span>
        </div>
      )}

      {/* Search Content */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : query.trim() ? (
        results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item) => (
              <MediaCard
                key={`${item.mediaType}-${item.id}`}
                item={item}
                onOpenTrailer={handleOpenTrailer}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={t('search.noResultsTitle')}
            description={t('search.noResultsDesc', { query })}
            actionText={t('search.clearSearch')}
            onAction={handleClear}
          />
        )
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <Film className="w-12 h-12 mx-auto mb-3 text-zinc-700 animate-pulse" />
          <p className="text-sm font-medium">{t('search.typeToSearch')}</p>
        </div>
      )}

      {/* Trailer Modal */}
      {activeTrailerItem && (
        <TrailerModal
          isOpen={true}
          onClose={handleCloseTrailer}
          trailerId={trailerKey || undefined}
          title={
            language === 'fr'
              ? activeTrailerItem.titleFr || activeTrailerItem.title
              : activeTrailerItem.title
          }
        />
      )}
    </div>
  );
};
