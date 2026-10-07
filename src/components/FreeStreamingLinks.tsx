import React from 'react';
import { Tv, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { FREE_STREAMING_SITES, FreeStreamingSite } from '../data/freeStreamingSites';
import { useTranslation } from '../i18n/LanguageContext';

interface FreeStreamingLinksProps {
  title: string;
}

export const FreeStreamingLinks: React.FC<FreeStreamingLinksProps> = ({ title }) => {
  const { t } = useTranslation();

  if (!title || !title.trim()) {
    return null;
  }

  const cleanTitle = title.trim();

  const getTargetUrl = (site: FreeStreamingSite): string => {
    return site.searchUrl.replace('{query}', encodeURIComponent(cleanTitle));
  };

  const getBadgeText = (badge: FreeStreamingSite['badge']): string => {
    switch (badge) {
      case 'adSupported':
        return t('freeStreaming.badges.adSupported');
      case 'publicDomain':
        return t('freeStreaming.badges.publicDomain');
      case 'free':
      default:
        return t('freeStreaming.badges.free');
    }
  };

  return (
    <section className="space-y-4 pt-4 border-t border-white/10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded-full" />
          <div className="w-8 h-8 rounded-xl bg-[#e50914]/15 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] tracking-tight">
              {t('freeStreaming.title')}
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>100% Legal & Safe</span>
        </span>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
        {t('freeStreaming.subtitle')}
      </p>

      {/* Grid of Free Streaming Platforms */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
        {FREE_STREAMING_SITES.map((site) => {
          const targetUrl = getTargetUrl(site);
          const badgeText = getBadgeText(site.badge);

          return (
            <a
              key={site.id}
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#161622]/80 hover:bg-[#1a1a29] border border-white/10 hover:border-[#e50914]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#e50914]/10 cursor-pointer overflow-hidden"
              title={`${t('freeStreaming.searchOn')} ${site.name}`}
            >
              {/* Subtle brand glow on top */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: site.brandColor }}
              />

              <div className="space-y-3 relative z-10">
                {/* Header: Platform Monogram / Brand Icon + Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs tracking-tighter shadow-md border border-white/10 text-white transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: site.brandColor,
                      color: site.id === 'pluto-tv' ? '#000000' : '#ffffff',
                    }}
                  >
                    {site.shortTag.slice(0, 3)}
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 uppercase tracking-wider">
                    {badgeText}
                  </span>
                </div>

                {/* Platform Name & Short Description */}
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#e50914] transition-colors flex items-center gap-1.5 leading-snug">
                    <span>{site.name}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-[#e50914] transition-colors shrink-0" />
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {site.description}
                  </p>
                </div>
              </div>

              {/* Action Hint */}
              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 group-hover:text-white transition-colors relative z-10">
                <span className="truncate">
                  {t('freeStreaming.searchOn')} <strong className="text-white font-medium">{site.name}</strong>
                </span>
                <span className="text-[#e50914] text-xs font-bold transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
