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
  ExternalLink,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { saveBookProgress, getBookProgress } from '../utils/storage';
import { getPdfObjectUrl, downloadBookPdf, normalizePdfViewerUrl } from '../utils/fileStorage';

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
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>(
    book.has_uploaded_pdf || (book.pdf_url && (!book.pages || book.pages.length <= 1))
      ? 'pdf'
      : 'interactive'
  );
  const [copied, setCopied] = useState(false);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>('');
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Load PDF Blob from IndexedDB or external URL
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    const loadPdf = async () => {
      setIsPdfLoading(true);
      try {
        if (book.has_uploaded_pdf) {
          const objUrl = await getPdfObjectUrl(book.id);
          if (active && objUrl) {
            createdUrl = objUrl;
            setResolvedPdfUrl(objUrl);
            setIsPdfLoading(false);
            return;
          }
        }

        if (book.pdf_url) {
          const norm = normalizePdfViewerUrl(book.pdf_url);
          if (active) {
            setResolvedPdfUrl(norm.embedUrl);
            setIsPdfLoading(false);
          }
        } else {
          if (active) setIsPdfLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF source in reader:', err);
        if (active) {
          if (book.pdf_url) setResolvedPdfUrl(book.pdf_url);
          setIsPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [book.id, book.has_uploaded_pdf, book.pdf_url]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadBookPdf(book.id, book.title, resolvedPdfUrl || book.pdf_url, book.pdf_filename);
    } finally {
      setIsDownloading(false);
    }
  };

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
          {(resolvedPdfUrl || book.pdf_url || book.has_uploaded_pdf) && (
            <div className="flex items-center bg-stone-500/10 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'interactive'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'পেজ রিডার' : 'Page Reader'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'pdf'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বিল্ট-ইন PDF' : 'PDF Viewer'}</span>
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
      <main
        className={`flex-1 w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 flex flex-col ${
          viewMode === 'pdf' ? 'max-w-6xl' : 'max-w-4xl'
        }`}
      >
        {viewMode === 'pdf' ? (
          /* Built-in PDF Reader */
          <div className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-300">
            {/* Dedicated PDF Viewer Toolbar */}
            <div className="px-4 py-2.5 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold truncate text-stone-100 max-w-[200px] sm:max-w-md">
                  {book.pdf_filename || book.title}
                </span>
                {book.pdf_filesize && (
                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full hidden sm:inline">
                    {book.pdf_filesize}
                  </span>
                )}
                {book.has_uploaded_pdf && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold hidden md:inline">
                    {language === 'bn' ? '✓ লোকাল স্টোরেজ' : '✓ Internal Storage'}
                  </span>
                )}
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center bg-stone-800 rounded-lg p-0.5 text-xs text-stone-300">
                  <button
                    type="button"
                    onClick={() => setPdfZoom((prev) => Math.max(50, prev - 15))}
                    className="p-1.5 hover:bg-stone-700 rounded transition-colors"
                    title={language === 'bn' ? 'জুম আউট' : 'Zoom Out'}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono min-w-[45px] text-center font-bold">
                    {pdfZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((prev) => Math.min(200, prev + 15))}
                    className="p-1.5 hover:bg-stone-700 rounded transition-colors"
                    title={language === 'bn' ? 'জুম ইন' : 'Zoom In'}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  {pdfZoom !== 100 && (
                    <button
                      type="button"
                      onClick={() => setPdfZoom(100)}
                      className="p-1.5 hover:bg-stone-700 rounded text-rose-400 transition-colors"
                      title={language === 'bn' ? 'রিসেট (১০০%)' : 'Reset Zoom'}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-xs text-stone-200 transition-colors hidden sm:inline-flex"
                  title={language === 'bn' ? 'ফুলস্ক্রিন ভিউ' : 'Toggle Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                </button>

                {/* Open in New Tab */}
                {resolvedPdfUrl && (
                  <a
                    href={resolvedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    title={language === 'bn' ? 'ব্রাউজারের মূল ভিউয়ারে খুলুন' : 'Open in New Tab'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{language === 'bn' ? 'নতুন ট্যাব' : 'New Tab'}</span>
                  </a>
                )}

                {/* Download PDF */}
                {book.allow_download && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Embedded PDF Content */}
            <div className="w-full flex-1 min-h-[75vh] md:min-h-[85vh] bg-stone-100 relative overflow-auto">
              {isPdfLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 gap-3 text-stone-500">
                  <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
                  <p className="text-xs font-semibold">
                    {language === 'bn' ? 'পিডিএফ রিডার লোড হচ্ছে...' : 'Loading PDF document...'}
                  </p>
                </div>
              ) : resolvedPdfUrl ? (
                <div
                  className="w-full h-full min-h-[75vh] md:min-h-[85vh] transition-transform origin-top flex items-center justify-center"
                  style={{
                    transform: pdfZoom !== 100 ? `scale(${pdfZoom / 100})` : undefined,
                    transformOrigin: 'top center',
                  }}
                >
                  <iframe
                    src={`${resolvedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    title={book.title}
                    className="w-full h-full min-h-[75vh] md:min-h-[85vh] border-0"
                  />
                </div>
              ) : (
                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-stone-500 gap-3">
                  <FileText className="w-12 h-12 text-stone-300" />
                  <p className="text-sm font-bold text-stone-700">
                    {language === 'bn' ? 'পিডিএফ ফাইলটি পাওয়া যায়নি।' : 'PDF document not found.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('interactive')}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    {language === 'bn' ? 'পেজ রিডারে পড়ুন' : 'Read in Page Reader'}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom PDF Reader Helper Strip */}
            <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>
                  {language === 'bn'
                    ? 'ওয়েবসাইটের ভেতরে সরাসরি পেজ বাই পেজ পাঠ • মাউস হুইল বা টাচ দিয়ে স্ক্রল করুন'
                    : 'Native in-site page-by-page reader • Scroll via mouse wheel or swipe'}
                </span>
              </span>

              <div className="flex items-center gap-3">
                {book.pages && book.pages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('interactive')}
                    className="text-rose-600 hover:underline font-bold"
                  >
                    {language === 'bn' ? 'স্টোরি পেজ রিডারে যেতে চান?' : 'Switch to Story Page Reader'}
                  </button>
                )}
              </div>
            </div>
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
      {viewMode === 'interactive' ? (
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
      ) : (
        <footer
          className={`sticky bottom-0 z-30 border-t px-4 py-2.5 flex items-center justify-between transition-colors ${themeStyles.footer}`}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-500/10 hover:bg-stone-500/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'লাইব্রেরিতে ফিরে যান' : 'Back to Library'}</span>
          </button>

          <div className="flex items-center gap-2">
            {resolvedPdfUrl && (
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-500/10 hover:bg-stone-500/20 transition-colors inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'ব্রাউজার ভিউয়ার' : 'Browser Viewer'}</span>
              </a>
            )}

            {book.allow_download && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{language === 'bn' ? 'ডাউনলোড' : 'Download PDF'}</span>
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
