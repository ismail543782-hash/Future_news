import React, { useState, useEffect } from 'react';
import { Category, Language, CountryEdition } from '../types/news';
import { Search, Globe, Shield, Lock, Menu, X, Flame, PenTool, Sparkles, BookOpen } from 'lucide-react';
import { AdBanner } from './AdBanner';
import { CountryEditionSelector } from './CountryEditionSelector';

interface HeaderProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onSearch: (query: string) => void;
  searchQuery: string;
  onGoHome: () => void;
  isBlogHubActive?: boolean;
  onOpenBlogHub?: () => void;
  isBookHubActive?: boolean;
  onOpenBookHub?: () => void;
  onOpenWriteBlog?: () => void;
  onEditionChange?: (edition: CountryEdition) => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  language,
  onToggleLanguage,
  onOpenAdmin,
  isAdmin,
  onSearch,
  searchQuery,
  onGoHome,
  isBlogHubActive,
  onOpenBlogHub,
  isBookHubActive,
  onOpenBookHub,
  onOpenWriteBlog,
  onEditionChange,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (language === 'bn') {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        // Bengali locale formatted date
        setCurrentDateTime(now.toLocaleDateString('bn-BD', options));
      } else {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
        setCurrentDateTime(now.toLocaleDateString('en-US', options));
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [language]);

  return (
    <header className="w-full bg-white border-b border-stone-200 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            {/* Country and International Edition Selector */}
            <CountryEditionSelector
              language={language}
              onEditionChange={onEditionChange}
            />

            <span className="hidden sm:inline-block text-stone-600">|</span>
            <span className="text-stone-300 font-medium hidden sm:inline">{currentDateTime}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Write Blog Quick Trigger */}
            {onOpenWriteBlog && (
              <button
                type="button"
                id="header-post-blog-quick-btn"
                onClick={onOpenWriteBlog}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold transition-colors"
                title={language === 'bn' ? 'ছবি ও গল্প আপলোড করুন' : 'Upload photo & story'}
              >
                <PenTool className="w-3 h-3 text-rose-400" />
                <span>{language === 'bn' ? 'ব্লগ লিখুন' : 'Post Blog'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 rounded-md p-0.5 border border-stone-700 text-xs">
              <button
                type="button"
                id="btn-lang-bn"
                onClick={() => onToggleLanguage('bn')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  language === 'bn'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                id="btn-lang-en"
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Admin Panel Access Button - Discreet Lock Icon Only */}
            <button
              type="button"
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                isAdmin
                  ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 ring-1 ring-emerald-500/40'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="Secure Login"
              aria-label="Secure Access"
            >
              {isAdmin ? (
                <Shield className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-stone-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead / Logo Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              id="brand-logo-btn"
              onClick={onGoHome}
              className="group text-left focus:outline-none"
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-extrabold text-3xl sm:text-4xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                  FUTURE<span className="text-rose-600 font-serif">NEWS</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-widest hidden sm:inline-block">
                  {language === 'bn' ? 'দৈনিক সংবাদপত্র' : 'Daily Edition'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5 tracking-wide">
                {language === 'bn'
                  ? 'সত্য ও সময়ের প্রতিচ্ছবি • বিশ্বস্ত মুক্ত সাংবাদিকতা'
                  : 'Independent Journalism • In-depth Analysis & Truth'}
              </p>
            </button>

            {/* Mobile Hamburger & Search */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-2 text-stone-600 hover:text-stone-900 rounded-md"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-600 hover:text-stone-900 rounded-md"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Header Ad Slot (Leaderboard 728x90) */}
          <div className="w-full md:max-w-[580px] lg:max-w-[700px]">
            <AdBanner slot="header_leaderboard" className="my-0" />
          </div>
        </div>

        {/* Mobile Search Bar (expanded) */}
        {showSearchInput && (
          <div className="mt-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={language === 'bn' ? 'খবর খুঁজুন...' : 'Search news...'}
                className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* Category Navigation Bar */}
      <nav className="border-t border-b border-stone-200 bg-stone-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Desktop Categories */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 overflow-x-auto py-1 scrollbar-none">
              <button
                type="button"
                id="cat-all-btn"
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${
                  activeCategory === null && !isBlogHubActive && !isBookHubActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-700 hover:text-rose-600 hover:bg-stone-100'
                }`}
              >
                {language === 'bn' ? 'সব খবর' : 'All News'}
              </button>

              {/* Dedicated Book Hub Navigation Tab */}
              {onOpenBookHub && (
                <button
                  type="button"
                  id="nav-btn-book-hub"
                  onClick={onOpenBookHub}
                  className={`px-3 py-2 text-sm font-bold whitespace-nowrap rounded-md transition-all flex items-center gap-1.5 ${
                    isBookHubActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বই ও ই-লাইব্রেরি' : 'Books & E-Library'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                    PDF
                  </span>
                </button>
              )}

              {/* Dedicated Blog Hub Navigation Tab */}
              {onOpenBlogHub && (
                <button
                  type="button"
                  id="nav-btn-blog-hub"
                  onClick={onOpenBlogHub}
                  className={`px-3 py-2 text-sm font-bold whitespace-nowrap rounded-md transition-all flex items-center gap-1.5 ${
                    isBlogHubActive
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-700 hover:text-purple-800 hover:bg-purple-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ব্লগ ও মতামত' : 'Blogs & Opinion'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                    {language === 'bn' ? 'মুক্ত কলম' : 'Hub'}
                  </span>
                </button>
              )}

              {categories
                .filter((c) => c.is_active)
                .sort((a, b) => a.display_order - b.display_order)
                .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    id={`cat-btn-${cat.slug}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-md transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-rose-600 hover:bg-stone-100'
                    }`}
                  >
                    {language === 'bn' ? cat.name_bn : cat.name_en}
                  </button>
                ))}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center py-1">
              <div className="relative">
                <input
                  type="text"
                  id="desktop-search-input"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder={language === 'bn' ? 'খবর খুঁজুন...' : 'Search articles...'}
                  className="w-44 lg:w-60 pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:w-64 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearch('')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Category Dropdown / List */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-stone-200 flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded text-sm font-medium ${
                  activeCategory === null && !isBlogHubActive && !isBookHubActive ? 'bg-rose-600 text-white' : 'text-stone-700'
                }`}
              >
                {language === 'bn' ? 'সব খবর' : 'All News'}
              </button>

              {onOpenBookHub && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBookHub();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm font-bold flex items-center justify-between ${
                    isBookHubActive ? 'bg-amber-600 text-white' : 'text-amber-800 bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বই ও ই-লাইব্রেরি (PDF)' : 'Books & E-Library (PDF)'}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
                    E-Book
                  </span>
                </button>
              )}

              {onOpenBlogHub && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenBlogHub();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm font-bold flex items-center justify-between ${
                    isBlogHubActive ? 'bg-purple-700 text-white' : 'text-purple-700 bg-purple-50'
                  }`}
                >
                  <span>{language === 'bn' ? 'ব্লগ ও আলোকচিত্র হাব' : 'Blog & Visual Hub'}</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}

              {onOpenWriteBlog && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenWriteBlog();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded text-sm font-bold text-rose-700 bg-rose-50 flex items-center justify-between"
                >
                  <span>{language === 'bn' ? '+ নতুন ব্লগ লিখুন' : '+ Write Blog Post'}</span>
                  <PenTool className="w-3.5 h-3.5" />
                </button>
              )}

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-sm font-medium ${
                    activeCategory === cat.id ? 'bg-rose-600 text-white' : 'text-stone-700'
                  }`}
                >
                  {language === 'bn' ? cat.name_bn : cat.name_en}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
