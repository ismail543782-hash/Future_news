import React, { useState, useEffect } from 'react';
import {
  WeatherData,
  GeocodingResult,
  fetchLiveWeather,
  searchGlobalLocations,
  detectUserCoordinates,
  reverseGeocode,
  getSavedLocation,
} from '../services/weatherService';
import {
  X,
  Search,
  MapPin,
  Compass,
  RefreshCw,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Calendar,
  Sparkles,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { Language } from '../types/news';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onWeatherUpdated?: (data: WeatherData) => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  language,
  onWeatherUpdated,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Popular quick city presets
  const popularCities = [
    { name_bn: 'ঢাকা', name_en: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
    { name_bn: 'চট্টগ্রাম', name_en: 'Chittagong', country: 'Bangladesh', lat: 22.3569, lon: 91.7832 },
    { name_bn: 'সিলেট', name_en: 'Sylhet', country: 'Bangladesh', lat: 24.8949, lon: 91.8687 },
    { name_bn: 'রাজশাহী', name_en: 'Rajshahi', country: 'Bangladesh', lat: 24.3745, lon: 88.6042 },
    { name_bn: 'লন্ডন', name_en: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
    { name_bn: 'নিউ ইয়র্ক', name_en: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
    { name_bn: 'দুবাই', name_en: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
    { name_bn: 'রিয়াদ', name_en: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  ];

  // Load weather on mount
  useEffect(() => {
    if (isOpen) {
      loadInitialWeather();
    }
  }, [isOpen]);

  const loadInitialWeather = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loc = getSavedLocation();
      const data = await fetchLiveWeather(loc.latitude, loc.longitude, loc.city, loc.country);
      setWeather(data);
      if (onWeatherUpdated) onWeatherUpdated(data);
    } catch (err: any) {
      setErrorMessage(
        language === 'bn'
          ? 'আবহাওয়া ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Failed to load initial weather data. Please retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCurrent = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (weather) {
        const data = await fetchLiveWeather(
          weather.latitude,
          weather.longitude,
          weather.city,
          weather.country
        );
        setWeather(data);
        if (onWeatherUpdated) onWeatherUpdated(data);
      } else {
        await loadInitialWeather();
      }
    } catch (err: any) {
      setErrorMessage(
        language === 'bn'
          ? 'আবহাওয়া তথ্য রিফ্রেশ করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Failed to refresh live weather data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const results = await searchGlobalLocations(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMessage(
          language === 'bn'
            ? 'এই নামে কোনো স্থান বা শহর খুঁজে পাওয়া যায়নি।'
            : 'No matching location found. Please check spelling.'
        );
      }
    } catch (err) {
      setErrorMessage('অনুসন্ধানে ত্রুটি দেখা দিয়েছে।');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = async (
    lat: number,
    lon: number,
    cityName: string,
    countryName: string
  ) => {
    setIsLoading(true);
    setSearchResults([]);
    setSearchQuery('');
    setErrorMessage(null);
    try {
      const data = await fetchLiveWeather(lat, lon, cityName, countryName);
      setWeather(data);
      if (onWeatherUpdated) onWeatherUpdated(data);
    } catch (err) {
      setErrorMessage('আবহাওয়া লোড ব্যর্থ হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectGps = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const coords = await detectUserCoordinates();
      const geoInfo = await reverseGeocode(coords.latitude, coords.longitude);
      const data = await fetchLiveWeather(
        coords.latitude,
        coords.longitude,
        geoInfo.city || 'আমার অবস্থান',
        geoInfo.country
      );
      setWeather(data);
      if (onWeatherUpdated) onWeatherUpdated(data);
    } catch (err: any) {
      setErrorMessage(
        language === 'bn'
          ? 'জিপিএস অবস্থান সনাক্ত করতে ব্রাউজারের অনুমতি প্রয়োজন।'
          : 'Could not access GPS coordinates. Please grant location permissions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="weather-modal-card"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl">
              🌤️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-1.5">
                {language === 'bn' ? 'রিয়েল-টাইম লাইভ আবহাওয়া' : 'Live Global Weather Report'}
              </h3>
              <p className="text-xs text-sky-200">
                {language === 'bn'
                  ? 'সরাসরি বিশ্ব আবহাওয়া উপগ্রহ ও বিজ্ঞান ডাটাবেজ (Open-Meteo) থেকে সংগৃহীত'
                  : 'Real live meteorological data & automated 24h precipitation forecast'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="weather-modal-refresh"
              onClick={handleRefreshCurrent}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              id="weather-modal-close"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Location Search Bar */}
          <div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="weather-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'যেকোনো শহর বা দেশের নাম লিখুন (যেমন: ঢাকা, সিলেট, London, New York...)'
                      : 'Search any city or country (e.g. Dhaka, Dubai, London...)'
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-stone-900"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>

              <button
                type="submit"
                id="weather-search-btn"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              </button>

              <button
                type="button"
                id="weather-gps-btn"
                onClick={handleDetectGps}
                disabled={isLoading}
                className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="বর্তমান অবস্থান সনাক্ত করুন"
              >
                <Compass className="w-4 h-4 text-sky-600" />
                <span className="hidden md:inline">{language === 'bn' ? 'আমার অবস্থান' : 'GPS'}</span>
              </button>
            </form>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                {errorMessage}
              </div>
            )}

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-stone-300 rounded-xl shadow-lg overflow-hidden divide-y divide-stone-100">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() =>
                      handleSelectLocation(res.latitude, res.longitude, res.name, res.country)
                    }
                    className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between text-xs text-stone-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-stone-900">{res.name}</span>
                      <span className="text-stone-500">
                        {res.admin1 ? `${res.admin1}, ` : ''}
                        {res.country}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-sky-600" />
              {language === 'bn' ? 'দ্রুত বাছাই:' : 'Quick:'}
            </span>
            {popularCities.map((c) => (
              <button
                key={c.name_en}
                type="button"
                onClick={() =>
                  handleSelectLocation(
                    c.lat,
                    c.lon,
                    language === 'bn' ? `${c.name_bn} (${c.name_en})` : c.name_en,
                    c.country
                  )
                }
                className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-sky-100 hover:text-sky-800 text-stone-700 font-medium whitespace-nowrap transition-colors border border-stone-200 shrink-0"
              >
                {language === 'bn' ? c.name_bn : c.name_en}
              </button>
            ))}
          </div>

          {/* Weather Content View */}
          {weather && (
            <div className="space-y-4">
              {/* Today's Main Live Card */}
              <div className="bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white rounded-2xl p-5 border border-sky-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sky-900 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>{weather.city}</span>
                    {weather.country && (
                      <span className="text-xs text-stone-500 font-normal">
                        ({weather.country})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200">
                    {language === 'bn' ? `সর্বশেষ: ${weather.lastUpdated}` : `Updated: ${weather.lastUpdated}`}
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl sm:text-6xl drop-shadow-sm select-none">
                      {weather.current.icon}
                    </span>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-stone-900 font-mono tracking-tight">
                          {weather.current.tempC}°
                        </span>
                        <span className="text-lg text-stone-600 font-semibold">C</span>
                      </div>
                      <p className="text-sm font-bold text-sky-900 mt-0.5">
                        {language === 'bn' ? weather.current.conditionBn : weather.current.conditionEn}
                      </p>
                      <p className="text-xs text-stone-600">
                        {language === 'bn'
                          ? `অনুভূত: ${weather.current.apparentTempC}°C`
                          : `Feels like: ${weather.current.apparentTempC}°C`}
                      </p>
                    </div>
                  </div>

                  {/* Today's Rain & High/Low Box */}
                  <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-sky-100 shadow-xs space-y-2 text-xs sm:min-w-[180px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                        {language === 'bn' ? 'সর্বোচ্চ / সর্বনিম্ন' : 'Max / Min'}
                      </span>
                      <span className="font-bold text-stone-900 font-mono">
                        {weather.today.maxTempC}° / {weather.today.minTempC}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                        {language === 'bn' ? 'বৃষ্টির সম্ভাবনা' : 'Rain Chance'}
                      </span>
                      <span className="font-bold text-sky-700 font-mono">
                        {weather.today.rainProbabilityPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-indigo-500" />
                        {language === 'bn' ? 'আর্দ্রতা' : 'Humidity'}
                      </span>
                      <span className="font-bold text-stone-800 font-mono">
                        {weather.current.humidity}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-teal-500" />
                        {language === 'bn' ? 'বাতাসের গতি' : 'Wind Speed'}
                      </span>
                      <span className="font-bold text-stone-800 font-mono">
                        {weather.current.windSpeedKmh} km/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tomorrow's Forecast (User explicit request: "kal ki hobe beisti ki kemon hobe") */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                      {language === 'bn' ? 'আগামীকালের পূর্বাভাস (Tomorrow\'s Forecast)' : 'Tomorrow\'s Weather Forecast'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 border border-amber-300">
                    {language === 'bn' ? '২৪ ঘণ্টার পূর্বাভাস' : '24h Forecast'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Temp forecast */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                    <span className="text-2xl">{weather.tomorrow.icon}</span>
                    <div>
                      <span className="text-[11px] text-stone-500 block">
                        {language === 'bn' ? 'সম্ভাব্য তাপমাত্রা' : 'Expected Temp'}
                      </span>
                      <span className="text-sm font-extrabold text-stone-900 font-mono">
                        {weather.tomorrow.maxTempC}°C / {weather.tomorrow.minTempC}°C
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium block">
                        {language === 'bn' ? weather.tomorrow.conditionBn : weather.tomorrow.conditionEn}
                      </span>
                    </div>
                  </div>

                  {/* Rain prediction */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">
                        {language === 'bn' ? 'বৃষ্টি কেমন হবে?' : 'Rain Likelihood'}
                      </span>
                      <span className="text-sm font-extrabold text-sky-700 font-mono">
                        {weather.tomorrow.rainProbabilityPercent}% সম্ভাবনা
                      </span>
                      <span className="text-[11px] text-stone-600 block">
                        {weather.tomorrow.precipitationSumMm > 0
                          ? `আনুমানিক ~${weather.tomorrow.precipitationSumMm} মিমি বৃষ্টি`
                          : 'বৃষ্টিহীন বা শুষ্ক থাকার সম্ভাবনা'}
                      </span>
                    </div>
                  </div>

                  {/* Advisory */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">
                        {language === 'bn' ? 'আবহাওয়া পরার্মশ' : 'Daily Advisory'}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 block">
                        {weather.tomorrow.rainProbabilityPercent > 50
                          ? 'বাইরে গেলে সাথে ছাতা রাখুন।'
                          : weather.tomorrow.maxTempC > 35
                          ? 'তীব্র রোদ ও গরম; পর্যাপ্ত পানি পান করুন।'
                          : 'স্বাভাবিক ও সুন্দর দিন কাটবে।'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3 flex items-center justify-between text-[11px] text-stone-500">
          <span>
            {language === 'bn'
              ? 'বিশ্বের যেকোনো শহরের নাম লিখে সার্চ করতে পারেন।'
              : 'Global live weather forecasts powered by Open-Meteo.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-semibold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
