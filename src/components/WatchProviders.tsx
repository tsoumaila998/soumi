import React, { useState, useEffect, useMemo } from 'react';
import { Tv, ExternalLink, Globe, Play, Film, ShoppingBag } from 'lucide-react';
import {
  getWatchProviders,
  getProviderLogoUrl,
  WatchProvidersData,
  CountryWatchProviders,
  WatchProviderItem,
} from '../services/tmdb';
import { useTranslation } from '../i18n/LanguageContext';

interface WatchProvidersProps {
  mediaId: string | number;
  mediaType: 'movie' | 'tv';
  title: string;
}

// Common ISO 3166-1 alpha-2 country names for display
const COMMON_COUNTRY_NAMES: Record<string, { en: string; fr: string }> = {
  // West Africa & African Countries
  CI: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire" },
  ML: { en: 'Mali', fr: 'Mali' },
  GN: { en: 'Guinea', fr: 'Guinée' },
  BF: { en: 'Burkina Faso', fr: 'Burkina Faso' },
  SN: { en: 'Senegal', fr: 'Sénégal' },
  GH: { en: 'Ghana', fr: 'Ghana' },
  NG: { en: 'Nigeria', fr: 'Nigéria' },
  TG: { en: 'Togo', fr: 'Togo' },
  BJ: { en: 'Benin', fr: 'Bénin' },
  NE: { en: 'Niger', fr: 'Niger' },
  CM: { en: 'Cameroon', fr: 'Cameroun' },
  MA: { en: 'Morocco', fr: 'Maroc' },
  DZ: { en: 'Algeria', fr: 'Algérie' },
  TN: { en: 'Tunisia', fr: 'Tunisie' },
  EG: { en: 'Egypt', fr: 'Égypte' },
  ZA: { en: 'South Africa', fr: 'Afrique du Sud' },
  KE: { en: 'Kenya', fr: 'Kenya' },

  // Global & Popular Streaming Markets
  US: { en: 'United States', fr: 'États-Unis' },
  FR: { en: 'France', fr: 'France' },
  GB: { en: 'United Kingdom', fr: 'Royaume-Uni' },
  CA: { en: 'Canada', fr: 'Canada' },
  AU: { en: 'Australia', fr: 'Australie' },
  DE: { en: 'Germany', fr: 'Allemagne' },
  ES: { en: 'Spain', fr: 'Espagne' },
  IT: { en: 'Italy', fr: 'Italie' },
  BE: { en: 'Belgium', fr: 'Belgique' },
  CH: { en: 'Switzerland', fr: 'Suisse' },
  IN: { en: 'India', fr: 'Inde' },
  JP: { en: 'Japan', fr: 'Japon' },
  BR: { en: 'Brazil', fr: 'Brésil' },
  MX: { en: 'Mexico', fr: 'Mexique' },
  NL: { en: 'Netherlands', fr: 'Pays-Bas' },
  SE: { en: 'Sweden', fr: 'Suède' },
  NO: { en: 'Norway', fr: 'Norvège' },
  DK: { en: 'Denmark', fr: 'Danemark' },
  FI: { en: 'Finland', fr: 'Finlande' },
  PT: { en: 'Portugal', fr: 'Portugal' },
  IE: { en: 'Ireland', fr: 'Irlande' },
  NZ: { en: 'New Zealand', fr: 'Nouvelle-Zélande' },
  KR: { en: 'South Korea', fr: 'Corée du Sud' },
};

// Priority list for West African and African countries to feature first in the selector
const PRIORITY_AFRICAN_COUNTRIES = [
  'CI',
  'ML',
  'GN',
  'BF',
  'SN',
  'GH',
  'NG',
  'TG',
  'BJ',
  'NE',
  'CM',
  'MA',
  'DZ',
  'TN',
  'EG',
  'ZA',
  'KE',
];

