import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../data/types';
import { MediaCard } from './MediaCard';
import { useTranslation } from '../i18n/LanguageContext';

interface SectionRowProps {
  title: string;
  items: MediaItem[];
  viewAllLink?: string;
  onOpenTrailer?: (item: MediaItem) => void;
}

export const SectionRow: React.FC<SectionRowProps> = ({
  title,
  items,
  viewAllLink,
  onOpenTrailer,
}) => {
  const { t } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{title}</span>
        </h2>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1 group/link"
          >
            <span>{t('sections.viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Row container with arrows */}
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label={`${t('pagination.previous')} - ${title}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 sm:-ml-4 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-[#e50914]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable track */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={`${item.mediaType}-${item.id}`}
              className="flex-none w-[160px] sm:w-[190px] md:w-[210px] lg:w-[220px] snap-start"
            >
              <MediaCard item={item} onOpenTrailer={onOpenTrailer} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label={`${t('pagination.next')} - ${title}`}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 sm:-mr-4 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-[#e50914]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};
