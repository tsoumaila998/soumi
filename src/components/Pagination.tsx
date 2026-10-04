import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label={t('pagination.page')}
      className="flex items-center justify-center gap-2 mt-12 py-4"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('pagination.previous')}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{t('pagination.previous')}</span>
      </button>

      <div className="flex items-center gap-1 px-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            aria-label={`${t('pagination.page')} ${pageNum}`}
            aria-current={pageNum === currentPage ? 'page' : undefined}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] ${
              pageNum === currentPage
                ? 'bg-[#e50914] text-white shadow-md shadow-[#e50914]/25'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('pagination.next')}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914]"
      >
        <span className="hidden sm:inline">{t('pagination.next')}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