function detectCountryCode(): string {
  try {
    const candidates =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || ''];

    for (const loc of candidates) {
      if (!loc) continue;
      const parts = loc.split(/[-_]/);
      if (parts.length > 1 && parts[1].length === 2) {
        return parts[1].toUpperCase();
      }
    }
  } catch {
    // fallback
  }
  return 'US';
}

export const WatchProviders: React.FC<WatchProvidersProps> = ({
  mediaId,
  mediaType,
  title,
}) => {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WatchProvidersData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getWatchProviders(mediaId, mediaType).then((res) => {
      if (!isMounted) return;
      setData(res);
      setLoading(false);

      if (res && res.results) {
        const detected = detectCountryCode();
        // Preference chain:
        // 1. User's detected region (if available in TMDb results)
        // 2. "US"
        // 3. "FR"
        // 4. First available country
        if (res.results[detected]) {
          setSelectedCountry(detected);
        } else if (res.results['US']) {
          setSelectedCountry('US');
        } else if (res.results['FR']) {
          setSelectedCountry('FR');
        } else {
          const availableKeys = Object.keys(res.results);
          if (availableKeys.length > 0) {
            setSelectedCountry(availableKeys[0]);
          }
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [mediaId, mediaType]);

  const countryProviders: CountryWatchProviders | undefined = data?.results?.[selectedCountry];

  // Group providers
  const streamProviders: WatchProviderItem[] = [
    ...(countryProviders?.flatrate || []),
    ...(countryProviders?.free || []),
    ...(countryProviders?.ads || []),
  ];
  // Deduplicate stream providers by provider_id
  const uniqueStream = Array.from(
    new Map(streamProviders.map((p) => [p.provider_id, p])).values()
  );

  const rentProviders: WatchProviderItem[] = countryProviders?.rent || [];
  const buyProviders: WatchProviderItem[] = countryProviders?.buy || [];

  const hasAnyProvider =
    uniqueStream.length > 0 || rentProviders.length > 0 || buyProviders.length > 0;

  const getCountryName = (code: string): string => {
    const entry = COMMON_COUNTRY_NAMES[code];
    if (entry) {
      return language === 'fr' ? entry.fr : entry.en;
    }
    return code;
  };

  // Available country codes in results sorted with African priority when > 10 options
  const sortedAvailableCountries = useMemo(() => {
    if (!data?.results) return [];
    const keys = Object.keys(data.results);
    const africanSet = new Set(PRIORITY_AFRICAN_COUNTRIES);

    return keys.sort((a, b) => {
      if (keys.length > 10) {
        const aIsAfrican = africanSet.has(a);
        const bIsAfrican = africanSet.has(b);

        if (aIsAfrican && !bIsAfrican) return -1;
        if (!aIsAfrican && bIsAfrican) return 1;

        if (aIsAfrican && bIsAfrican) {
          return (
            PRIORITY_AFRICAN_COUNTRIES.indexOf(a) -
            PRIORITY_AFRICAN_COUNTRIES.indexOf(b)
          );
        }
      }

      const nameA = getCountryName(a);
      const nameB = getCountryName(b);
      return nameA.localeCompare(nameB);
    });
  }, [data?.results, language]);

  const currentCountryName = getCountryName(selectedCountry);

  const renderProviderGroup = (
    label: string,
    icon: React.ReactNode,
    providers: WatchProviderItem[],
    accentBadge: string
  ) => {
    if (providers.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${accentBadge}`}>{icon}</span>
          <h4 className="text-sm font-bold text-white tracking-wide">{label}</h4>
          <span className="text-xs text-zinc-500 font-semibold">({providers.length})</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {providers.map((p) => {
            const logoUrl = getProviderLogoUrl(p.logo_path);
            return (
              <div
                key={p.provider_id}
                className="group relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                title={p.provider_name}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={p.provider_name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-8 h-8 rounded-lg object-cover shadow-sm bg-zinc-900 border border-white/10 shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                    {p.provider_name.slice(0, 2)}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate max-w-[130px]">
                  {p.provider_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6 pt-10 border-t border-white/5" id="where-to-watch">
      {/* Header bar with Country Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#e50914] rounded-full" />
          <div className="flex items-center gap-2.5">
            <Tv className="w-5 h-5 text-[#e50914]" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Outfit']">
              {t('watchProviders.title')}
            </h3>
          </div>
        </div>

        {/* Country Selector Dropdown */}
        {sortedAvailableCountries.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-400 font-medium">
              {t('watchProviders.changeCountry')}
            </span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-[#161622] hover:bg-[#1f1f2e] text-zinc-200 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer transition-colors"
              aria-label={t('watchProviders.changeCountry')}
            >
              {sortedAvailableCountries.map((code) => {
                const isAfrican = PRIORITY_AFRICAN_COUNTRIES.includes(code);
                return (
                  <option key={code} value={code} className="bg-[#161622] text-white">
                    {getCountryName(code)} ({code}){isAfrican ? ' ★' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="flex gap-2">
                <div className="w-9 h-9 bg-white/10 rounded-lg" />
                <div className="w-9 h-9 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loaded Content */}
      {!loading && (
        <div className="space-y-6">
          {hasAnyProvider ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#12121a] border border-white/5 shadow-inner">
              {/* 1. Stream (Subscription / Free / Ads) */}
              <div className="space-y-3">
                {uniqueStream.length > 0 ? (
                  renderProviderGroup(
                    t('watchProviders.stream'),
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />,
                    uniqueStream,
                    'bg-emerald-500/15 text-emerald-400'
                  )
                ) : (
                  <div className="space-y-2 opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/5 text-zinc-500">
                        <Play className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-bold text-zinc-400">
                        {t('watchProviders.stream')}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 italic">—</p>
                  </div>
                )}
              </div>

              {/* 2. Rent */}
              <div className="space-y-3 md:border-l md:border-white/5 md:pl-6">
                {rentProviders.length > 0 ? (
                  renderProviderGroup(
                    t('watchProviders.rent'),
                    <Film className="w-3.5 h-3.5 text-blue-400" />,
                    rentProviders,
                    'bg-blue-500/15 text-blue-400'
                  )
                ) : (
                  <div className="space-y-2 opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/5 text-zinc-500">
                        <Film className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-bold text-zinc-400">
                        {t('watchProviders.rent')}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 italic">—</p>
                  </div>
                )}
              </div>

              {/* 3. Buy */}
              <div className="space-y-3 md:border-l md:border-white/5 md:pl-6">
                {buyProviders.length > 0 ? (
                  renderProviderGroup(
                    t('watchProviders.buy'),
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />,
                    buyProviders,
                    'bg-amber-500/15 text-amber-400'
                  )
                ) : (
                  <div className="space-y-2 opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white/5 text-zinc-500">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-sm font-bold text-zinc-400">
                        {t('watchProviders.buy')}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 italic">—</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Graceful Empty State */
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/5 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <Tv className="w-6 h-6" />
              </div>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                {t('watchProviders.noProviders', { country: currentCountryName })}
              </p>
              {sortedAvailableCountries.length > 1 && (
                <p className="text-xs text-zinc-500">
                  {language === 'fr'
                    ? 'Sélectionnez un autre pays dans le menu déroulant ci-dessus.'
                    : 'Try selecting a different region from the country menu above.'}
                </p>
              )}
            </div>
          )}

          {/* Footer Bar with TMDb Watch Link & JustWatch Attribution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-zinc-400">
            {countryProviders?.link ? (
              <a
                href={countryProviders.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#e50914] hover:text-[#ff2b37] transition-colors group"
              >
                <span>{t('watchProviders.viewOnTmdb')}</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <a
                href={`https://www.themoviedb.org/${mediaType}/${mediaId}/watch`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#e50914] hover:text-[#ff2b37] transition-colors group"
              >
                <span>{t('watchProviders.viewOnTmdb')}</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}

            <p className="text-[11px] text-zinc-500">
              {t('watchProviders.poweredBy')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
