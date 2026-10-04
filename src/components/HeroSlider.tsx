import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Plus, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { MediaItem } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';
import { useMyList } from '../hooks/useMyList';
import { formatYear, formatRating, formatRuntime } from '../utils/formatters';

interface HeroSliderProps {
  items: MediaItem[];
  onOpenTrailer: (item: MediaItem) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ items, onOpenTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language, t, locale } = useTranslation();
  const { isInList, toggleInList } = useMyList();
  const timerRef = useRef<number | null>(null);

  const slides = items.slice(0, 5);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = window.setInterval(goToNext, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length, goToNext]);

  if (!slides || slides.length === 0) return null;

  const current = slides[currentIndex];
  const displayTitle = language === 'fr' ? current.titleFr || current.title : current.title;
  const displayOverview = language === 'fr' ? current.overviewFr || current.overview : current.overview;
  const isSaved = isInList(current.id, current.mediaType);
  const targetRoute = current.mediaType === 'movie' ? `/movie/${current.id}` : `/tv/${current.id}`;
  const year = formatYear(current.releaseDate);
  const ratingFormatted = formatRating(current.rating, locale);
  const runtimeFormatted = current.runtime ? formatRuntime(current.runtime, locale) : (current.seasons ? `${current.seasons} ${current.seasons > 1 ? t('details.seasonPlural') : t('details.seasonSingle')}` : '');

  const handleToggleList = () => {
    toggleInList({
      id: current.id,
      mediaType: current.mediaType,
      title: current.title,
      titleFr: current.titleFr,
      posterUrl: current.posterUrl,
      backdropUrl: current.backdropUrl,
      rating: current.rating,
      releaseDate: current.releaseDate,
      genres: current.genres,
      overview: current.overview,
      overviewFr: current.overviewFr,
    });
  };

  return (
    <div
      className="relative w-full h-[68vh] min-h-[520px] max-h-[750px] overflow-hidden bg-[#0a0a0f]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrops with crossfade */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.backdropUrl}
            alt={`${(language === 'fr' && slide.titleFr) ? slide.titleFr : slide.title} backdrop`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.85]"
          />
        </div>
      ))}

      {/* Measured Gradient Scrim Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/75 to-transparent max-w-4xl z-10" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0a0a0f]/40 to-[#0a0a0f] z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-end pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-4">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#e50914] text-white text-xs font-bold uppercase tracking-wider">
              {t('hero.trendingBadge')}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
              <Star className="w-4 h-4 fill-amber-400" />
              {ratingFormatted}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{year}</span>
            {runtimeFormatted && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>{runtimeFormatted}</span>
              </>
            )}
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">
              {current.genres.slice(0, 3).map((g) => t(`genres.${g}`) || g).join(' / ')}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white line-clamp-2 drop-shadow-md text-balance">
            {displayTitle}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {displayOverview}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenTrailer(current)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#e50914]/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('hero.watchTrailer')}</span>
            </button>

            <Link
              to={targetRoute}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md border border-white/15 transition-all duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Info className="w-4 h-4 text-zinc-300" />
              <span>{t('hero.viewDetails')}</span>
            </Link>

            <button
              onClick={handleToggleList}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-md transition-all duration-200 border whitespace-nowrap ${
                isSaved
                  ? 'bg-zinc-800/90 text-white border-zinc-700 hover:bg-zinc-700'
                  : 'bg-black/50 text-zinc-200 border-white/10 hover:bg-black/70 hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-[#e50914]" />
                  <span>{t('hero.inList')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{t('hero.addToList')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Dots */}
        <div className="absolute right-4 sm:right-8 bottom-16 z-30 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${t('pagination.page')} ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-[#e50914]' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              aria-label={t('hero.slidePrev')}
              className="p-2 rounded-lg bg-black/40 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              aria-label={t('hero.slideNext')}
              className="p-2 rounded-lg bg-black/40 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
