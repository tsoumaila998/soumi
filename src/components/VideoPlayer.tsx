import React, { useState, useRef } from 'react';
import { Play, AlertCircle, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handlePlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };
  const handlePause = () => setIsPlaying(false);

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // user interaction might be needed
      });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!src || hasError) {
    return (
      <div className="relative w-full aspect-video rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#e50914] mb-3">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1">
          {t('freeMovies.noVideo')}
        </h4>
        <p className="text-xs text-zinc-400 max-w-md mb-5 leading-relaxed">
          The public domain video stream could not be loaded directly. You can retry or access the item page on Archive.org.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-semibold transition-colors shadow-lg shadow-[#e50914]/20"
            >
              <span>Download File</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden group shadow-2xl"
    >
      {/* HTML5 Native Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onError={handleError}
        className="w-full h-full object-contain bg-black"
      >
        <track kind="captions" />
        Your browser does not support HTML5 video playback.
      </video>

      {/* Loading Overlay Spinner */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none z-10 transition-opacity">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-white/15 border-t-[#e50914] rounded-full animate-spin shadow-lg" />
            <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
              {t('freeMovies.loading')}
            </span>
          </div>
        </div>
      )}

      {/* Header Info Overlay (Visible on hover when paused or before playback) */}
      {!isPlaying && title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10 flex items-center justify-between">
          <p className="text-sm font-semibold text-white drop-shadow truncate max-w-xl">
            {title}
          </p>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#e50914]/90 text-white shadow">
            Public Domain
          </span>
        </div>
      )}
    </div>
  );
};
