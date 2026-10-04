import { mockMovies } from './movies';
import { mockTvShows } from './tvShows';
import { MediaItem } from './types';

export { mockMovies, mockTvShows };

export function getAllMedia(): MediaItem[] {
  return [...mockMovies, ...mockTvShows];
}

export function getMovies(): MediaItem[] {
  return mockMovies;
}

export function getTvShows(): MediaItem[] {
  return mockTvShows;
}

export function getMediaById(id: string | number, mediaType?: 'movie' | 'tv'): MediaItem | undefined {
  const targetId = String(id);
  const pool = mediaType === 'movie' 
    ? mockMovies 
    : mediaType === 'tv' 
    ? mockTvShows 
    : getAllMedia();
    
  return pool.find((item) => String(item.id) === targetId);
}

export function getTrendingTitles(): MediaItem[] {
  const trending = getAllMedia().filter((item) => item.isTrending);
  return trending.length > 0 ? trending : getAllMedia().slice(0, 5);
}

export function getPopularMovies(): MediaItem[] {
  return mockMovies.filter((m) => m.isPopular);
}

export function getPopularTv(): MediaItem[] {
  return mockTvShows.filter((t) => t.isPopular);
}

export function getTopRated(): MediaItem[] {
  return getAllMedia()
    .filter((m) => m.isTopRated)
    .sort((a, b) => b.rating - a.rating);
}

export function getComingSoon(): MediaItem[] {
  return getAllMedia().filter((m) => m.isComingSoon || m.status === 'Upcoming');
}

export function getSimilarMedia(item: MediaItem, limit: number = 6): MediaItem[] {
  const allInType = item.mediaType === 'movie' ? mockMovies : mockTvShows;
  const otherItems = allInType.filter((m) => String(m.id) !== String(item.id));

  // Sort by number of common genres
  const scored = otherItems.map((candidate) => {
    const common = candidate.genres.filter((g) => item.genres.includes(g)).length;
    return { candidate, score: common };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.candidate);
}

export function searchMedia(query: string, mediaType: 'all' | 'movie' | 'tv' = 'all'): MediaItem[] {
  if (!query || query.trim() === '') return [];
  const cleanQ = query.trim().toLowerCase();

  let pool: MediaItem[] = [];
  if (mediaType === 'movie') pool = mockMovies;
  else if (mediaType === 'tv') pool = mockTvShows;
  else pool = getAllMedia();

  return pool.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(cleanQ);
    const titleFrMatch = item.titleFr.toLowerCase().includes(cleanQ);
    const origMatch = item.originalTitle?.toLowerCase().includes(cleanQ);
    const overviewMatch = item.overview.toLowerCase().includes(cleanQ);
    const overviewFrMatch = item.overviewFr.toLowerCase().includes(cleanQ);
    const genreMatch = item.genres.some((g) => g.toLowerCase().includes(cleanQ));
    const castMatch = item.cast.some((c) => c.name.toLowerCase().includes(cleanQ) || c.character.toLowerCase().includes(cleanQ));
    const directorMatch = item.director?.toLowerCase().includes(cleanQ);

    return titleMatch || titleFrMatch || origMatch || overviewMatch || overviewFrMatch || genreMatch || castMatch || directorMatch;
  });
}

export function getAllGenres(mediaType?: 'movie' | 'tv'): string[] {
  const pool = mediaType === 'movie' ? mockMovies : mediaType === 'tv' ? mockTvShows : getAllMedia();
  const set = new Set<string>();
  pool.forEach((item) => {
    item.genres.forEach((g) => set.add(g));
  });
  return Array.from(set).sort();
}
