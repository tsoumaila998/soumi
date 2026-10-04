import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { en } from './translations/en';
import { fr } from './translations/fr';

export type SupportedLanguage = 'en' | 'fr';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
}

const translations: Record<SupportedLanguage, any> = {
  en,
  fr,
};

const STORAGE_KEY = 'cineverse_language';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('fr')) {
      return 'fr';
    }
  } catch (e) {
    console.error('Error reading language from storage', e);
  }
  return 'en';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch (e) {
      console.error('Error saving language', e);
    }
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'fr' : 'en'));
  }, []);

  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      const keys = keyPath.split('.');
      
      // Look up in current language first, fallback to 'en'
      let currentVal: any = translations[language];
      for (const k of keys) {
        if (currentVal && typeof currentVal === 'object' && k in currentVal) {
          currentVal = currentVal[k];
        } else {
          currentVal = undefined;
          break;
        }
      }

      if (currentVal === undefined) {
        // Fallback to English
        let fallbackVal: any = translations['en'];
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        currentVal = fallbackVal;
      }

      if (typeof currentVal !== 'string') {
        return keyPath;
      }

      if (params) {
        return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
          return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        }, currentVal);
      }

      return currentVal;
    },
    [language]
  );

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, locale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
