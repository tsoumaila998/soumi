import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  Film,
  AlertCircle,
  FileVideo,
} from 'lucide-react';
import {
  getMovieMetadata,
  getVideoFileUrl,
  getThumbnailUrl,
  cleanArchiveText,
  formatCreator,
  ArchiveMetadata,
} from '../services/archiveService';
import { VideoPlayer } from '../components/VideoPlayer';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';

export const FreeMovieDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!identifier) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    getMovieMetadata(identifier)
      .then((data) => {
        if (!isMounted) return;
        if (!data || !data.metadata) {
          setError(true);
          setLoading(false);
          return;
        }

        setMetadata(data);
        const url = getVideoFileUrl(identifier, data.files);
        setVideoUrl(url);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [identifier]);

  const rawTitle = metadata?.metadata?.title || identifier || 'Public Domain Film';
  const displayTitle = Array.isArray(rawTitle)
    ? (rawTitle as string[]).join(' ')
    : typeof rawTitle === 'string'
    ? rawTitle
    : String(rawTitle || '');
  const description = cleanArchiveText(metadata?.metadata?.description);
  const creator = formatCreator(metadata?.metadata?.creator);
  const year = metadata?.metadata?.year || metadata?.metadata?.date?.slice(0, 4) || '';
  const thumbnailUrl = identifier ? getThumbnailUrl(identifier) : '';
  const archiveItemUrl = identifier ? `https://archive.org/details/${encodeURIComponent(identifier)}` : '';

  usePageSEO({
    title: `${displayTitle} — Free Public Domain Movie | SOUMI`,
    description: description ? description.slice(0, 160) : 'Watch this public domain movie legally free on SOUMI.',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="w-32 h-9 bg-white/10 rounded-xl" />
          <div className="w-full aspect-video bg-white/5 rounded-2xl border border-white/5" />
          <div className="space-y-3 max-w-2xl">
            <div className="h-8 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/3" />
            <div className="h-20 bg-white/5 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white pt-32 pb-20 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-[#e50914] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Film Not Found</h2>
          <p className="text-sm text-zinc-400">
            {t('freeMovies.errorLoading')}
          </p>
        </div>
        <Link
          to="/free-movies"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-sm font-bold transition-all shadow-lg shadow-[#e50914]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('freeMovies.back')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/free-movies"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161622] hover:bg-[#1f1f2e] text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t('freeMovies.back')}</span>
        </Link>

        {archiveItemUrl && (
          <a
            href={archiveItemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span>Archive.org Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main Video Player */}
      <div className="space-y-4">
        <VideoPlayer
          src={videoUrl}
          poster={thumbnailUrl}
          title={displayTitle}
        />
      </div>

      {/* Film Information & Metadata Block */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#161622] border border-white/10 space-y-6 shadow-2xl">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 text-[#e50914] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('freeMovies.publicDomainBadge')}</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs font-semibold">
              Archive.org
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-['Outfit']">
            {displayTitle}
          </h1>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-300 pt-2 border-t border-white/5">
          {year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>{year}</span>
            </div>
          )}

          {creator && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-zinc-500" />
              <span>
                <strong className="text-zinc-400 font-normal">{t('freeMovies.creator')}:</strong> {creator}
              </span>
            </div>
          )}

          {metadata?.metadata?.runtime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>{metadata.metadata.runtime}</span>
            </div>
          )}
        </div>

        {/* Synopsis / Description */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
            {t('freeMovies.details')}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl whitespace-pre-line">
            {description || 'No detailed description available for this archive entry.'}
          </p>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p>
            This film is hosted and distributed under public domain open access by the Internet Archive (Archive.org).
          </p>
          {archiveItemUrl && (
            <a
              href={archiveItemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e50914] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View Original Archive Record</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
