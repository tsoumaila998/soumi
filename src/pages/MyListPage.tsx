import React, { useState, useMemo } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useMyList } from '../hooks/useMyList';
import { MediaCard } from '../components/MediaCard';
import { EmptyState } from '../components/EmptyState';
import { TrailerModal } from '../components/TrailerModal';
import { MediaItem } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';
import { getMovieVideos, getTVVideos } from '../services/tmdb';

export const MyListPage: React.FC = () => {
  const { t, language } = useTranslation();
  usePageSEO({
    title: language === 'fr' ? 'SOUMI — Ma Liste' : 'SOUMI — My List',
    description: language === 'fr'
      ? 'Votre liste personnalisée de films et séries enregistrés sur SOUMI.'
      : 'Your personal curated watchlist of saved movies and series on SOUMI.',
  });
  const { myList, clearList } = useMyList();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [activeTrailerItem, setActiveTrailerItem] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const moviesCount = useMemo(() => myList.filter((i) => i.mediaType === 'movie').length, [myList]);
  const tvCount = useMemo(() => myList.filter((i) => i.mediaType === 'tv').length, [myList]);

  const filteredList = useMemo(() => {
    if (filterType === 'all') return myList;
    return myList.filter((item) => item.mediaType === filterType);
  }, [myList, filterType]);

  const handleClearAll = () => {
    if (window.confirm(t('myList.confirmClear'))) {
      clearList();
    }
  };

  const handleOpenTrailer = async (item: MediaItem) => {
    setActiveTrailerItem(item);
    setTrailerKey(item.trailerYoutubeId || null);

    try {
      const key = item.mediaType === 'movie'
        ? await getMovieVideos(item.id, language)
        : await getTVVideos(item.id, language);
      setTrailerKey(key || item.trailerYoutubeId || null);
    } catch {
      setTrailerKey(item.trailerYoutubeId || null);
    }
  };

  const handleCloseTrailer = () => {
    setActiveTrailerItem(null);
    setTrailerKey(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-[#e50914] fill-current" />
            <span>{t('myList.title')}</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            {t('myList.subtitle')}
          </p>
        </div>

        {myList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-900/40 transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('myList.clearList')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {myList.length > 0 && (
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
              {t('myList.filterAll')} ({myList.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterType === 'movie'
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow'
                  : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {t('myList.filterMovies', { count: moviesCount })}
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterType === 'tv'
                  ? 'bg-[#e50914] text-white border-[#e50914] shadow'
                  : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {t('myList.filterTv', { count: tvCount })}
            </button>
          </div>

          <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
            {t('myList.savedCount', { count: filteredList.length })}
          </span>
        </div>
      )}

      {/* Saved Grid or Empty State */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredList.map((item) => {
            const mediaItem: MediaItem = {
              id: item.id,
              mediaType: item.mediaType,
              title: item.title,
              titleFr: item.titleFr || item.title,
              releaseDate: item.releaseDate,
              rating: item.rating,
              voteCount: 0,
              genres: item.genres || [],
              overview: item.overview || '',
              overviewFr: item.overviewFr || item.overview || '',
              posterUrl: item.posterUrl,
              backdropUrl: item.backdropUrl,
              trailerYoutubeId: 'Way_3On44TW0',
              cast: [],
              status: 'Released',
            };

            return (
              <div key={`${item.mediaType}-${item.id}`} className="relative group">
                <MediaCard
                  item={mediaItem}
                  onOpenTrailer={handleOpenTrailer}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title={t('myList.emptyTitle')}
          description={t('myList.emptyDesc')}
          actionText={t('myList.browseMovies')}
          actionLink="/movies"
        />
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
