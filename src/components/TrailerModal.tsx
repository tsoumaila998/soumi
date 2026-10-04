import React, { useEffect } from 'react';
import { X, Film } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerId?: string;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerId,
  title,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#16161d] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0f]/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#e50914]/20 flex items-center justify-center text-[#e50914]">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 id="trailer-title" className="text-base font-bold text-white tracking-wide truncate max-w-md">
                {title}
              </h3>
              <p className="text-xs text-zinc-400">{t('trailer.modalTitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('trailer.close')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black">
          {trailerId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&modestbranding=1&rel=0`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
              <Film className="w-12 h-12 mb-3 text-zinc-600" />
              <p className="text-sm font-medium">{t('trailer.unavailableMessage')}</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0a0a0f]/60 text-xs text-zinc-400 flex items-center justify-between border-t border-white/5">
          <span>{t('footer.disclaimer3')}</span>
          <button
            onClick={onClose}
            className="text-zinc-300 hover:text-white font-medium hover:underline focus:outline-none"
          >
            {t('trailer.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
