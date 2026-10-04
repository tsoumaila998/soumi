import { useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface PageSEOOptions {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show';
}

export function usePageSEO({ title, description, image, type = 'website' }: PageSEOOptions) {
  const { language } = useTranslation();

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Update <html> lang attribute dynamically for search engines
    document.documentElement.lang = language;

    // 3. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }

    // 4. Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', type);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) ogImage.setAttribute('content', image);

    // 5. Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && description) twDesc.setAttribute('content', description);

    const twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage && image) twImage.setAttribute('content', image);
  }, [title, description, image, type, language]);
}
