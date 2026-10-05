export interface ArchiveDoc {
  identifier: string;
  title: string;
  year?: string | number;
  description?: string | string[];
  downloads?: number;
  creator?: string | string[];
  publicdate?: string;
  runtime?: string | number;
}

export interface ArchiveFile {
  name: string;
  source?: string;
  format?: string;
  size?: string | number;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  title?: string;
}

export interface ArchiveMetadata {
  created?: number;
  d1?: string;
  dir?: string;
  files: ArchiveFile[];
  item_size?: number;
  metadata: {
    identifier: string;
    title?: string;
    description?: string | string[];
    creator?: string | string[];
    year?: string | number;
    date?: string;
    publicdate?: string;
    licenseurl?: string;
    collection?: string | string[];
    runtime?: string | number;
    [key: string]: any;
  };
  server?: string;
}

export interface SearchArchiveResult {
  docs: ArchiveDoc[];
  numFound: number;
}

const ARCHIVE_SEARCH_URL = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_URL = 'https://archive.org/metadata';

// Blacklist of terms that indicate clips, promos, home videos, discs, or compilations
export const TITLE_BLACKLIST = [
  'batch',
  'disc',
  'vol.',
  'volume',
  'part 1 of',
  'test',
  'sample',
  'clip',
  'trailer',
  'promo',
  'advert',
  'commercial',
  'newsreel',
  'publicvideos',
  'archive',
  'collection',
  'compilation',
];

// Helper to check if a title should be excluded
export function isBlacklistedTitle(title?: string): boolean {
  if (!title) return true;
  const lower = title.toLowerCase();
  return TITLE_BLACKLIST.some((term) => lower.includes(term));
}

// Helper to parse Archive.org runtime into integer minutes
export function parseRuntimeToMinutes(runtime?: string | number): number | null {
  if (runtime === undefined || runtime === null) return null;
  const str = String(runtime).trim();
  if (!str) return null;

  // Format: "HH:MM:SS" or "H:MM:SS"
  const colonParts = str.split(':').map((p) => parseInt(p, 10));
  if (colonParts.length === 3 && !colonParts.some(isNaN)) {
    const [hours, mins] = colonParts;
    return hours * 60 + mins;
  }
  if (colonParts.length === 2 && !colonParts.some(isNaN)) {
    // "MM:SS"
    const [mins] = colonParts;
    return mins;
  }

  // Format: "108 min" or "108 mins" or "108"
  const numericMatch = str.match(/^(\d+)\s*(?:min|mins|m)?$/i);
  if (numericMatch) {
    const mins = parseInt(numericMatch[1], 10);
    return isNaN(mins) ? null : mins;
  }

  // Format: "1h 34m"
  const hmMatch = str.match(/^(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in|ins)?)?$/i);
  if (hmMatch && (hmMatch[1] || hmMatch[2])) {
    const h = parseInt(hmMatch[1] || '0', 10);
    const m = parseInt(hmMatch[2] || '0', 10);
    return h * 60 + m;
  }

  return null;
}

