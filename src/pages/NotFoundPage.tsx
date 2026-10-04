import React from 'react';
import { Film } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useTranslation } from '../i18n/LanguageContext';
import { usePageSEO } from '../hooks/usePageSEO';

export const NotFoundPage: React.FC = () => {
  const { t, language } = useTranslation();
  usePageSEO({
    title: language === 'fr' ? 'Page Introuvable — SOUMI' : 'Page Not Found — SOUMI',
    description: 'The requested page was not found on SOUMI.',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-32 px-4">
      <EmptyState
        icon={Film}
        title={t('state.notFoundTitle')}
        description={t('state.notFoundDesc')}
        actionText={t('state.backHome')}
        actionLink="/"
      />
    </div>
  );
};
