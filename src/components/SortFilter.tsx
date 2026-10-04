import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export type SortOption = 'popularity' | 'rating' | 'releaseDate' | 'releaseDateAsc';

interface SortFilterProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({ currentSort, onSortChange }) => {
  const { t } = useTranslation();

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-zinc-300">
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
        <span className="hidden sm:inline text-zinc-400">{t('catalog.sortBy')}:</span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label={t('catalog.sortBy')}
          className="bg-transparent text-white focus:outline-none cursor-pointer pr-2 font-medium"
        >
          <option value="popularity" className="bg-[#16161d] text-white">
            {t('catalog.sortPopularity')}
          </option>
          <option value="rating" className="bg-[#16161d] text-white">
            {t('catalog.sortRating')}
          </option>
          <option value="releaseDate" className="bg-[#16161d] text-white">
            {t('catalog.sortReleaseDate')}
          </option>
          <option value="releaseDateAsc" className="bg-[#16161d] text-white">
            {t('catalog.sortReleaseDateAsc')}
          </option>
        </select>
      </div>
    </div>
  );
};
