export interface ArchiveDoc {
  identifier: string;
  title: string;
  year?: string | number;
  description?: string | string[];
  downloads?: number;
  creator?: string | string[];
  publicdate?: string;
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
    runtime?: string;
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
  sort: string = 'popular'
): Promise<SearchArchiveResult> {
  try {
    let baseQuery =
      'collection:(feature_films OR moviesandfilms) AND mediatype:(movies) AND licenseurl:(*publicdomain*)';

    const trimmedQuery = query?.trim();
    if (trimmedQuery) {
      // Escape solr reserved characters
      const cleanQ = trimmedQuery.replace(/([+\-!(){}[\]^"~*?:\\\/])/g, '\\$1');
      baseQuery += ` AND (title:(${cleanQ}) OR description:(${cleanQ}))`;
    }

    // Determine sort parameter
    let sortParam = 'downloads desc';
    if (sort === 'newest') {
      sortParam = 'year desc';
    } else if (sort === 'oldest') {
      sortParam = 'year asc';
    } else if (sort === 'az') {
      sortParam = 'titleSorter asc';
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
    params.set('sort', sortParam);
    params.set('rows', '24');
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
    const docs: ArchiveDoc[] = data?.response?.docs || [];
    const numFound: number = data?.response?.numFound || 0;

    return { docs, numFound };
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
