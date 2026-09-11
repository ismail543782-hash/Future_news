import React, { useState, useMemo } from 'react';
import { Book, Language } from '../types/news';
import {
  BookOpen,
  Search,
  Download,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  Eye,
  Share2,
  Bookmark,
} from 'lucide-react';
import { AdBanner } from './AdBanner';

interface BookHubProps {
  books: Book[];
  language: Language;
  onSelectBook: (slug: string) => void;
  onOpenReader?: (slug: string) => void;
  onOpenAdminUpload?: () => void;
  onBackToNews?: () => void;
  isAdmin?: boolean;
}

export const BookHub: React.FC<BookHubProps> = ({
  books,
  language,
  onSelectBook,
  onOpenReader,
  onOpenAdminUpload,
  onBackToNews,
  isAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'pages'>('latest');

  // Categories list
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    map.set('all', language === 'bn' ? 'সব বই' : 'All Books');
    books.forEach((b) => {
      if (b.category && b.category_bn) {
        map.set(b.category, language === 'bn' ? b.category_bn : b.category);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [books, language]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => b.is_published)
      .filter((b) => {
        if (selectedCategory !== 'all' && b.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchDesc = b.description.toLowerCase().includes(q);
          const matchTags = b.keywords?.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchAuthor || matchDesc || matchTags;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.views_count || 0) - (a.views_count || 0);
        if (sortBy === 'pages') return (b.total_pages || 0) - (a.total_pages || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [books, selectedCategory, searchQuery, sortBy]);

  const featuredBooks = useMemo(() => {
    return books.filter((b) => b.is_published && b.is_featured);
  }, [books]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 text-white p-6 sm:p-10 shadow-lg border border-stone-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold tracking-wide uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ফিউচার ই-বুক ও ডিজিটাল লাইব্রেরি' : 'Digital Book & E-Library'}</span>
            </div>

            {onBackToNews && (
              <button
                type="button"
                onClick={onBackToNews}
                className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/15 transition-all"
              >
                <span>{language === 'bn' ? '← মূল সংবাদে ফিরে যান' : '← Back to News'}</span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif leading-tight">
            {language === 'bn'
              ? 'বই পড়ার আনন্দ এখন ডিজিটাল পাতায় — ক্লান্তিহীন ও মার্জিত'
              : 'Immersive Reading Experience • Page-by-Page Digital Books'}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            {language === 'bn'
              ? 'সাহিত্য, ইতিহাস, ক্যারিয়ার, মুক্তিযুদ্ধ ও আত্মউন্নয়নের সমৃদ্ধ বইসমূহ বিনামূল্যে অনলাইনে পেজ-বাই-পেজ পড়ুন অথবা সুবিধাজনক PDF ডাউনলোড করুন। কোনো বিরক্তিকর বিজ্ঞাপন ছাড়া নির্মল পড়ার অভিজ্ঞতা।'
              : 'Read verified literature, career roadmaps, history, and motivational books online with true page-turning comfort or download clean PDFs.'}
          </p>

          {/* Quick Stats & Action */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>
                {language === 'bn' ? `${books.length} টি প্রকাশিত বই` : `${books.length} Published Books`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? '১০০% ফ্রি অনলাইন রিডার' : '100% Free Online Reader'}</span>
            </div>
            {isAdmin && onOpenAdminUpload && (
              <button
                type="button"
                onClick={onOpenAdminUpload}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? '+ নতুন বই প্রকাশ করুন' : '+ Publish New Book'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Featured Book Showcase (If any) */}
      {featuredBooks.length > 0 && (
        <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{language === 'bn' ? 'বিশেষ নির্বাচিত বই (Featured)' : 'Featured Selections'}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBooks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl p-4 sm:p-5 border border-amber-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
              >
                {/* Book Cover */}
                <div
                  onClick={() => onSelectBook(b.slug)}
                  className="w-full sm:w-32 h-44 shrink-0 overflow-hidden rounded-lg shadow-md border border-stone-200 relative group cursor-pointer"
                >
                  <img
                    src={b.cover_image}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                    {b.total_pages} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                      {b.category_bn}
                    </span>
                    <h3
                      onClick={() => onSelectBook(b.slug)}
                      className="text-base sm:text-lg font-bold text-stone-900 hover:text-rose-600 cursor-pointer transition-colors leading-snug line-clamp-2"
                    >
                      {b.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 font-medium">
                      {language === 'bn' ? 'লেখক:' : 'Author:'} <span className="text-stone-800">{b.author}</span>
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => onOpenReader(b.slug)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অনলাইনে পড়ুন' : 'Read Book'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectBook(b.slug)}
                      className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                      title={language === 'bn' ? 'বইয়ের বিবরণ ও সূচিপত্র' : 'Book details'}
                    >
                      {language === 'bn' ? 'বিবরণ' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'বইয়ের নাম, লেখক বা বিষয় লিখে খুঁজুন...'
                  : 'Search by book title, author, or topics...'
              }
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
              {language === 'bn' ? 'বাছাই:' : 'Sort:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="latest">{language === 'bn' ? 'সর্বশেষ প্রকাশিত' : 'Latest Added'}</option>
              <option value="popular">{language === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Popular'}</option>
              <option value="pages">{language === 'bn' ? 'পৃষ্ঠা সংখ্যা অনুসারে' : 'By Page Count'}</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 pt-3">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === c.key
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Books Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
              <span>{language === 'bn' ? 'সকল বইসমূহ' : 'Available Books'}</span>
              <span className="text-xs font-bold text-stone-500 px-2 py-0.5 bg-stone-100 rounded-full">
                {filteredBooks.length}
              </span>
            </h2>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-base text-stone-800">
                {language === 'bn' ? 'কোনো বই পাওয়া যায়নি' : 'No books found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো বই পাওয়া যায়নি। অন্য কোনো নাম দিয়ে চেষ্টা করুন।'
                  : 'Try adjusting your search terms or select another category.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-800"
                >
                  {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Top Cover Visual */}
                  <div
                    onClick={() => onSelectBook(book.slug)}
                    className="relative h-56 bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                      {book.category_bn}
                    </span>

                    {/* Page count pill */}
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-stone-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                      <FileText className="w-3 h-3 text-rose-400" />
                      <span>{book.total_pages} {language === 'bn' ? 'পৃষ্ঠা' : 'Pages'}</span>
                    </span>

                    {book.reading_time_minutes && (
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] text-stone-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-medium">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>~{book.reading_time_minutes} {language === 'bn' ? 'মিনিট' : 'min'}</span>
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3
                        onClick={() => onSelectBook(book.slug)}
                        className="font-bold text-base text-stone-900 group-hover:text-rose-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                      >
                        {book.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1">
                        {language === 'bn' ? 'লেখক:' : 'By'}{' '}
                        <span className="font-semibold text-stone-800">{book.author}</span>
                      </p>
                      <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenReader(book.slug)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'পড়ুন' : 'Read Now'}</span>
                      </button>

                      {book.pdf_url && (
                        <a
                          href={book.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs transition-colors"
                          title={language === 'bn' ? 'PDF ডাউনলোড' : 'Download PDF'}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectBook(book.slug)}
                        className="px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {language === 'bn' ? 'বিস্তারিত' : 'Info'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Column (4 cols) - Beside the books, neat and non-intrusive */}
        <div className="lg:col-span-4 space-y-6">
          {/* Adsterra 300x250 Banner in Sidebar */}
          <div className="space-y-1">
            <AdBanner slot="sidebar" />
          </div>

          {/* Reading Benefits / Info Card */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-100 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>{language === 'bn' ? 'আমাদের রিডার বৈশিষ্ট্য' : 'Reader Features'}</span>
            </div>

            <ul className="text-xs text-rose-950 space-y-2.5 leading-relaxed font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'আসল বইয়ের মতো এক পেজের পর এক পেজ পড়ার স্বাচ্ছন্দ্য।'
                    : 'Authentic page-by-page turning experience.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'চোখের সুরক্ষায় ডে, সেপিয়া এবং নাইট মোড সাপোর্ট।'
                    : 'Comfortable Day, Sepia and Night dark modes.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'সর্বশেষ পঠিত পৃষ্ঠা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।'
                    : 'Auto-save your last read page anytime.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn'
                    ? 'ফন্ট ছোট বা বড় করার পূর্ণ নিয়ন্ত্রণ (A- / A+)।'
                    : 'Adjustable reading typography sizes.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Admin Publish Prompt */}
          {isAdmin && onOpenAdminUpload && (
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>{language === 'bn' ? 'লেখক ও প্রকাশক কর্নার' : 'Publisher Corner'}</span>
              </div>
              <h4 className="font-bold text-sm text-white">
                {language === 'bn' ? 'আপনার নিজস্ব বই বা ই-বুক প্রকাশ করুন' : 'Publish New Digital Book'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'এডমিন প্যানেল থেকে যেকোনো বইয়ের প্রচ্ছদ, অধ্যায় ও সম্পূর্ণ এসইও অপটিমাইজেশন করে প্রকাশ করুন।'
                  : 'Easily upload covers, page content, and SEO metadata from admin dashboard.'}
              </p>
              <button
                type="button"
                onClick={onOpenAdminUpload}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {language === 'bn' ? 'বই প্রকাশ ড্যাশবোর্ডে যান' : 'Go to Book Manager'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Monetization Widget (Outside reading area, non-intrusive) */}
      <div className="pt-4">
        <AdBanner slot="bottom_banner" />
      </div>
    </div>
  );
};
