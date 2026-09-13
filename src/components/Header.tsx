import React, { useState, useEffect } from 'react';
import { Category, Language, CountryEdition } from '../types/news';
import { Search, Globe, Shield, Lock, Menu, X, Flame, PenTool, Sparkles, BookOpen, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { AdBanner } from './AdBanner';
import { CountryEditionSelector } from './CountryEditionSelector';
import { WeatherModal } from './WeatherModal';
import { RealCalendarModal } from './RealCalendarModal';
import { fetchLiveWeather, getCachedWeather, getSavedLocation, WeatherData } from '../services/weatherService';

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
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Weather & Calendar Modals
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(() => getCachedWeather());

  // Background real-time weather refresh every 15 minutes
  useEffect(() => {
    const refreshWeather = () => {
      const loc = getSavedLocation();
      fetchLiveWeather(loc.latitude, loc.longitude, loc.city, loc.country)
        .then((data) => setWeatherData(data))
        .catch((err) => console.warn('Periodic weather update notice:', err));
    };

    refreshWeather();
    const weatherTimer = setInterval(refreshWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  const handleEditionSelect = (edition: CountryEdition) => {
    // Map edition to coordinate and fetch real-time weather immediately
    const cityCoordMap: Record<string, { lat: number; lon: number; city: string; country: string }> = {
      bd: { lat: 23.8103, lon: 90.4125, city: 'ঢাকা (Dhaka)', country: 'Bangladesh' },
      us: { lat: 40.7128, lon: -74.0060, city: 'নিউ ইয়র্ক (New York)', country: 'United States' },
      uk: { lat: 51.5074, lon: -0.1278, city: 'লন্ডন (London)', country: 'United Kingdom' },
      me: { lat: 24.7136, lon: 46.6753, city: 'রিয়াদ (Riyadh)', country: 'Saudi Arabia' },
      in: { lat: 22.5726, lon: 88.3639, city: 'কলকাতা (Kolkata)', country: 'India' },
      eu: { lat: 52.5200, lon: 13.4050, city: 'বার্লিন (Berlin)', country: 'Germany' },
      ca: { lat: 43.6532, lon: -79.3832, city: 'টরন্টো (Toronto)', country: 'Canada' },
      global: { lat: 51.5074, lon: -0.1278, city: 'লন্ডন (London)', country: 'Global' },
    };

    const target = cityCoordMap[edition.id];
    if (target) {
      fetchLiveWeather(target.lat, target.lon, target.city, target.country)
        .then((data) => setWeatherData(data))
        .catch((err) => console.warn('Edition weather update failed:', err));
    }

    if (onEditionChange) {
      onEditionChange(edition);
    }
  };

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
        setCurrentTimeStr(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
      } else {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
        setCurrentDateTime(now.toLocaleDateString('en-US', options));
        setCurrentTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
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
              onEditionChange={handleEditionSelect}
            />

            <span className="hidden sm:inline-block text-stone-600">|</span>

            {/* Real Calendar & Time Trigger */}
            <button
              type="button"
              id="header-calendar-clock-btn"
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer group"
              title={language === 'bn' ? 'ক্যালেন্ডার ও সঠিক ঘড়ি দেখতে ক্লিক করুন' : 'Click to open accurate calendar & live clock'}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium hidden md:inline">{currentDateTime}</span>
              <span className="font-mono text-rose-300 font-bold ml-0.5">{currentTimeStr}</span>
            </button>

            <span className="hidden md:inline-block text-stone-600">|</span>

            {/* Live Weather Trigger */}
            <button
              type="button"
              id="header-live-weather-btn"
              onClick={() => setIsWeatherModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-stone-800 text-sky-300 hover:text-sky-200 transition-colors cursor-pointer group"
              title={language === 'bn' ? 'আজকের ও আগামীকালের আবহাওয়া পূর্বাভাস' : 'Live weather & 24h precipitation forecast'}
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                {weatherData?.current.icon || '🌤️'}
              </span>
              <span className="font-bold text-white font-mono">
                {weatherData ? `${weatherData.current.tempC}°C` : '২৮°C'}
              </span>
              <span className="text-[11px] text-sky-400 font-medium truncate max-w-[90px] lg:max-w-[130px]">
                {weatherData ? weatherData.city.split(' ')[0] : 'ঢাকা'}
              </span>
            </button>
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
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Left: 3-line Hamburger Menu button */}
              <button
                type="button"
                id="mobile-menu-btn-left"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-1 text-stone-700 hover:text-rose-600 rounded-lg md:hidden hover:bg-stone-100 transition-colors focus:outline-none"
                aria-label="মেনু খুলুন (Toggle menu)"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-rose-600" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Brand Logo */}
              <button
                type="button"
                id="brand-logo-btn"
                onClick={onGoHome}
                className="group text-left focus:outline-none"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                    FUTURE<span className="text-rose-600 font-serif">NEWS</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-widest hidden sm:inline-block">
                    {language === 'bn' ? 'দৈনিক সংবাদপত্র' : 'Daily Edition'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 tracking-wide hidden sm:block">
                  {language === 'bn'
                    ? 'সত্য ও সময়ের প্রতিচ্ছবি • বিশ্বস্ত মুক্ত সাংবাদিকতা'
                    : 'Independent Journalism • In-depth Analysis & Truth'}
                </p>
              </button>
            </div>

            {/* Mobile Right: Weather, Calendar & Search quick icons */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                type="button"
                id="mobile-header-weather-btn"
                onClick={() => setIsWeatherModalOpen(true)}
                className="p-1.5 text-stone-700 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-colors text-xs font-bold flex items-center gap-1"
                title="আবহাওয়া"
              >
                <span>{weatherData?.current.icon || '🌤️'}</span>
                <span className="text-[11px] font-mono">{weatherData ? `${weatherData.current.tempC}°` : ''}</span>
              </button>
              <button
                type="button"
                id="mobile-header-calendar-btn"
                onClick={() => setIsCalendarModalOpen(true)}
                className="p-1.5 text-stone-600 hover:text-rose-600 rounded-md hover:bg-stone-100 transition-colors"
                title="ক্যালেন্ডার ও সময়"
              >
                <CalendarIcon className="w-5 h-5 text-stone-600" />
              </button>
              <button
                type="button"
                onClick={() => setShowSearchInput(!showSearchInput)}
                className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
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
              {/* Mobile Quick Action Buttons: Weather & Calendar */}
              <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-stone-200">
                <button
                  type="button"
                  id="mobile-drawer-weather-btn"
                  onClick={() => {
                    setIsWeatherModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition-colors"
                >
                  <span className="text-base">{weatherData?.current.icon || '🌤️'}</span>
                  <span>{language === 'bn' ? 'আবহাওয়া রিপোর্ট' : 'Live Weather'}</span>
                </button>

                <button
                  type="button"
                  id="mobile-drawer-calendar-btn"
                  onClick={() => {
                    setIsCalendarModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'bn' ? 'ক্যালেন্ডার ও সময়' : 'Real Calendar'}</span>
                </button>
              </div>

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

      {/* Real Weather Modal */}
      <WeatherModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        language={language}
        onWeatherUpdated={(updated) => setWeatherData(updated)}
      />

      {/* Real Accurate Calendar & Live Clock Modal */}
      <RealCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        language={language}
      />
    </header>
  );
};
