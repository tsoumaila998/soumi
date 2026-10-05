import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Search,
  ArrowUpDown,
  Download,
  Calendar,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Video,
} from 'lucide-react';
import {
  searchPublicDomainMovies,
  getThumbnailUrl,
  cleanArchiveText,
  formatCreator,
  ArchiveDoc,
} from '../services/archiveService';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';

export const FreeMoviesPage: React.FC = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  usePageSEO({
    title:
      language === 'fr'
        ? 'SOUMI — Films gratuits du domaine public'
        : 'SOUMI — Free Movies — Public Domain Collection',
    description:
      language === 'fr'
        ? 'Regardez des milliers de films légalement gratuits du domaine public via Archive.org.'
        : 'Watch thousands of legally free public domain classic films from Archive.org.',
  });

  const [docs, setDocs] = useState<ArchiveDoc[]>([]);
  const [numFound, setNumFound] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [queryInput, setQueryInput] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [sort, setSort] = useState<string>('popular');
  const [loading, setLoading] = useState<boolean>(true);

  const pageSize = 24;
  const totalPages = Math.min(100, Math.ceil(numFound / pageSize)) || 1;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    searchPublicDomainMovies(currentPage, activeQuery, sort)
      .then((res) => {
        if (!isMounted) return;
        setDocs(res.docs);
        setNumFound(res.numFound);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setDocs([]);
        setNumFound(0);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, activeQuery, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(queryInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setQueryInput('');
    setActiveQuery('');
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const formatDownloads = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header Banner */}
      <div className="relative mb-10 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#161622] via-[#12121a] to-[#0a0a0f] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#e50914]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 text-[#e50914] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('freeMovies.publicDomainBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-['Outfit']">
            {t('freeMovies.title')}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {t('freeMovies.subtitle')}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={t('freeMovies.search')}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#161622] hover:bg-[#1a1a28] focus:bg-[#1a1a28] text-white placeholder-zinc-500 rounded-xl border border-white/10 focus:border-[#e50914] focus:outline-none transition-all shadow-inner"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          {queryInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#161622] border border-white/10">
            {[
              { key: 'popular', label: t('freeMovies.sort.popular') },
              { key: 'newest', label: t('freeMovies.sort.newest') },
              { key: 'oldest', label: t('freeMovies.sort.oldest') },
              { key: 'az', label: t('freeMovies.sort.az') },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSortChange(option.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === option.key
                    ? 'bg-[#e50914] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      {!loading && (
        <div className="mb-6 flex items-center justify-between text-xs text-zinc-400">
          <p>
            {activeQuery ? (
              <span>
                Found <strong className="text-white">{numFound.toLocaleString()}</strong> results for "{activeQuery}"
              </span>
            ) : (
              <span>
                Showing <strong className="text-white">{numFound.toLocaleString()}</strong> public domain films
              </span>
            )}
          </p>
          <p>
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[2/3] bg-white/5 rounded-2xl border border-white/5" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Loaded Movies Grid */}
      {!loading && docs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {docs.map((doc) => {
            const thumbnailUrl = getThumbnailUrl(doc.identifier);
            const creator = formatCreator(doc.creator);
            const rawDesc = cleanArchiveText(doc.description);

            return (
              <Link
                key={doc.identifier}
                to={`/free-movies/${encodeURIComponent(doc.identifier)}`}
                className="group flex flex-col bg-[#161622]/80 hover:bg-[#1c1c2b] border border-white/10 hover:border-[#e50914]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#e50914]/10"
              >
                {/* Poster / Thumbnail Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#101018]">
                  <ImageWithFallback
                    src={thumbnailUrl}
                    alt={doc.title}
                    fallbackTitle={doc.title}
                    isPoster={true}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-[#e50914]/50 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Badges on poster */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e50914] text-white shadow-md uppercase tracking-wider">
                      Free
                    </span>
                  </div>

                  {doc.downloads !== undefined && doc.downloads > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-xs text-[10px] font-semibold text-zinc-300 border border-white/10">
                      <Download className="w-2.5 h-2.5 text-[#e50914]" />
                      <span>{formatDownloads(doc.downloads)}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e50914] transition-colors line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>

                    {creator && (
                      <p className="text-xs text-zinc-400 truncate mt-1">
                        {creator}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-zinc-400">
                    {doc.year ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{String(doc.year).slice(0, 4)}</span>
                      </span>
                    ) : (
                      <span>Classic</span>
                    )}

                    <span className="text-[#e50914] font-semibold flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      <span>{t('freeMovies.watchNow')}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && docs.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#161622] border border-white/10 text-center space-y-4 my-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {t('freeMovies.empty')}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            {activeQuery
              ? `No public domain titles matched "${activeQuery}". Try another keyword like "chaplin", "horror", or "western".`
              : 'There are currently no items available for this selection.'}
          </p>
          {activeQuery && (
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold transition-all shadow-lg shadow-[#e50914]/20"
            >
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161622] hover:bg-[#1f1f2e] text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161622] hover:bg-[#1f1f2e] text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 text-xs font-semibold transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
