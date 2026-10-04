import React, { useState, useEffect } from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { SectionRow } from '../components/SectionRow';
import { TrailerModal } from '../components/TrailerModal';
import { HeroSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { MediaItem } from '../data/types';
import {
  getTrendingMovies,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieVideos,
  getTVVideos,
} from '../services/tmdb';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';

export const HomePage: React.FC = () => {
  const { t, language } = useTranslation();
  usePageSEO({
    title: 'SOUMI — Movies, TV Shows & Where to Watch',
    description: 'Discover movies and TV shows, explore trailers, ratings, cast, genres, upcoming releases and find where to watch.',
  });
  const [loading, setLoading] = useState(true);
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [comingSoon, setComingSoon] = useState<MediaItem[]>([]);

  // Trailer modal state
  const [activeTrailerItem, setActiveTrailerItem] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeContent() {
      setLoading(true);
      try {
        const [trending, popMovies, popTv, top, coming] = await Promise.all([
          getTrendingMovies(language),
          getPopularMovies(language),
          getPopularTV(language),
          getTopRatedMovies(language),
          getUpcomingMovies(language),
        ]);

        if (isMounted) {
          setTrendingItems(trending);
          setPopularMovies(popMovies);
          setPopularTv(popTv);
          setTopRated(top);
          setComingSoon(coming);
        }
      } catch (err) {
        console.error('Failed to load home page media:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeContent();
    return () => {
      isMounted = false;
    };
  }, [language]);

  const handleOpenTrailer = async (item: MediaItem) => {
    setActiveTrailerItem(item);
    setTrailerKey(item.trailerYoutubeId || null);

    // Fetch live YouTube trailer if not already on the item
    try {
      const key = item.mediaType === 'movie'
        ? await getMovieVideos(item.id, language)
        : await getTVVideos(item.id, language);
      setTrailerKey(key || item.trailerYoutubeId || null);
    } catch (e) {
      console.error('Failed to fetch trailer:', e);
    }
  };

  const handleCloseTrailer = () => {
    setActiveTrailerItem(null);
    setTrailerKey(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white pb-16">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
          <div className="space-y-4">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-16">
      {/* Hero Section */}
      <HeroSlider items={trendingItems} onOpenTrailer={handleOpenTrailer} />

      {/* Section Rows */}
      <div className="-mt-10 sm:-mt-14 relative z-20 space-y-4">
        <SectionRow
          title={t('sections.trendingThisWeek')}
          items={trendingItems}
          onOpenTrailer={handleOpenTrailer}
        />

        <SectionRow
          title={t('sections.popularMovies')}
          items={popularMovies}
          viewAllLink="/movies"
          onOpenTrailer={handleOpenTrailer}
        />

        <SectionRow
          title={t('sections.popularTvShows')}
          items={popularTv}
          viewAllLink="/tv"
          onOpenTrailer={handleOpenTrailer}
        />

        <SectionRow
          title={t('sections.topRated')}
          items={topRated}
          onOpenTrailer={handleOpenTrailer}
        />

        <SectionRow
          title={t('sections.comingSoon')}
          items={comingSoon}
          onOpenTrailer={handleOpenTrailer}
        />
      </div>

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
