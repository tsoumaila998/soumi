import React from 'react';
import { Film, Search, Bookmark, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Film,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 my-12 rounded-2xl bg-white/[0.02] border border-white/5 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-[#e50914]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#e50914]/25 hover:scale-105 active:scale-95"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#e50914]/25 hover:scale-105 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
