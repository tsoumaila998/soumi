export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string;
}

export interface MediaItem {
  id: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  titleFr: string;
  originalTitle?: string;
  releaseDate: string;
  rating: number;
  voteCount: number;
  runtime?: number; // in minutes (for movies)
  seasons?: number; // for tv
  episodes?: number; // for tv
  genres: string[];
  overview: string;
  overviewFr: string;
  posterUrl: string;
  backdropUrl: string;
  trailerYoutubeId: string;
  cast: CastMember[];
  director?: string;
  status: 'Released' | 'Upcoming';
  isTrending?: boolean;
  isPopular?: boolean;
  isTopRated?: boolean;
  isComingSoon?: boolean;
}
