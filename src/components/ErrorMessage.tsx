import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-red-950/20 border border-red-900/30 max-w-lg mx-auto my-12">
      <div className="w-14 h-14 rounded-2xl bg-red-900/30 text-red-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title || t('state.errorTitle')}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed mb-6">
        {message || t('state.errorDesc')}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/10"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('state.retry')}</span>
        </button>
      )}
    </div>
  );
};
