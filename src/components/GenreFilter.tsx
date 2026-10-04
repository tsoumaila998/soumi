import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export interface GenreOption {
  id: number | string;
  name: string;
}

interface GenreFilterProps {
  genres: (string | GenreOption)[];
  selectedGenre: string | number;
  onSelectGenre: (genreId: string) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenre,
  onSelectGenre,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <button
        onClick={() => onSelectGenre('all')}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
          String(selectedGenre) === 'all'
            ? 'bg-[#e50914] text-white border-[#e50914] shadow-md shadow-[#e50914]/20'
            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-white/5'
        }`}
      >
        {t('catalog.allGenres')}
      </button>

      {genres.map((item) => {
        const id = typeof item === 'object' ? String(item.id) : item;
        const rawName = typeof item === 'object' ? item.name : item;
        const isSelected = String(selectedGenre) === id;
        const translated = t(`genres.${rawName}`) !== `genres.${rawName}` ? t(`genres.${rawName}`) : rawName;

        return (
          <button
            key={id}
            onClick={() => onSelectGenre(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              isSelected
                ? 'bg-[#e50914] text-white border-[#e50914] shadow-md shadow-[#e50914]/20'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-white/5'
            }`}
          >
            {translated}
          </button>
        );
      })}
    </div>
  );
};
