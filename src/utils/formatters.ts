/**
 * Locale formatting utilities for dates, numbers, and runtimes.
 * Supports en-US and fr-FR according to user locale.
 */

export function formatDate(dateString: string | undefined | null, locale: string = 'en-US'): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatYear(dateString: string | undefined | null): string {
  if (!dateString) return '';
  return dateString.substring(0, 4);
}

export function formatNumber(num: number, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return String(num);
  }
}

export function formatRating(rating: number, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rating);
  } catch {
    return rating.toFixed(1);
  }
}

export function formatRuntime(minutes: number, locale: string = 'en-US'): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const isFr = locale.startsWith('fr');

  if (hours > 0) {
    if (remainingMinutes > 0) {
      return isFr ? `${hours} h ${remainingMinutes} min` : `${hours}h ${remainingMinutes}m`;
    }
    return isFr ? `${hours} h` : `${hours}h`;
  }
  return isFr ? `${remainingMinutes} min` : `${remainingMinutes}m`;
}
