import React, { useState, useEffect, useMemo } from 'react';
import {
  Tv,
  ExternalLink,
  Globe,
  Play,
  Film,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';
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
  const [isRentBuyExpanded, setIsRentBuyExpanded] = useState<boolean>(false);

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

  const hasPaidProviders = rentProviders.length > 0 || buyProviders.length > 0;
  const hasAnyProvider = uniqueStream.length > 0 || hasPaidProviders;

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

  // Render Stream Cards (Prominent, large)
  const renderStreamProviderGroup = (providers: WatchProviderItem[]) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h4 className="text-base font-bold text-white tracking-wide">
                {t('watchProviders.streamFree')}
              </h4>
              <p className="text-xs text-zinc-400">
                Subscription, Free, or Ad-supported streaming
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {providers.length} {providers.length > 1 ? 'options' : 'option'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          {providers.map((p) => {
            const logoUrl = getProviderLogoUrl(p.logo_path);
            return (
              <div
                key={p.provider_id}
                className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 transition-all duration-200 shadow-sm"
                title={p.provider_name}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={p.provider_name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-9 h-9 rounded-lg object-cover shadow bg-zinc-900 border border-white/10 shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                    {p.provider_name.slice(0, 2)}
                  </div>
                )}
                <span className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate max-w-[150px]">
                  {p.provider_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Compact Rent/Buy Sub-groups (Muted, smaller)
  const renderPaidProviderGroup = (
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
          <h5 className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
            {label}
          </h5>
          <span className="text-[11px] text-zinc-500 font-semibold">
            ({providers.length})
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {providers.map((p) => {
            const logoUrl = getProviderLogoUrl(p.logo_path);
            return (
              <div
                key={p.provider_id}
                className="group relative flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all duration-200"
                title={p.provider_name}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={p.provider_name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-7 h-7 rounded-md object-cover shadow-xs bg-zinc-900 border border-white/10 shrink-0 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
                    {p.provider_name.slice(0, 2)}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors truncate max-w-[130px]">
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
    <section className="space-y-5 pt-10 border-t border-white/5" id="where-to-watch">
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
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 animate-pulse space-y-4">
          <div className="w-36 h-5 bg-white/10 rounded" />
          <div className="flex gap-3">
            <div className="w-32 h-12 bg-white/10 rounded-xl" />
            <div className="w-32 h-12 bg-white/10 rounded-xl" />
          </div>
        </div>
      )}

      {/* Loaded Content */}
      {!loading && (
        <div className="space-y-4">
          {hasAnyProvider ? (
            <>
              {/* 1. Main Stream Section (Full width, prominent) */}
              <div className="p-6 rounded-2xl bg-[#12121a] border border-white/10 shadow-inner">
                {uniqueStream.length > 0 ? (
                  renderStreamProviderGroup(uniqueStream)
                ) : (
                  <div className="py-2 flex items-center gap-3 text-zinc-400">
                    <span className="p-2 rounded-xl bg-white/5 text-zinc-500">
                      <Play className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-300">
                        {t('watchProviders.streamFree')}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {t('watchProviders.noStreamAvailable', {
                          country: currentCountryName,
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Rent & Buy Collapsible Section (Muted, below Stream) */}
              {hasPaidProviders && (
                <div className="rounded-2xl bg-[#12121a]/70 border border-white/10 overflow-hidden transition-all duration-200">
                  {/* Collapsible Header Button */}
                  <button
                    type="button"
                    onClick={() => setIsRentBuyExpanded(!isRentBuyExpanded)}
                    className="w-full flex items-center justify-between p-4 sm:px-6 hover:bg-white/[0.03] transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#e50914]"
                    aria-expanded={isRentBuyExpanded}
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-white/5 text-zinc-400">
                        <ShoppingBag className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-200 tracking-wide">
                            {t('watchProviders.rentBuyTitle')}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                            {rentProviders.length + buyProviders.length}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          {t('watchProviders.rentBuySubtitle')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                      <span>
                        {isRentBuyExpanded
                          ? t('watchProviders.collapse')
                          : t('watchProviders.expand')}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                          isRentBuyExpanded ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isRentBuyExpanded
                        ? 'max-h-[600px] opacity-100 pb-5 px-4 sm:px-6'
                        : 'max-h-0 opacity-0 px-4 sm:px-6'
                    }`}
                  >
                    <div
                      className={`grid gap-6 pt-4 border-t border-white/5 ${
                        rentProviders.length > 0 && buyProviders.length > 0
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1'
                      }`}
                    >
                      {rentProviders.length > 0 &&
                        renderPaidProviderGroup(
                          t('watchProviders.rent'),
                          <Film className="w-3.5 h-3.5 text-blue-400" />,
                          rentProviders,
                          'bg-blue-500/15 text-blue-400'
                        )}

                      {buyProviders.length > 0 &&
                        renderPaidProviderGroup(
                          t('watchProviders.buy'),
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />,
                          buyProviders,
                          'bg-amber-500/15 text-amber-400'
                        )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Clean Empty State */
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
