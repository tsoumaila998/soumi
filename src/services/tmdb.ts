import { MediaItem, CastMember } from '../data/types';
import {
  mockMovies,
  getTrendingTitles as getMockTrending,
  getPopularMovies as getMockPopularMovies,
  getPopularTv as getMockPopularTv,
  getTopRated as getMockTopRated,
  getComingSoon as getMockComingSoon,
  getMediaById as getMockMediaById,
  getSimilarMedia as getMockSimilarMedia,
  searchMedia as searchMockMedia,
} from '../data/mediaService';

const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/original';
const TMDB_IMAGE_BASE_PROFILE = 'https://image.tmdb.org/t/p/w500';

export interface GenreItem {
  id: number;
  name: string;
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
  isFallback?: boolean;
}

// Image Helpers
export function getPosterUrl(path?: string | null): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE_POSTER}${path}`;
}

export function getBackdropUrl(path?: string | null): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE_BACKDROP}${path}`;
}

export function getProfileUrl(path?: string | null): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${TMDB_IMAGE_BASE_PROFILE}${path}`;
}

// Convert app language ('en' | 'fr') to TMDb format ('en-US' | 'fr-FR')
export function normalizeLanguage(lang: string = 'en'): string {
  if (lang.toLowerCase().startsWith('fr')) return 'fr-FR';
  return 'en-US';
}

// Cache of genre dictionaries (id -> name)
let movieGenresMap: Record<number, string> = {};
let tvGenresMap: Record<number, string> = {};

export async function fetchProxy(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `/api/tmdb/${cleanEndpoint}${query.toString() ? `?${query.toString()}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.error || 'Failed to fetch from TMDb proxy');
    error.status = res.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

// Normalizers
export function normalizeMovie(item: any): MediaItem {
  const genreNames = item.genres
    ? item.genres.map((g: any) => g.name)
    : (item.genre_ids || []).map((id: number) => movieGenresMap[id]).filter(Boolean);

  return {
    id: item.id,
    mediaType: 'movie',
    title: item.title || item.original_title || '',
    titleFr: item.title || item.original_title || '',
    originalTitle: item.original_title,
    releaseDate: item.release_date || '',
    rating: Number(item.vote_average?.toFixed(1)) || 0,
    voteCount: item.vote_count || 0,
    runtime: item.runtime,
    genres: genreNames.length > 0 ? genreNames : ['Cinema'],
    overview: item.overview || '',
    overviewFr: item.overview || '',
    posterUrl: getPosterUrl(item.poster_path),
    backdropUrl: getBackdropUrl(item.backdrop_path || item.poster_path),
    trailerYoutubeId: '',
    cast: [],
    director: item.director,
    status: item.status === 'Released' ? 'Released' : 'Upcoming',
  };
}

export function normalizeTV(item: any): MediaItem {
  const genreNames = item.genres
    ? item.genres.map((g: any) => g.name)
    : (item.genre_ids || []).map((id: number) => tvGenresMap[id]).filter(Boolean);

  return {
    id: item.id,
    mediaType: 'tv',
    title: item.name || item.original_name || '',
    titleFr: item.name || item.original_name || '',
    originalTitle: item.original_name,
    releaseDate: item.first_air_date || '',
    rating: Number(item.vote_average?.toFixed(1)) || 0,
    voteCount: item.vote_count || 0,
    seasons: item.number_of_seasons,
    episodes: item.number_of_episodes,
    genres: genreNames.length > 0 ? genreNames : ['Television'],
    overview: item.overview || '',
    overviewFr: item.overview || '',
    posterUrl: getPosterUrl(item.poster_path),
    backdropUrl: getBackdropUrl(item.backdrop_path || item.poster_path),
    trailerYoutubeId: '',
    cast: [],
    status: 'Released',
  };
}

// -------------------------------------------------------------
// TMDb Endpoints
// -------------------------------------------------------------

// 1. Trending Movies
export async function getTrendingMovies(lang: string = 'en'): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('trending/movie/week', { language });
    return (data.results || []).slice(0, 10).map(normalizeMovie);
  } catch (err: any) {
    console.warn('TMDb getTrendingMovies fallback triggered:', err.message);
    return getMockTrending();
  }
}

// 2. Popular Movies
export async function getPopularMovies(lang: string = 'en', page: number = 1): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('movie/popular', { language, page });
    return (data.results || []).map(normalizeMovie);
  } catch (err: any) {
    console.warn('TMDb getPopularMovies fallback triggered:', err.message);
    return getMockPopularMovies();
  }
}

// 3. Popular TV Shows
export async function getPopularTV(lang: string = 'en', page: number = 1): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('tv/popular', { language, page });
    return (data.results || []).map(normalizeTV);
  } catch (err: any) {
    console.warn('TMDb getPopularTV fallback triggered:', err.message);
    return getMockPopularTv();
  }
}

// 4. Top Rated Movies
export async function getTopRatedMovies(lang: string = 'en', page: number = 1): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('movie/top_rated', { language, page });
    return (data.results || []).map(normalizeMovie);
  } catch (err: any) {
    console.warn('TMDb getTopRatedMovies fallback triggered:', err.message);
    return getMockTopRated();
  }
}

// 5. Upcoming Movies
export async function getUpcomingMovies(lang: string = 'en', page: number = 1): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('movie/upcoming', { language, page });
    return (data.results || []).map(normalizeMovie);
  } catch (err: any) {
    console.warn('TMDb getUpcomingMovies fallback triggered:', err.message);
    return getMockComingSoon();
  }
}

// 6. Discover Movies with filters, sorting, and pagination
export async function getMovies(
  options: {
    genreId?: number | string;
    sortBy?: string;
    page?: number;
  } = {},
  lang: string = 'en'
): Promise<PaginatedResult<MediaItem>> {
  const language = normalizeLanguage(lang);
  const page = options.page || 1;

  // Map sort options to TMDb parameters
  let sortByParam = 'popularity.desc';
  if (options.sortBy === 'rating') sortByParam = 'vote_average.desc';
  else if (options.sortBy === 'releaseDate') sortByParam = 'primary_release_date.desc';
  else if (options.sortBy === 'releaseDateAsc') sortByParam = 'primary_release_date.asc';

  const params: Record<string, any> = {
    language,
    page,
    sort_by: sortByParam,
    'vote_count.gte': options.sortBy === 'rating' ? 100 : 20, // filter out low vote noise when sorting by rating
  };

  if (options.genreId && options.genreId !== 'all') {
    params.with_genres = options.genreId;
  }

  try {
    const data = await fetchProxy('discover/movie', params);
    return {
      results: (data.results || []).map(normalizeMovie),
      page: data.page || page,
      total_pages: Math.min(data.total_pages || 1, 500),
      total_results: data.total_results || 0,
    };
  } catch (err: any) {
    console.warn('TMDb getMovies fallback triggered:', err.message);
    const mock = mockMovies;
    return {
      results: mock.slice((page - 1) * 12, page * 12),
      page,
      total_pages: Math.ceil(mock.length / 12) || 1,
      total_results: mock.length,
      isFallback: true,
    };
  }
}

// 7. Discover TV Shows with filters, sorting, and pagination
export async function getTVShows(
  options: {
    genreId?: number | string;
    sortBy?: string;
    page?: number;
  } = {},
  lang: string = 'en'
): Promise<PaginatedResult<MediaItem>> {
  const language = normalizeLanguage(lang);
  const page = options.page || 1;

  let sortByParam = 'popularity.desc';
  if (options.sortBy === 'rating') sortByParam = 'vote_average.desc';
  else if (options.sortBy === 'releaseDate') sortByParam = 'first_air_date.desc';
  else if (options.sortBy === 'releaseDateAsc') sortByParam = 'first_air_date.asc';

  const params: Record<string, any> = {
    language,
    page,
    sort_by: sortByParam,
    'vote_count.gte': options.sortBy === 'rating' ? 50 : 10,
  };

  if (options.genreId && options.genreId !== 'all') {
    params.with_genres = options.genreId;
  }

  try {
    const data = await fetchProxy('discover/tv', params);
    return {
      results: (data.results || []).map(normalizeTV),
      page: data.page || page,
      total_pages: Math.min(data.total_pages || 1, 500),
      total_results: data.total_results || 0,
    };
  } catch (err: any) {
    console.warn('TMDb getTVShows fallback triggered:', err.message);
    const mock = getMockPopularTv();
    return {
      results: mock.slice((page - 1) * 12, page * 12),
      page,
      total_pages: Math.ceil(mock.length / 12) || 1,
      total_results: mock.length,
      isFallback: true,
    };
  }
}

// 8. Search Multi (movies and TV only)
export async function searchMedia(
  query: string,
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  page: number = 1,
  lang: string = 'en'
): Promise<PaginatedResult<MediaItem>> {
  if (!query || !query.trim()) {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }

  const language = normalizeLanguage(lang);

  try {
    const data = await fetchProxy('search/multi', {
      query: query.trim(),
      language,
      page,
      include_adult: false,
    });

    // Filter only movie and tv (exclude person)
    const filtered = (data.results || []).filter((item: any) => {
      if (item.media_type !== 'movie' && item.media_type !== 'tv') return false;
      if (mediaType === 'movie' && item.media_type !== 'movie') return false;
      if (mediaType === 'tv' && item.media_type !== 'tv') return false;
      return true;
    });

    const normalized = filtered.map((item: any) =>
      item.media_type === 'movie' ? normalizeMovie(item) : normalizeTV(item)
    );

    return {
      results: normalized,
      page: data.page || 1,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || normalized.length,
    };
  } catch (err: any) {
    console.warn('TMDb searchMedia fallback triggered:', err.message);
    const mockResults = searchMockMedia(query, mediaType);
    return {
      results: mockResults,
      page: 1,
      total_pages: 1,
      total_results: mockResults.length,
      isFallback: true,
    };
  }
}

// 9. Movie Details
export async function getMovieDetails(id: string | number, lang: string = 'en'): Promise<MediaItem> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`movie/${id}`, { language });
    return normalizeMovie(data);
  } catch (err: any) {
    console.warn(`TMDb getMovieDetails(${id}) fallback triggered:`, err.message);
    const mock = getMockMediaById(id, 'movie');
    if (mock) return mock;
    throw err;
  }
}

// 10. TV Details
export async function getTVDetails(id: string | number, lang: string = 'en'): Promise<MediaItem> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`tv/${id}`, { language });
    return normalizeTV(data);
  } catch (err: any) {
    console.warn(`TMDb getTVDetails(${id}) fallback triggered:`, err.message);
    const mock = getMockMediaById(id, 'tv');
    if (mock) return mock;
    throw err;
  }
}

// 11. Movie Credits (top 10 actors)
export async function getMovieCredits(id: string | number, lang: string = 'en'): Promise<CastMember[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`movie/${id}/credits`, { language });
    return (data.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || '',
      profileUrl: getProfileUrl(c.profile_path),
    }));
  } catch (err: any) {
    const mock = getMockMediaById(id, 'movie');
    return mock?.cast?.slice(0, 10) || [];
  }
}

// 12. TV Credits (top 10 actors)
export async function getTVCredits(id: string | number, lang: string = 'en'): Promise<CastMember[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`tv/${id}/credits`, { language });
    return (data.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || '',
      profileUrl: getProfileUrl(c.profile_path),
    }));
  } catch (err: any) {
    const mock = getMockMediaById(id, 'tv');
    return mock?.cast?.slice(0, 10) || [];
  }
}

// 13. Movie Videos (Find official YouTube trailer)
export async function getMovieVideos(id: string | number, lang: string = 'en'): Promise<string | null> {
  const language = normalizeLanguage(lang);
  try {
    // Try in selected language
    let data = await fetchProxy(`movie/${id}/videos`, { language });
    let trailer = findYouTubeTrailer(data.results);

    // If not found in FR, fallback to English trailer
    if (!trailer && language !== 'en-US') {
      data = await fetchProxy(`movie/${id}/videos`, { language: 'en-US' });
      trailer = findYouTubeTrailer(data.results);
    }
    return trailer;
  } catch (err: any) {
    const mock = getMockMediaById(id, 'movie');
    return mock?.trailerYoutubeId || null;
  }
}

// 14. TV Videos (Find official YouTube trailer)
export async function getTVVideos(id: string | number, lang: string = 'en'): Promise<string | null> {
  const language = normalizeLanguage(lang);
  try {
    let data = await fetchProxy(`tv/${id}/videos`, { language });
    let trailer = findYouTubeTrailer(data.results);

    if (!trailer && language !== 'en-US') {
      data = await fetchProxy(`tv/${id}/videos`, { language: 'en-US' });
      trailer = findYouTubeTrailer(data.results);
    }
    return trailer;
  } catch (err: any) {
    const mock = getMockMediaById(id, 'tv');
    return mock?.trailerYoutubeId || null;
  }
}

function findYouTubeTrailer(videos: any[] = []): string | null {
  if (!videos || videos.length === 0) return null;

  // 1. Official YouTube Trailer
  const officialTrailer = videos.find(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true
  );
  if (officialTrailer?.key) return officialTrailer.key;

  // 2. Any YouTube Trailer
  const anyTrailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
  if (anyTrailer?.key) return anyTrailer.key;

  // 3. Any YouTube Teaser
  const anyTeaser = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser');
  if (anyTeaser?.key) return anyTeaser.key;

  // 4. Any YouTube Video
  const anyVideo = videos.find((v: any) => v.site === 'YouTube');
  return anyVideo?.key || null;
}

// 15. Similar Movies
export async function getSimilarMovies(id: string | number, lang: string = 'en'): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`movie/${id}/similar`, { language });
    return (data.results || []).slice(0, 6).map(normalizeMovie);
  } catch (err: any) {
    const mock = getMockMediaById(id, 'movie');
    return mock ? getMockSimilarMedia(mock, 6) : [];
  }
}

// 16. Similar TV Shows
export async function getSimilarTV(id: string | number, lang: string = 'en'): Promise<MediaItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy(`tv/${id}/similar`, { language });
    return (data.results || []).slice(0, 6).map(normalizeTV);
  } catch (err: any) {
    const mock = getMockMediaById(id, 'tv');
    return mock ? getMockSimilarMedia(mock, 6) : [];
  }
}

// 17. Movie Genres List
export async function getMovieGenres(lang: string = 'en'): Promise<GenreItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('genre/movie/list', { language });
    const genres: GenreItem[] = data.genres || [];
    genres.forEach((g) => {
      movieGenresMap[g.id] = g.name;
    });
    return genres;
  } catch (err: any) {
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' },
    ];
  }
}

// 18. TV Genres List
export async function getTVGenres(lang: string = 'en'): Promise<GenreItem[]> {
  const language = normalizeLanguage(lang);
  try {
    const data = await fetchProxy('genre/tv/list', { language });
    const genres: GenreItem[] = data.genres || [];
    genres.forEach((g) => {
      tvGenresMap[g.id] = g.name;
    });
    return genres;
  } catch (err: any) {
    return [
      { id: 10759, name: 'Action & Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 10762, name: 'Kids' },
      { id: 9648, name: 'Mystery' },
      { id: 10763, name: 'News' },
      { id: 10764, name: 'Reality' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10766, name: 'Soap' },
      { id: 10767, name: 'Talk' },
      { id: 10768, name: 'War & Politics' },
      { id: 37, name: 'Western' },
    ];
  }
}

// 19. Watch Providers
export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface CountryWatchProviders {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  free?: WatchProviderItem[];
  ads?: WatchProviderItem[];
}

export interface WatchProvidersData {
  id: number;
  results: Record<string, CountryWatchProviders>;
}

export function getProviderLogoUrl(path?: string | null): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w92${path}`;
}

export async function getWatchProviders(
  id: string | number,
  mediaType: 'movie' | 'tv'
): Promise<WatchProvidersData | null> {
  try {
    const endpoint = `${mediaType}/${id}/watch/providers`;
    const data = await fetchProxy(endpoint);
    if (data && data.results) {
      return data as WatchProvidersData;
    }
  } catch (err: any) {
    console.warn(`TMDb watch providers fallback for ${mediaType} ${id}:`, err);
  }
  return null;
}

