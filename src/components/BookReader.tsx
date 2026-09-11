import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, BookPage, Language } from '../types/news';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  BookOpen,
  List,
  Download,
  Share2,
  Check,
  FileText,
} from 'lucide-react';
import { saveBookProgress, getBookProgress } from '../utils/storage';

interface BookReaderProps {
  book: Book;
  language: Language;
  initialPage?: number;
  onClose: () => void;
}

type ReaderTheme = 'day' | 'sepia' | 'night';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  language,
  initialPage = 1,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [theme, setTheme] = useState<ReaderTheme>('day');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');
  const [copied, setCopied] = useState(false);

  // Derive pages
  const pages: BookPage[] = useMemo(() => {
    if (book.pages && book.pages.length > 0) {
      return book.pages;
    }
    // Fallback if no pages explicitly defined: split description or dummy intro
    return [
      {
        id: 'p-default',
        page_number: 1,
        chapter_title: book.title,
        content: book.description,
      },
    ];
  }, [book]);

  const totalPages = pages.length;

  // Sync initial page
  useEffect(() => {
    const saved = getBookProgress(book.id);
    if (initialPage && initialPage >= 1 && initialPage <= totalPages) {
      setCurrentPage(initialPage);
    } else if (saved && saved >= 1 && saved <= totalPages) {
      setCurrentPage(saved);
    }
  }, [book.id, initialPage, totalPages]);

  // Save progress on page change
  useEffect(() => {
    saveBookProgress(book.id, currentPage);
  }, [book.id, currentPage]);

  // Current page data
  const activePageData = useMemo(() => {
    return pages.find((p) => p.page_number === currentPage) || pages[0];
  }, [pages, currentPage]);

  // Keyboard navigation
  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Theme styles
  const themeStyles = {
    day: {
      bg: 'bg-[#faf8f5]',
      card: 'bg-white text-stone-900 border-stone-200/80 shadow-md',
      header: 'bg-[#faf8f5]/90 border-stone-200 text-stone-900 backdrop-blur-md',
      footer: 'bg-[#faf8f5]/90 border-stone-200 text-stone-700 backdrop-blur-md',
      drawer: 'bg-white text-stone-900 border-stone-200',
      activeItem: 'bg-rose-50 text-rose-700 font-bold',
      text: 'text-stone-800',
      heading: 'text-stone-950',
    },
    sepia: {
      bg: 'bg-[#f6ebd7]',
      card: 'bg-[#fbf2e3] text-[#362719] border-[#e7d7bd] shadow-md',
      header: 'bg-[#f6ebd7]/95 border-[#e7d7bd] text-[#362719] backdrop-blur-md',
      footer: 'bg-[#f6ebd7]/95 border-[#e7d7bd] text-[#4f3925] backdrop-blur-md',
      drawer: 'bg-[#fbf2e3] text-[#362719] border-[#e7d7bd]',
      activeItem: 'bg-[#ebd6b8] text-[#362719] font-bold',
      text: 'text-[#3d2d1e]',
      heading: 'text-[#2b1e13]',
    },
    night: {
      bg: 'bg-[#121214]',
      card: 'bg-[#1c1c20] text-stone-200 border-stone-800 shadow-xl',
      header: 'bg-[#121214]/90 border-stone-800 text-stone-200 backdrop-blur-md',
      footer: 'bg-[#121214]/90 border-stone-800 text-stone-400 backdrop-blur-md',
      drawer: 'bg-[#1c1c20] text-stone-200 border-stone-800',
      activeItem: 'bg-stone-800 text-rose-400 font-bold',
      text: 'text-stone-300',
      heading: 'text-white',
    },
  }[theme];

  const fontSizeClass = {
    sm: 'text-sm sm:text-base leading-relaxed sm:leading-loose',
    base: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    lg: 'text-lg sm:text-xl leading-relaxed sm:leading-loose',
    xl: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose',
  }[fontSize];

  const progressPercent = Math.round((currentPage / totalPages) * 100);

  return (
    <div className={`min-h-screen ${themeStyles.bg} transition-colors duration-300 flex flex-col`}>
      {/* Top Controls Bar */}
      <header
        className={`sticky top-0 z-40 border-b px-4 py-3 flex items-center justify-between transition-colors ${themeStyles.header}`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-500/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'ফিরে যান' : 'Back'}
            </span>
          </button>

          <div className="border-l border-stone-300/40 pl-3">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-md font-serif">
              {book.title}
            </h1>
            <p className="text-[10px] text-stone-500 truncate">
              {book.author}
            </p>
          </div>
        </div>

        {/* Top Right Reader Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Table of Contents Drawer Trigger */}
          <button
            type="button"
            onClick={() => setShowTocDrawer(!showTocDrawer)}
            className="p-2 rounded-lg text-xs hover:bg-stone-500/10 transition-colors flex items-center gap-1"
            title={language === 'bn' ? 'সূচিপত্র' : 'Table of Contents'}
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-semibold">
              {language === 'bn' ? 'সূচি' : 'Index'}
            </span>
          </button>

          {/* Mode Switch: Interactive vs PDF */}
          {book.pdf_url && (
            <div className="hidden sm:flex items-center bg-stone-500/10 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'interactive'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {language === 'bn' ? 'পেজ রিডার' : 'Page Reader'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'pdf'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {language === 'bn' ? 'অরিজিনাল PDF' : 'Original PDF'}
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <div className="flex items-center bg-stone-500/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setTheme('day')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                theme === 'day' ? 'bg-white shadow-xs text-amber-600' : 'text-stone-500'
              }`}
              title={language === 'bn' ? 'দিনের আলো (Day Mode)' : 'Day Mode'}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                theme === 'sepia' ? 'bg-[#f4e4c8] shadow-xs text-[#5c3e21]' : 'text-stone-500'
              }`}
              title={language === 'bn' ? 'সেপিয়া চোখের আরাম (Sepia Mode)' : 'Sepia Mode'}
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('night')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                theme === 'night' ? 'bg-stone-800 shadow-xs text-rose-400' : 'text-stone-500'
              }`}
              title={language === 'bn' ? 'নাইট মোড (Night Mode)' : 'Night Mode'}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center bg-stone-500/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => {
                if (fontSize === 'xl') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('base');
                else if (fontSize === 'base') setFontSize('sm');
              }}
              className="p-1.5 text-xs text-stone-600 hover:text-stone-950"
              title={language === 'bn' ? 'ফন্ট ছোট করুন' : 'Smaller Font'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold px-1 uppercase text-stone-500">
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => {
                if (fontSize === 'sm') setFontSize('base');
                else if (fontSize === 'base') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('xl');
              }}
              className="p-1.5 text-xs text-stone-600 hover:text-stone-950"
              title={language === 'bn' ? 'ফন্ট বড় করুন' : 'Larger Font'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-xs hover:bg-stone-500/10 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Reading Progress Line */}
      <div className="w-full bg-stone-200/40 h-1">
        <div
          className="bg-rose-600 h-1 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Table of Contents Drawer (Modal / Overlay) */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setShowTocDrawer(false)}
          />
          <div
            className={`relative z-10 w-full max-w-xs border-r shadow-2xl p-5 flex flex-col justify-between transition-transform duration-300 ${themeStyles.drawer}`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 mb-3">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm">
                    {language === 'bn' ? 'অধ্যায় সূচিপত্র' : 'Table of Contents'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTocDrawer(false)}
                  className="text-xs p-1 hover:bg-stone-500/10 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(p.page_number);
                      setShowTocDrawer(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentPage === p.page_number
                        ? themeStyles.activeItem
                        : 'hover:bg-stone-500/10'
                    }`}
                  >
                    <span className="truncate flex-1">
                      {p.chapter_title || (language === 'bn' ? `পৃষ্ঠা ${p.page_number}` : `Page ${p.page_number}`)}
                    </span>
                    <span className="text-[10px] opacity-70 ml-2">
                      #{p.page_number}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200/50 text-[11px] text-stone-500 text-center">
              {language === 'bn'
                ? `মোট ${totalPages} পৃষ্ঠা • ${progressPercent}% সম্পন্ন`
                : `Total ${totalPages} pages • ${progressPercent}% completed`}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col">
        {viewMode === 'pdf' && book.pdf_url ? (
          /* PDF Embed Viewer */
          <div className="w-full flex-1 min-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-300">
            <iframe
              src={book.pdf_url}
              title={book.title}
              className="w-full h-full min-h-[80vh]"
            />
          </div>
        ) : (
          /* Interactive Page-by-Page Realistic Book Page */
          <article
            className={`w-full flex-1 rounded-2xl border p-6 sm:p-12 md:p-16 flex flex-col justify-between transition-all duration-300 ${themeStyles.card}`}
          >
            {/* Page Header (Chapter Title & Book Title) */}
            <div className="border-b border-stone-200/50 pb-4 mb-6 flex items-center justify-between text-xs text-stone-400 font-sans tracking-wide">
              <span className="truncate max-w-[250px]">
                {book.title}
              </span>
              <span className="font-bold">
                {language === 'bn' ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </span>
            </div>

            {/* Page Content */}
            <div className="flex-1 space-y-6">
              {activePageData.chapter_title && (
                <h2
                  className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif leading-snug tracking-tight mb-6 pb-2 border-b-2 border-rose-600/30 ${themeStyles.heading}`}
                >
                  {activePageData.chapter_title}
                </h2>
              )}

              <div
                className={`font-serif tracking-normal text-justify ${fontSizeClass} ${themeStyles.text} space-y-5`}
              >
                {activePageData.content
                  .split(/\n\n+/)
                  .map((paragraph, idx) => (
                    <p key={idx} className="indent-6 sm:indent-8">
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            </div>

            {/* Page Footer Note */}
            <div className="border-t border-stone-200/50 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-400">
              <span>
                {language === 'bn' ? 'ফিউচার ই-বুক রিডার • আরামদায়ক পাঠ' : 'Future E-Book Reader • Distraction Free'}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-500">
                  {progressPercent}% {language === 'bn' ? 'পড়া হয়েছে' : 'Read'}
                </span>
              </div>
            </div>
          </article>
        )}
      </main>

      {/* Bottom Sticky Page Navigation Bar */}
      <footer
        className={`sticky bottom-0 z-30 border-t px-4 py-3 flex items-center justify-between transition-colors ${themeStyles.footer}`}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-stone-500/10 hover:bg-stone-500/20"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'পূর্ববর্তী পৃষ্ঠা' : 'Previous Page'}</span>
        </button>

        {/* Page Selector Pill */}
        <div className="flex items-center gap-2">
          <select
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(Number(e.target.value));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold bg-stone-500/10 border-0 rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.page_number} className="text-stone-900 bg-white">
                {language === 'bn' ? `পৃষ্ঠা ${p.page_number}` : `Page ${p.page_number}`}
              </option>
            ))}
          </select>
          <span className="text-xs text-stone-500 hidden sm:inline">
            / {totalPages}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
        >
          <span>{language === 'bn' ? 'পরবর্তী পৃষ্ঠা' : 'Next Page'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
