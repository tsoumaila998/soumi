import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Bookmark, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useMyList } from '../hooks/useMyList';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const { count: myListCount } = useMyList();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.movies'), path: '/movies' },
    { name: t('nav.tvShows'), path: '/tv' },
    { name: t('nav.myList'), path: '/my-list', badge: myListCount },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0f]/90 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/5 py-3'
            : 'bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/40 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Brand Wordmark */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e50914] rounded-xl p-1"
                aria-label={t('nav.home')}
              >
                <div className="w-9 h-9 rounded-xl bg-[#e50914] flex items-center justify-center text-white shadow-md shadow-[#e50914]/30 group-hover:scale-105 transition-transform">
                  <Film className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Outfit']">
                  SOU<span className="text-[#e50914]">MI</span>
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <span className="flex items-center gap-1.5">
                        {link.name}
                        {link.badge !== undefined && link.badge > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#e50914] text-white">
                            {link.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#e50914] rounded-full" />
                        )}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden sm:block flex-1 max-w-md mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:bg-white/10 text-white placeholder-zinc-500 rounded-xl border border-white/10 focus:border-[#e50914] focus:outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  aria-label={t('nav.search')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Language Switcher & Mobile Menu Trigger */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Mobile Search Icon */}
              <Link
                to="/search"
                className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={t('nav.search')}
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* EN / FR Language Switcher */}
              <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-[#e50914] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Switch to English"
                >
                  EN
                </button>
                <span className="text-zinc-600 px-0.5">|</span>
                <button
                  type="button"
                  onClick={() => setLanguage('fr')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    language === 'fr'
                      ? 'bg-[#e50914] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Passer en Français"
                >
                  FR
                </button>
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.menu')}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl pt-24 px-6 flex flex-col justify-between pb-8">
          <div className="space-y-6">
            {/* Mobile Search input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 text-base bg-white/10 text-white placeholder-zinc-400 rounded-xl border border-white/10 focus:border-[#e50914] focus:outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-[#e50914]/15 text-[#e50914] font-semibold'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`
                  }
                >
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#e50914] text-white">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Mobile Footer Language */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-400" />
              {t('nav.language')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  language === 'en' ? 'bg-[#e50914] text-white' : 'bg-white/5 text-zinc-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  language === 'fr' ? 'bg-[#e50914] text-white' : 'bg-white/5 text-zinc-400'
                }`}
              >
                Français
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
