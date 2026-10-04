import React, { useState, useEffect } from 'react';
import { getTVShows, getTVGenres, getTVVideos, GenreItem } from '../services/tmdb';
import { MediaCard } from '../components/MediaCard';
import { GenreFilter } from '../components/GenreFilter';
import { SortFilter, SortOption } from '../components/SortFilter';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { TrailerModal } from '../components/TrailerModal';
import { MediaItem } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';
import { Tv } from 'lucide-react';

export const TvShowsPage: React.FC = () => {
  const { t, language } = useTranslation();
  usePageSEO({
    title: language === 'fr' ? 'SOUMI — Séries TV' : 'SOUMI — TV Shows',
    description: language === 'fr'
      ? 'Explorez les séries télévisées populaires, drames acclamés et documentaires sur SOUMI.'
      : 'Explore popular TV shows, trending drama, series, and episode details on SOUMI.',
  });
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [currentSort, setCurrentSort] = useState<SortOption>('popularity');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Trailer modal state
  const [activeTrailerItem, setActiveTrailerItem] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  // Load TV genres when language changes
  useEffect(() => {
    let isMounted = true;
    async function loadGenres() {
      try {
        const list = await getTVGenres(language);
        if (isMounted) setGenres(list);
      } catch (e) {
        console.error('Failed to load TV genres:', e);
      }
    }
    loadGenres();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Load TV shows with filters, sorting, and pagination
  useEffect(() => {
    let isMounted = true;
    async function loadTV() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTVShows(
          {
            genreId: selectedGenre !== 'all' ? selectedGenre : undefined,
            sortBy: currentSort,
            page: currentPage,
          },
          language
        );

        if (isMounted) {
          setTvShows(data.results);
          setTotalPages(Math.min(data.total_pages, 500));
          setTotalResults(data.total_results);
        }
      } catch (err) {
        console.error('Failed to load discover TV shows:', err);
        if (isMounted) {
          setError(t('state.unableToLoadTvShows'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTV();
    return () => {
      isMounted = false;
    };
  }, [selectedGenre, currentSort, currentPage, language, t]);

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    setCurrentPage(1);
  };

  const handleOpenTrailer = async (item: MediaItem) => {
    setActiveTrailerItem(item);
    setTrailerKey(item.trailerYoutubeId || null);

    try {
      const key = await getTVVideos(item.id, language);
      setTrailerKey(key || item.trailerYoutubeId || null);
    } catch (e) {
      console.error('Failed to load TV trailer:', e);
    }
  };

  const handleCloseTrailer = () => {
    setActiveTrailerItem(null);
    setTrailerKey(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {t('catalog.tvTitle')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          {t('catalog.tvSubtitle')}
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
        <GenreFilter
          genres={genres}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreChange}
        />

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <span className="text-xs text-zinc-500 font-medium">
            {t('catalog.resultsCount', { count: totalResults })}
          </span>
          <SortFilter currentSort={currentSort} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* TV Grid, Error, or Loading Skeleton */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : error ? (
        <ErrorMessage
          title={t('state.errorTitle')}
          message={error}
          onRetry={() => {
            setError(null);
            setCurrentPage(1);
          }}
        />
      ) : tvShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {tvShows.map((tv) => (
            <MediaCard
              key={tv.id}
              item={tv}
              onOpenTrailer={handleOpenTrailer}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tv}
          title={t('catalog.noMatches')}
          description={t('catalog.resetFilters')}
          actionText={t('catalog.resetFilters')}
          onAction={() => handleGenreChange('all')}
        />
      )}

      {/* Pagination */}
      {!loading && tvShows.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
