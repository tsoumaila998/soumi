import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { RootLayout } from './layouts/RootLayout';

// Code-split routes for optimal performance and smaller initial bundle size
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MoviesPage = lazy(() => import('./pages/MoviesPage').then((m) => ({ default: m.MoviesPage })));
const TvShowsPage = lazy(() => import('./pages/TvShowsPage').then((m) => ({ default: m.TvShowsPage })));
const DetailPage = lazy(() => import('./pages/DetailPage').then((m) => ({ default: m.DetailPage })));
const MyListPage = lazy(() => import('./pages/MyListPage').then((m) => ({ default: m.MyListPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-white/10 border-t-[#e50914] rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="movies" element={<MoviesPage />} />
              <Route path="tv" element={<TvShowsPage />} />
              <Route path="movie/:id" element={<DetailPage />} />
              <Route path="tv/:id" element={<DetailPage />} />
              <Route path="my-list" element={<MyListPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}
