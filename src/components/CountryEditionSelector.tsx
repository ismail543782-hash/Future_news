import React, { useState, useEffect } from 'react';
import { CountryEdition, Language } from '../types/news';
import { getCountryEditions, getCurrentEdition, setCurrentEdition } from '../utils/storage';
import { Globe, ChevronDown, Check, CloudSun } from 'lucide-react';

interface CountryEditionSelectorProps {
  language: Language;
  onEditionChange?: (edition: CountryEdition) => void;
}

export const CountryEditionSelector: React.FC<CountryEditionSelectorProps> = ({
  language,
  onEditionChange,
}) => {
  const [editions] = useState<CountryEdition[]>(getCountryEditions());
  const [current, setCurrent] = useState<CountryEdition>(getCurrentEdition());
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const tz = current.timezone.split(' ')[0] || 'Asia/Dhaka';
        const formatted = new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now);
        setLocalTime(formatted);
      } catch {
        const now = new Date();
        setLocalTime(now.toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [current, language]);

  const handleSelect = (edition: CountryEdition) => {
    setCurrent(edition);
    setCurrentEdition(edition.id);
    setIsOpen(false);
    if (onEditionChange) {
      onEditionChange(edition);
    }
  };

  return (
    <div className="relative inline-block text-left text-xs">
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        id="edition-selector-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500"
        title={language === 'bn' ? 'দেশ ও আন্তর্জাতিক সংস্করণ নির্বাচন করুন' : 'Select Country & Regional Edition'}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="font-semibold hidden sm:inline">
          {language === 'bn' ? current.name_bn : current.name_en}
        </span>
        <span className="text-stone-400 font-normal hidden lg:inline">
          ({current.city_en} {current.weather_temp_c}°C)
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="edition-selector-dropdown"
            className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-72 sm:w-80 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header info */}
            <div className="p-3 bg-stone-950/80 border-b border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-rose-500" />
                  {language === 'bn' ? 'বৈশ্বিক সংস্করণ ও সময়' : 'Global Regional Editions'}
                </span>
                <span className="text-[11px] font-mono text-rose-400 font-semibold">
                  {localTime}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                {language === 'bn'
                  ? 'আপনার অবস্থান বা পছন্দের দেশ নির্বাচন করলে স্থানীয় মুদ্রা ও আবহাওয়া আপডেট হবে।'
                  : 'Select your country to tailor currency exchange, timezone and local feeds.'}
              </p>
            </div>

            {/* Edition items list */}
            <div className="max-h-72 overflow-y-auto py-1 divide-y divide-stone-800/60">
              {editions.map((ed) => {
                const isSelected = ed.id === current.id;
                return (
                  <button
                    key={ed.id}
                    type="button"
                    onClick={() => handleSelect(ed)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-rose-950/40 text-white border-l-2 border-rose-500'
                        : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ed.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-white">
                            {language === 'bn' ? ed.name_bn : ed.name_en}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            • {language === 'bn' ? ed.city_bn : ed.city_en}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                          <span className="text-emerald-400 font-mono font-medium">
                            {ed.currency_label}: {ed.currency_rate}
                          </span>
                          <span>|</span>
                          <span className="flex items-center gap-1 text-amber-300 font-medium">
                            <CloudSun className="w-3 h-3" />
                            {ed.weather_temp_c}°C ({language === 'bn' ? ed.weather_desc_bn : ed.weather_desc_en})
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-stone-950/90 border-t border-stone-800 text-[10px] text-stone-400 text-center">
              {language === 'bn'
                ? 'বিশ্বের যেকোনো দেশ থেকে নির্বিঘ্নে ব্রাউজ ও খবর পড়ার সুবিধা'
                : 'Worldwide real-time news reporting & multi-region network'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
