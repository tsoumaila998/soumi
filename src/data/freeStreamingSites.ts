export interface FreeStreamingSite {
  id: string;
  name: string;
  description: string;
  url: string;
  searchUrl: string;
  badge: 'adSupported' | 'publicDomain' | 'free';
  brandColor: string;
  bgColor: string;
  shortTag: string;
}

export const FREE_STREAMING_SITES: FreeStreamingSite[] = [
  {
    id: 'tubi',
    name: 'Tubi',
    description: '40,000+ movies & TV series 100% free with ads from major studios.',
    url: 'https://tubitv.com',
    searchUrl: 'https://tubitv.com/search/{query}',
    badge: 'adSupported',
    brandColor: '#FA3200',
    bgColor: 'rgba(250, 50, 0, 0.15)',
    shortTag: 'TUBI',
  },
  {
    id: 'pluto-tv',
    name: 'Pluto TV',
    description: 'Hundreds of live channels and thousands of on-demand movies & shows.',
    url: 'https://pluto.tv',
    searchUrl: 'https://pluto.tv/en/search?q={query}',
    badge: 'adSupported',
    brandColor: '#FFDF00',
    bgColor: 'rgba(255, 223, 0, 0.15)',
    shortTag: 'PLUTO',
  },
  {
    id: 'plex',
    name: 'Plex',
    description: '50,000+ on-demand free movies, shows, and 600+ free live TV channels.',
    url: 'https://watch.plex.tv',
    searchUrl: 'https://watch.plex.tv/search?q={query}',
    badge: 'adSupported',
    brandColor: '#E5A00D',
    bgColor: 'rgba(229, 160, 13, 0.15)',
    shortTag: 'PLEX',
  },
  {
    id: 'roku',
    name: 'The Roku Channel',
    description: 'Free Hollywood blockbusters, award-winning Roku Originals, and live TV.',
    url: 'https://therokuchannel.roku.com',
    searchUrl: 'https://therokuchannel.roku.com/search/{query}',
    badge: 'adSupported',
    brandColor: '#662D91',
    bgColor: 'rgba(102, 45, 145, 0.2)',
    shortTag: 'ROKU',
  },
  {
    id: 'crackle',
    name: 'Crackle',
    description: 'Free unedited streaming library of cult classics, comedies, and dramas.',
    url: 'https://www.crackle.com',
    searchUrl: 'https://www.crackle.com/search?q={query}',
    badge: 'adSupported',
    brandColor: '#FF6600',
    bgColor: 'rgba(255, 102, 0, 0.15)',
    shortTag: 'CRACKLE',
  },
  {
    id: 'youtube-movies',
    name: 'YouTube Movies & TV',
    description: 'Free with Ads full-length movies catalog streamed directly on YouTube.',
    url: 'https://www.youtube.com/feed/storefront',
    searchUrl: 'https://www.youtube.com/results?search_query={query}+full+movie',
    badge: 'free',
    brandColor: '#FF0000',
    bgColor: 'rgba(255, 0, 0, 0.15)',
    shortTag: 'YT',
  },
  {
    id: 'fawesome',
    name: 'Fawesome',
    description: 'Over 100,000 free movies and shows with no subscription required.',
    url: 'https://fawesome.tv',
    searchUrl: 'https://fawesome.tv/search?q={query}',
    badge: 'adSupported',
    brandColor: '#00C49F',
    bgColor: 'rgba(0, 196, 159, 0.15)',
    shortTag: 'FAWESOME',
  },
  {
    id: 'internet-archive',
    name: 'Internet Archive',
    description: 'Legal non-profit digital library offering public domain and archival films.',
    url: 'https://archive.org',
    searchUrl: 'https://archive.org/search?query={query}',
    badge: 'publicDomain',
    brandColor: '#3498DB',
    bgColor: 'rgba(52, 152, 219, 0.15)',
    shortTag: 'ARCHIVE',
  },
];
