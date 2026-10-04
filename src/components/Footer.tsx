import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ExternalLink, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-white/5 bg-[#07070a] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-white/5">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 inline-flex" aria-label="SOUMI Home">
              <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center text-white">
                <Film className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-['Outfit']">
                SOU<span className="text-[#e50914]">MI</span>
              </span>
            </Link>
            <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Movies • TV Shows • Discover • Watch
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              {t('footer.brandDesc')}
            </p>

            {/* TMDb and YouTube Attribution Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-colors group"
                aria-label="The Movie Database (TMDb)"
              >
                <span className="text-[11px] font-bold tracking-wider text-emerald-400">TMDB</span>
                <span className="text-xs text-zinc-300 font-medium">Attribution Partner</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </a>

              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-colors group"
                aria-label="YouTube"
              >
                <span className="text-[11px] font-bold tracking-wider text-red-500">YouTube</span>
                <span className="text-xs text-zinc-300 font-medium">Trailers</span>
                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition-colors">
                  {t('nav.movies')}
                </Link>
              </li>
              <li>
                <Link to="/tv" className="hover:text-white transition-colors">
                  {t('nav.tvShows')}
                </Link>
              </li>
              <li>
                <Link to="/my-list" className="hover:text-white transition-colors">
                  {t('nav.myList')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Notices */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e50914]" />
              {t('footer.legal')}
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400 leading-normal">
              <p>{t('footer.disclaimer1')}</p>
              <p>{t('footer.disclaimer2')}</p>
              <p>{t('footer.disclaimer3')}</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar with SOUMI and TMDb API Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="max-w-2xl text-zinc-400 leading-relaxed">
            {t('footer.disclaimer4')}
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold shrink-0">
            <span>{t('footer.copyright')}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{t('footer.rightsReserved')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
