import React, { useEffect, useState } from 'react';
import { Book, Language } from '../types/news';
import {
  BookOpen,
  ArrowLeft,
  Share2,
  Download,
  Clock,
  FileText,
  Calendar,
  User,
  Sparkles,
  ChevronRight,
  Check,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { AdBanner } from './AdBanner';
import { getBookProgress, incrementBookViews } from '../utils/storage';
import { downloadBookPdf } from '../utils/fileStorage';

interface BookDetailProps {
  book: Book;
  allBooks: Book[];
  language: Language;
  onBack: () => void;
  onOpenReader: (slug: string, pageNumber?: number) => void;
  onSelectOtherBook: (slug: string) => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({
  book,
  allBooks,
  language,
  onBack,
  onOpenReader,
  onSelectOtherBook,
}) => {
  const [copied, setCopied] = useState(false);
  const [lastReadPage, setLastReadPage] = useState<number>(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    incrementBookViews(book.id);
    const saved = getBookProgress(book.id);
    if (saved && saved > 1) {
      setLastReadPage(saved);
    }
  }, [book.id]);

  // Handle share
  const handleShare = (platform: 'fb' | 'wa' | 'tw' | 'copy') => {
    const url = window.location.href;
    const text = `${book.title} - ${book.author} | ফিউচার নিউজ ই-লাইব্রেরি`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }

    let shareUrl = '';
    if (platform === 'fb') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'wa') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
    } else if (platform === 'tw') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
    }
  };

  const relatedBooks = allBooks
    .filter((b) => b.id !== book.id && (b.category === book.category || b.is_featured))
    .slice(0, 3);

  // SEO Schema.org JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    description: book.description,
    image: book.cover_image,
    numberOfPages: book.total_pages,
    inLanguage: book.language === 'bn' ? 'bn-BD' : 'en',
    datePublished: book.created_at,
    keywords: book.keywords?.join(', '),
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Dynamic SEO JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Top Breadcrumbs & Back Button */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'ই-লাইব্রেরিতে ফিরে যান' : 'Back to E-Library'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-100">
            {book.category_bn}
          </span>
        </div>
      </div>

      {/* Main Book Card & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Book Presentation & Reader Actions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Book Header Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* 3D Realistic Cover Shadow */}
            <div className="w-full sm:w-56 shrink-0 flex flex-col items-center">
              <div className="w-48 sm:w-56 h-72 rounded-xl overflow-hidden shadow-2xl border border-stone-200 relative group bg-stone-100">
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
              </div>

              {/* Cover badge */}
              <span className="mt-3 text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'bn' ? 'অরিজিনাল ডিজিটাল সংস্করণ' : 'Verified Edition'}</span>
              </span>
            </div>

            {/* Book Metadata & Reading Actions */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif leading-tight">
                  {book.title}
                </h1>

                <div className="flex items-center gap-2 text-stone-700 font-medium text-sm">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>
                    {language === 'bn' ? 'লেখক:' : 'Author:'}{' '}
                    <strong className="text-stone-950 font-semibold">{book.author}</strong>
                  </span>
                </div>

                {/* Badges Bar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5 text-rose-500" />
                    <span>{book.total_pages} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'}</span>
                  </div>

                  {book.reading_time_minutes && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>~{book.reading_time_minutes} {language === 'bn' ? 'মিনিট' : 'min'}</span>
                    </div>
                  )}

                  {book.published_year && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      <span>{book.published_year}</span>
                    </div>
                  )}
                </div>

                {/* Synopsis / Description */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    {language === 'bn' ? 'বই সংক্ষেপ' : 'Synopsis'}
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed font-sans">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenReader(book.slug, lastReadPage)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {lastReadPage > 1
                        ? language === 'bn'
                          ? `পড়া চালিয়ে যান (পৃষ্ঠা ${lastReadPage})`
                          : `Resume Reading (Page ${lastReadPage})`
                        : language === 'bn'
                        ? 'বইটি অনলাইনে পড়ুন (ইন্টারেক্টিভ রিডার)'
                        : 'Read Online (Page-by-Page)'}
                    </span>
                  </button>

                  {(book.has_uploaded_pdf || book.pdf_url) && (
                    <button
                      type="button"
                      onClick={() => downloadBookPdf(book.id, book.title, book.pdf_url, book.pdf_filename)}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-sm transition-colors"
                      title={language === 'bn' ? 'PDF ফাইল সংরক্ষণ বা ডাউনলোড করুন' : 'Download PDF File'}
                    >
                      <Download className="w-4 h-4 text-stone-600" />
                      <span className="hidden sm:inline">{language === 'bn' ? 'PDF কপি' : 'PDF Copy'}</span>
                      {book.pdf_filesize && (
                        <span className="text-[11px] text-stone-500 font-normal">({book.pdf_filesize})</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Social Share Bar */}
                <div className="flex items-center gap-2 pt-2 text-xs text-stone-500">
                  <span className="font-semibold">{language === 'bn' ? 'শেয়ার করুন:' : 'Share:'}</span>
                  <button
                    type="button"
                    onClick={() => handleShare('fb')}
                    className="px-2.5 py-1 rounded bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-semibold transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('wa')}
                    className="px-2.5 py-1 rounded bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('tw')}
                    className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors"
                  >
                    Twitter (X)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('copy')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors ml-auto"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : language === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Contents / Chapters Preview */}
          {book.pages && book.pages.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>{language === 'bn' ? 'সূচিপত্র ও অধ্যায়সমূহ' : 'Table of Contents'}</span>
                </h3>
                <span className="text-xs font-semibold text-stone-500">
                  {book.pages.length} {language === 'bn' ? 'টি পরিচ্ছেদ' : 'Chapters/Pages'}
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {book.pages.map((pg) => (
                  <div
                    key={pg.id}
                    onClick={() => onOpenReader(book.slug, pg.page_number)}
                    className="py-3 px-2 rounded-lg hover:bg-stone-50 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-rose-100 group-hover:text-rose-700 text-stone-600 text-xs font-bold flex items-center justify-center transition-colors">
                        {pg.page_number}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-800 group-hover:text-rose-600 transition-colors">
                          {pg.chapter_title || (language === 'bn' ? `পৃষ্ঠা ${pg.page_number}` : `Page ${pg.page_number}`)}
                        </h4>
                        <p className="text-xs text-stone-400 line-clamp-1">
                          {pg.content.substring(0, 80)}...
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Focus Keywords Tag Clouds */}
          {book.keywords && book.keywords.length > 0 && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                {language === 'bn' ? 'সম্পর্কিত বিষয় ও কিওয়ার্ড:' : 'Keywords & Topics:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {book.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white border border-stone-200 rounded-md text-xs text-stone-700 font-medium shadow-2xs"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (4 cols): Adsterra Beside Book Details & Related Books */}
        <div className="lg:col-span-4 space-y-6">
          {/* Adsterra 300x250 Banner - Positioned right beside the book description */}
          <div className="space-y-1">
            <AdBanner slot="sidebar" />
          </div>

          {/* Related Recommended Books */}
          {relatedBooks.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'আরও পছন্দের বই' : 'Recommended Reads'}</span>
              </h3>

              <div className="space-y-3">
                {relatedBooks.map((rb) => (
                  <div
                    key={rb.id}
                    onClick={() => onSelectOtherBook(rb.slug)}
                    className="flex gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors group"
                  >
                    <img
                      src={rb.cover_image}
                      alt={rb.title}
                      className="w-14 h-20 rounded object-cover shadow-xs border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">
                        {rb.category_bn}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 line-clamp-2 leading-snug">
                        {rb.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1">
                        {rb.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
