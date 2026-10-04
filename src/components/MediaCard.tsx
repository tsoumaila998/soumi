import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check, Play } from 'lucide-react';
import { MediaItem } from '../data/types';
import { ImageWithFallback } from './ImageWithFallback';
import { useTranslation } from '../i18n/LanguageContext';
import { useMyList } from '../hooks/useMyList';
import { formatYear, formatRating } from '../utils/formatters';

interface MediaCardProps {
  item: MediaItem;
  onOpenTrailer?: (item: MediaItem) => void;
  className?: string;
  priority?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpenTrailer,
  className = '',
}) => {
  const { language, t, locale } = useTranslation();
  const { isInList, toggleInList } = useMyList();

  const isSaved = isInList(item.id, item.mediaType);
  const displayTitle = language === 'fr' ? item.titleFr || item.title : item.title;
  const targetRoute = item.mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const year = formatYear(item.releaseDate);
  const formattedRating = formatRating(item.rating, locale);
  const mediaLabel = item.mediaType === 'movie' ? t('details.movie') : t('details.tv');

  const handleToggleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleInList({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      titleFr: item.titleFr,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      rating: item.rating,
      releaseDate: item.releaseDate,
      genres: item.genres,
      overview: item.overview,
      overviewFr: item.overviewFr,
    });
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    if (onOpenTrailer) {
      e.preventDefault();
      e.stopPropagation();
      onOpenTrailer(item);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-[#16161d] rounded-xl overflow-hidden border border-white/5 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-white/20 hover:z-10 ${className}`}
    >
      {/* Poster Image Container */}
      <Link to={targetRoute} className="relative aspect-[2/3] w-full overflow-hidden block bg-[#101015] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded-t-xl">
        <ImageWithFallback
          src={item.posterUrl}
          alt={`${displayTitle} poster`}
          fallbackTitle={displayTitle}
          isPoster={true}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-semibold tabular-nums shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{formattedRating}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleList}
            title={isSaved ? t('details.removeFromList') : t('details.addToList')}
            aria-label={isSaved ? `${t('details.removeFromList')} - ${displayTitle}` : `${t('details.addToList')} - ${displayTitle}`}
            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
              isSaved
                ? 'bg-[#e50914] text-white hover:bg-[#b80710]'
                : 'bg-black/70 text-white/90 hover:bg-white hover:text-black border border-white/20'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          {onOpenTrailer && (
            <button
              onClick={handlePlayClick}
              className="p-3.5 rounded-full bg-[#e50914] text-white hover:scale-110 active:scale-95 transition-transform duration-200 shadow-xl flex items-center justify-center group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={t('hero.watchTrailer')}
              aria-label={`${t('hero.watchTrailer')} - ${displayTitle}`}
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
          )}
        </div>
      </Link>

      {/* Card Info Details */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-[#16161d]">
        <Link to={targetRoute} className="group-hover:text-[#e50914] transition-colors">
          <h3 className="font-semibold text-sm text-zinc-100 line-clamp-1 leading-snug tracking-normal" title={displayTitle}>
            {displayTitle}
          </h3>
        </Link>

        {/* Clean Typographic Metadata */}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
          <span>{year}</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>{mediaLabel}</span>
          {item.genres?.[0] && (
            <>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="truncate max-w-[80px]">
                {t(`genres.${item.genres[0]}`) || item.genres[0]}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
