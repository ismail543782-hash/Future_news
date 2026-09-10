import React, { useState, useEffect } from 'react';
import { BreakingNews, Language } from '../types/news';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface BreakingNewsTickerProps {
  items: BreakingNews[];
  language: Language;
  onSelectArticle: (slug: string) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  items,
  language,
  onSelectArticle,
}) => {
  const activeItems = items.filter((i) => i.is_active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeItems.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeItems.length, isPaused]);

  if (activeItems.length === 0) return null;

  const currentItem = activeItems[currentIndex];
  const title = language === 'bn' ? currentItem.title_bn : currentItem.title_en;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  };

  return (
    <div
      className="bg-stone-900 border-y border-stone-800 text-stone-100 py-1.5 px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 bg-rose-600 text-white font-bold text-[11px] sm:text-xs uppercase px-2.5 py-0.5 rounded tracking-wider shadow-xs">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>{language === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING'}</span>
          </span>
        </div>

        {/* Headline text */}
        <div className="flex-1 overflow-hidden">
          <button
            type="button"
            onClick={() => currentItem.article_slug && onSelectArticle(currentItem.article_slug)}
            className="w-full text-left truncate text-xs sm:text-sm font-medium hover:text-rose-400 transition-colors cursor-pointer"
          >
            <span className="text-stone-300 hover:underline">{title}</span>
          </button>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1 shrink-0 text-stone-400">
          <span className="text-[11px] font-mono mr-1 hidden sm:inline text-stone-500">
            {currentIndex + 1}/{activeItems.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 hover:text-white rounded hover:bg-stone-800 transition-colors"
            aria-label="Previous breaking news"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 hover:text-white rounded hover:bg-stone-800 transition-colors"
            aria-label="Next breaking news"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
