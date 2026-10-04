import React from 'react';
import { User } from 'lucide-react';
import { CastMember } from '../data/types';
import { useTranslation } from '../i18n/LanguageContext';

interface CastListProps {
  cast: CastMember[];
}

export const CastList: React.FC<CastListProps> = ({ cast }) => {
  const { t } = useTranslation();
  const top10 = cast.slice(0, 10);

  if (!top10 || top10.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold tracking-tight text-white">
        {t('sections.castAndCrew')}
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {top10.map((actor) => (
          <div
            key={actor.id}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/5 transition-all duration-200 hover:bg-white/10"
          >
            {/* Circular Profile Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 bg-zinc-800 border-2 border-white/10 shadow-md shrink-0 flex items-center justify-center">
              {actor.profileUrl ? (
                <img
                  src={actor.profileUrl}
                  alt={actor.character ? `${actor.name} as ${actor.character}` : actor.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder icon
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      const icon = document.createElement('span');
                      icon.className = 'text-zinc-500 font-bold text-lg';
                      icon.innerText = actor.name.slice(0, 1);
                      target.parentElement.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-zinc-500" />
              )}
            </div>

            {/* Actor name & Character */}
            <p className="font-semibold text-xs sm:text-sm text-zinc-100 line-clamp-1">
              {actor.name}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1 mt-0.5">
              {actor.character}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