// Helper to format duration as "1h 34m" or "45m"
export function formatDuration(runtime?: string | number): string {
  const totalMinutes = parseRuntimeToMinutes(runtime);
  if (!totalMinutes || totalMinutes <= 0) return '';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

// Helper to convert file length in seconds to formatted duration
export function formatDurationFromSeconds(seconds?: string | number): string {
  if (!seconds) return '';
  const sec = typeof seconds === 'number' ? seconds : parseFloat(seconds);
  if (isNaN(sec) || sec <= 0) return '';
  const totalMinutes = Math.round(sec / 60);
  return formatDuration(totalMinutes);
}

// Helper to strip HTML tags and normalize text
export function cleanArchiveText(text?: string | string[]): string {
  if (!text) return '';
  const raw = Array.isArray(text) ? text.join(' ') : text;
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper to format creator
export function formatCreator(creator?: string | string[]): string {
  if (!creator) return '';
  if (Array.isArray(creator)) {
    return creator.join(', ');
  }
  return creator;
}

// 1. Get Thumbnail URL for an item
export function getThumbnailUrl(identifier: string): string {
  if (!identifier) return '';
  return `https://archive.org/services/img/${encodeURIComponent(identifier)}`;
}

// 2. Extract playable video URL from files list
export function getVideoFileUrl(identifier: string, files?: ArchiveFile[]): string {
  if (!identifier || !files || !Array.isArray(files) || files.length === 0) {
    return '';
  }

  // Filter video files
  const videoFiles = files.filter((f) => {
    if (!f || !f.name) return false;
    const name = f.name.toLowerCase();
    const fmt = (f.format || '').toLowerCase();
    return (
      name.endsWith('.mp4') ||
      name.endsWith('.m4v') ||
      fmt.includes('mp4') ||
      fmt.includes('h.264') ||
      fmt.includes('mpeg4')
    );
  });

  if (videoFiles.length === 0) {
    // Check for webm or ogv fallback
    const fallback = files.find((f) => {
      const name = (f?.name || '').toLowerCase();
      return name.endsWith('.webm') || name.endsWith('.ogv');
    });
    if (fallback && fallback.name) {
      return `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(fallback.name)}`;
    }
    return '';
  }

  // Preference 1: Explicit h.264 MP4 file
  let chosen = videoFiles.find((f) => {
    const fmt = (f.format || '').toLowerCase();
    const name = f.name.toLowerCase();
    return name.endsWith('.mp4') && fmt.includes('h.264');
  });

  // Preference 2: MPEG4 format ending in .mp4
  if (!chosen) {
    chosen = videoFiles.find((f) => {
      const fmt = (f.format || '').toLowerCase();
      const name = f.name.toLowerCase();
      return name.endsWith('.mp4') && fmt.includes('mpeg4');
    });
  }

  // Preference 3: Any file with .mp4 extension
  if (!chosen) {
    chosen = videoFiles.find((f) => f.name.toLowerCase().endsWith('.mp4'));
  }

  // Preference 4: First video file
  if (!chosen) {
    chosen = videoFiles[0];
  }

  return `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(chosen.name)}`;
}

// 3. Search public domain films from Archive.org
export async function searchPublicDomainMovies(
  page: number = 1,
  query?: string,
  sort: string = 'popular',
  genre: string = 'all',
  allowShortFilms: boolean = false
): Promise<SearchArchiveResult> {
  try {
    // 1. Determine collection based on genre selection
    // Uses the collection specified or official Archive.org category aliases
    let collectionQuery = 'collection:(feature_films)';

    switch (genre) {
      case 'horror':
        collectionQuery = 'collection:(horror_films OR SciFi_Horror)';
        break;
      case 'comedy':
        collectionQuery = 'collection:(comedy_films OR Comedy_Films)';
        break;
      case 'scifi':
        collectionQuery = 'collection:(sci-fi_films OR film_scifi OR SciFi_Horror)';
        break;
      case 'noir':
        collectionQuery = 'collection:(film_noir OR Film_Noir)';
        break;
      case 'western':
        collectionQuery = 'collection:(western_films OR westerns)';
        break;
      case 'animation':
        collectionQuery = 'collection:(animationandcartoons)';
        break;
      case 'all':
      default:
        collectionQuery = 'collection:(feature_films)';
        break;
    }

    // 2. Base query: collection AND minimum year 1920 AND public domain
    let baseQuery = `${collectionQuery} AND year:[1920 TO 2026] AND licenseurl:(*publicdomain*)`;

    // 3. Solr query-level blacklist filtering to minimize junk returned
    baseQuery +=
      ' AND -title:("batch" OR "disc" OR "vol." OR "volume" OR "test" OR "sample" OR "clip" OR "trailer" OR "promo" OR "advert" OR "commercial" OR "newsreel" OR "publicvideos" OR "compilation")';

    // 4. Custom user search query
    const trimmedQuery = query?.trim();
    if (trimmedQuery) {
      const cleanQ = trimmedQuery.replace(/([+\-!(){}[\]^"~*?:\\\/])/g, '\\$1');
      baseQuery += ` AND (title:(${cleanQ}) OR description:(${cleanQ}))`;
    }

    // 5. Determine sort parameter
    // Default is "downloads desc" (most popular first)
    let sortParam = 'downloads desc';
    if (sort === 'newest') {
      sortParam = 'year desc';
    } else if (sort === 'oldest') {
      sortParam = 'year asc';
    } else if (sort === 'az') {
      sortParam = 'titleSorter asc';
    } else if (sort === 'longest') {
      // Archive.org Solr does not index runtime for direct server-side sort,
      // so we query by popularity and sort in memory below
      sortParam = 'downloads desc';
    }

    const params = new URLSearchParams();
    params.set('q', baseQuery);
    params.append('fl[]', 'identifier');
    params.append('fl[]', 'title');
    params.append('fl[]', 'year');
    params.append('fl[]', 'description');
    params.append('fl[]', 'downloads');
    params.append('fl[]', 'creator');
    params.append('fl[]', 'publicdate');
    params.append('fl[]', 'runtime');
    params.set('sort', sortParam);
    // Request slightly more rows so client-side filtering keeps full pages
    params.set('rows', '32');
    params.set('page', String(Math.max(1, page)));
    params.set('output', 'json');

    const res = await fetch(`${ARCHIVE_SEARCH_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn('Archive.org search returned non-200 status:', res.status);
      return { docs: [], numFound: 0 };
    }

    const data = await res.json();
    const rawDocs: ArchiveDoc[] = data?.response?.docs || [];
    let numFound: number = data?.response?.numFound || 0;

    // 6. Strict client-side filtering pass:
    // a) Exclude blacklisted titles
    // b) Exclude titles under 1920
    // c) Exclude items whose runtime is strictly under 60 minutes (unless allowShortFilms or animation)
    const isAnimation = genre === 'animation';
    let filteredDocs = rawDocs.filter((doc) => {
      if (isBlacklistedTitle(doc.title)) {
        return false;
      }

      if (doc.year) {
        const y = parseInt(String(doc.year), 10);
        if (!isNaN(y) && y < 1920) {
          return false;
        }
      }

      if (!allowShortFilms && !isAnimation && doc.runtime) {
        const mins = parseRuntimeToMinutes(doc.runtime);
        if (mins !== null && mins < 60) {
          return false;
        }
      }

      return true;
    });

    // 7. If sort option is "longest", sort the results by parsed runtime descending
    if (sort === 'longest') {
      filteredDocs.sort((a, b) => {
        const minsA = parseRuntimeToMinutes(a.runtime) || 0;
        const minsB = parseRuntimeToMinutes(b.runtime) || 0;
        return minsB - minsA;
      });
    }

    // Limit to 24 per page
    const finalDocs = filteredDocs.slice(0, 24);

    return { docs: finalDocs, numFound };
  } catch (error) {
    console.warn('Failed to search Archive.org films:', error);
    return { docs: [], numFound: 0 };
  }
}

// 4. Fetch full metadata for an individual item
export async function getMovieMetadata(identifier: string): Promise<ArchiveMetadata | null> {
  if (!identifier) return null;
  try {
    const res = await fetch(`${ARCHIVE_METADATA_URL}/${encodeURIComponent(identifier)}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Archive.org metadata for ${identifier} returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || !data.metadata) {
      return null;
    }

    return data as ArchiveMetadata;
  } catch (error) {
    console.warn(`Failed to fetch Archive.org metadata for ${identifier}:`, error);
    return null;
  }
}
