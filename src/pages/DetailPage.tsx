import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, ArrowLeft, Layers } from 'lucide-react';
import {
  getMovieDetails,
  getTVDetails,
  getMovieCredits,
  getTVCredits,
  getMovieVideos,
  getTVVideos,
  getSimilarMovies,
  getSimilarTV,
} from '../services/tmdb';
import { CastList } from '../components/CastList';
import { MediaCard } from '../components/MediaCard';
import { TrailerModal } from '../components/TrailerModal';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { MediaItem, CastMember } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';
import { useMyList } from '../hooks/useMyList';
import { formatYear, formatRating, formatRuntime, formatDate, formatNumber } from '../utils/formatters';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, t, locale } = useTranslation();
  const { isInList, toggleInList } = useMyList();

  const isMovie = location.pathname.startsWith('/movie');
  const mediaType = isMovie ? 'movie' : 'tv';

  const [item, setItem] = useState<MediaItem | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [similarTrailerItem, setSimilarTrailerItem] = useState<MediaItem | null>(null);
  const [similarTrailerKey, setSimilarTrailerKey] = useState<string | null>(null);

  const displayTitle = item ? (language === 'fr' ? item.titleFr || item.title : item.title) : '';
  const displayOverview = item ? (language === 'fr' ? item.overviewFr || item.overview : item.overview) : '';

  usePageSEO({
    title: displayTitle ? `${displayTitle} — SOUMI` : 'SOUMI — Movies & TV Shows',
    description: displayOverview || (displayTitle ? `Explore trailers, cast, ratings, and details for ${displayTitle} on SOUMI.` : undefined),
    image: item?.backdropUrl || item?.posterUrl,
    type: item?.mediaType === 'tv' ? 'video.tv_show' : 'video.movie',
  });

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    async function loadDetails() {
      setLoading(true);
      setError(null);

      try {
        if (isMovie) {
          const [movieData, credits, videos, similar] = await Promise.all([
            getMovieDetails(id!, language),
            getMovieCredits(id!, language),
            getMovieVideos(id!, language),
            getSimilarMovies(id!, language),
          ]);

          if (isMounted) {
            setItem(movieData);
            setCast(credits);
            setTrailerKey(videos);
            setSimilarItems(similar);
          }
        } else {
          const [tvData, credits, videos, similar] = await Promise.all([
            getTVDetails(id!, language),
            getTVCredits(id!, language),
            getTVVideos(id!, language),
            getSimilarTV(id!, language),
          ]);

          if (isMounted) {
            setItem(tvData);
            setCast(credits);
            setTrailerKey(videos);
            setSimilarItems(similar);
          }
        }
      } catch (err: any) {
        console.error('Error loading media details:', err);
        if (isMounted) {
          setError(
            isMovie
              ? t('state.unableToLoadMovie')
              : t('state.unableToLoadTv')
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [id, isMovie, language, t]);

  const handleOpenSimilarTrailer = async (similar: MediaItem) => {
    setSimilarTrailerItem(similar);
    try {
      const key = similar.mediaType === 'movie'
        ? await getMovieVideos(similar.id, language)
        : await getTVVideos(similar.id, language);
      setSimilarTrailerKey(key || similar.trailerYoutubeId || null);
    } catch {
      setSimilarTrailerKey(similar.trailerYoutubeId || null);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white pt-32 px-4">
        <ErrorMessage
          title={t('state.errorTitle')}
          message={error || t('state.notFoundDesc')}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const isSaved = isInList(item.id, item.mediaType);
  const formattedRating = formatRating(item.rating, locale);
  const formattedDate = formatDate(item.releaseDate, locale);
  const year = formatYear(item.releaseDate);
  const runtimeFormatted = item.runtime ? formatRuntime(item.runtime, locale) : '';

  const handleToggleList = () => {
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Backdrop Section with Gradient Scrims */}
      <div className="relative w-full h-[60vh] min-h-[460px] max-h-[620px] overflow-hidden bg-[#0d0d12]">
        <img
          src={item.backdropUrl || item.posterUrl}
          alt={`${displayTitle} backdrop`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.75]"
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent max-w-4xl z-10" />

        {/* Back Button */}
        <div className="absolute top-20 left-4 sm:left-8 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 text-xs font-semibold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('state.backHome')}</span>
          </button>
        </div>
      </div>

      {/* Main Details Presentation (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-56 pb-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Poster Card */}
          <div className="w-48 sm:w-64 md:w-72 lg:w-80 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#16161d]">
            <ImageWithFallback
              src={item.posterUrl}
              alt={`${displayTitle} poster`}
              fallbackTitle={displayTitle}
              isPoster={true}
              className="aspect-[2/3] w-full"
            />
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-6 pt-2 md:pt-6">
            {/* Title & Original Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  {item.mediaType === 'movie' ? t('details.movie') : t('details.tv')}
                </span>
                <span>{item.status === 'Upcoming' ? t('details.statusUpcoming') : t('details.statusReleased')}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-balance">
                {displayTitle}
              </h1>

              {item.originalTitle && item.originalTitle !== displayTitle && (
                <p className="text-sm text-zinc-400 mt-1 italic">
                  {item.originalTitle}
                </p>
              )}
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 font-bold tabular-nums">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{formattedRating}</span>
                {item.voteCount > 0 && (
                  <span className="text-xs font-normal text-amber-200/70">
                    ({formatNumber(item.voteCount, locale)})
                  </span>
                )}
              </div>

              <span aria-hidden="true" className="text-zinc-600">·</span>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{formattedDate || year}</span>
              </div>

              {item.mediaType === 'movie' && runtimeFormatted && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{runtimeFormatted}</span>
                  </div>
                </>
              )}

              {item.mediaType === 'tv' && item.seasons !== undefined && item.seasons > 0 && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-zinc-400" />
                    <span>
                      {item.seasons} {item.seasons > 1 ? t('details.seasonPlural') : t('details.seasonSingle')}
                    </span>
                    {item.episodes !== undefined && item.episodes > 0 && (
                      <span className="text-zinc-500 text-xs">
                        ({item.episodes} {t('details.episodeCount')})
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Genres Tag List */}
            <div className="flex flex-wrap gap-2">
              {item.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300"
                >
                  {t(`genres.${g}`) !== `genres.${g}` ? t(`genres.${g}`) : g}
                </span>
              ))}
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setTrailerOpen(true)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-sm font-bold transition-all shadow-xl shadow-[#e50914]/30 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('details.watchTrailer')}</span>
              </button>

              <button
                onClick={handleToggleList}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border whitespace-nowrap ${
                  isSaved
                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-[#e50914]" />
                    <span>{t('details.removeFromList')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t('details.addToList')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Overview / Synopsis */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {t('details.synopsis')}
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                {displayOverview || t('details.synopsis')}
              </p>
            </div>

            {item.director && (
              <div className="pt-2 text-xs sm:text-sm text-zinc-400">
                <span className="text-zinc-500 font-medium">{t('details.directedBy')}: </span>
                <span className="text-zinc-200 font-semibold">{item.director}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cast Section (First 10 actors) */}
        {cast.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/5">
            <CastList cast={cast} />
          </div>
        )}

        {/* Similar Titles Section */}
        {similarItems.length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/5">
            <h3 className="text-xl font-bold tracking-tight text-white mb-6">
              {t('sections.similarTitles')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {similarItems.map((similar) => (
                <MediaCard
                  key={similar.id}
                  item={similar}
                  onOpenTrailer={handleOpenSimilarTrailer}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerId={trailerKey || undefined}
        title={displayTitle}
      />

      {/* Similar item trailer modal */}
      {similarTrailerItem && (
        <TrailerModal
          isOpen={true}
          onClose={() => {
            setSimilarTrailerItem(null);
            setSimilarTrailerKey(null);
          }}
          trailerId={similarTrailerKey || undefined}
          title={
            language === 'fr'
              ? similarTrailerItem.titleFr || similarTrailerItem.title
              : similarTrailerItem.title
          }
        />
      )}
    </div>
  );
};
