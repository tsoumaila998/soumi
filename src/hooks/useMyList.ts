import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  id: string | number;
  mediaType: 'movie' | 'tv';
  title: string;
  titleFr?: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  releaseDate: string;
  genres: string[];
  overview: string;
  overviewFr?: string;
  addedAt?: number;
}

const STORAGE_KEY = 'cineverse_my_list';
const EVENT_NAME = 'cineverse_watchlist_updated';

export function useMyList() {
  const [list, setList] = useState<WatchlistItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
      return [];
    }
  });

  const syncFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setList(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error('Failed to parse watchlist', e);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        syncFromStorage();
      }
    };

    const handleCustomEvent = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(EVENT_NAME, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
    };
  }, [syncFromStorage]);

  const saveList = useCallback((newList: WatchlistItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
      setList(newList);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, []);

  const isInList = useCallback(
    (id: string | number, mediaType?: 'movie' | 'tv') => {
      return list.some(
        (item) => String(item.id) === String(id) && (!mediaType || item.mediaType === mediaType)
      );
    },
    [list]
  );

  const addToList = useCallback(
    (item: WatchlistItem) => {
      if (!isInList(item.id, item.mediaType)) {
        const itemToAdd = { ...item, addedAt: Date.now() };
        const updated = [itemToAdd, ...list];
        saveList(updated);
      }
    },
    [isInList, list, saveList]
  );

  const removeFromList = useCallback(
    (id: string | number, mediaType?: 'movie' | 'tv') => {
      const updated = list.filter(
        (item) => !(String(item.id) === String(id) && (!mediaType || item.mediaType === mediaType))
      );
      saveList(updated);
    },
    [list, saveList]
  );

  const toggleInList = useCallback(
    (item: WatchlistItem): boolean => {
      if (isInList(item.id, item.mediaType)) {
        removeFromList(item.id, item.mediaType);
        return false;
      } else {
        addToList(item);
        return true;
      }
    },
    [isInList, removeFromList, addToList]
  );

  const clearList = useCallback(() => {
    saveList([]);
  }, [saveList]);

  return {
    myList: list,
    isInList,
    addToList,
    removeFromList,
    toggleInList,
    clearList,
    count: list.length,
  };
}
