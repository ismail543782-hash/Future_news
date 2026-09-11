import React, { useState } from 'react';
import { Book, BookPage, Language } from '../../types/news';
import {
  Save,
  X,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Search,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  Download,
  Eye,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface BookEditorProps {
  book?: Book | null;
  language: Language;
  onSave: (book: Book) => void;
  onCancel: () => void;
}

const CATEGORY_PRESETS = [
  { key: 'career', bn: 'ক্যারিয়ার ও প্রযুক্তি', en: 'Career & Tech' },
  { key: 'lifestyle', bn: 'মোটিভেশন ও আত্মউন্নয়ন', en: 'Self-Development' },
  { key: 'history', bn: 'ইতিহাস ও মুক্তিযুদ্ধ', en: 'History & War' },
  { key: 'literature', bn: 'সাহিত্য ও গল্প', en: 'Literature & Fiction' },
  { key: 'islamic', bn: 'ইসলামিক ও ধর্মীয়', en: 'Islamic & Religion' },
  { key: 'general', bn: 'সাধারণ জ্ঞান ও বিজ্ঞান', en: 'General & Science' },
];

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e37b29?w=800&auto=format&fit=crop&q=80',
];

export const BookEditor: React.FC<BookEditorProps> = ({
  book,
  language,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pages' | 'seo'>('basic');

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [category, setCategory] = useState(book?.category || 'career');
  const [categoryBn, setCategoryBn] = useState(book?.category_bn || 'ক্যারিয়ার ও প্রযুক্তি');
  const [coverImage, setCoverImage] = useState(
    book?.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
  );
  const [description, setDescription] = useState(book?.description || '');
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url || '');
  const [allowDownload, setAllowDownload] = useState(book?.allow_download ?? true);
  const [readingTime, setReadingTime] = useState(book?.reading_time_minutes || 10);
  const [publishedYear, setPublishedYear] = useState(book?.published_year || '২০২৬');
  const [isPublished, setIsPublished] = useState(book?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(book?.is_featured ?? false);

  // Pages
  const [pages, setPages] = useState<BookPage[]>(
    book?.pages && book.pages.length > 0
      ? book.pages
      : [
          {
            id: `p-${Date.now()}-1`,
            page_number: 1,
            chapter_title: 'অধ্যায় ১: ভূমিকা ও সূচনা',
            content: 'এখানে আপনার বইয়ের প্রথম অধ্যায় বা সূচনার মূল লেখাটি লিখুন...',
          },
        ]
  );
  const [activeEditingPageIdx, setActiveEditingPageIdx] = useState(0);

  // SEO
  const [metaTitle, setMetaTitle] = useState(book?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(book?.meta_description || '');
  const [keywordsText, setKeywordsText] = useState(book?.keywords?.join(', ') || '');

  // Auto-generate slug from title
  const generateSlug = (rawTitle: string) => {
    return rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `book-${Date.now()}`;
  };

  const handleCategoryChange = (catKey: string) => {
    setCategory(catKey);
    const found = CATEGORY_PRESETS.find((c) => c.key === catKey);
    if (found) {
      setCategoryBn(found.bn);
    }
  };

  // Add new page
  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPg: BookPage = {
      id: `p-${Date.now()}-${nextNum}`,
      page_number: nextNum,
      chapter_title: `অধ্যায় ${nextNum}`,
      content: '',
    };
    setPages([...pages, newPg]);
    setActiveEditingPageIdx(pages.length);
  };

  // Remove page
  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) {
      alert(language === 'bn' ? 'বইয়ে কমপক্ষে একটি পৃষ্ঠা থাকতে হবে।' : 'At least one page is required.');
      return;
    }
    const updated = pages
      .filter((_, idx) => idx !== index)
      .map((p, idx) => ({ ...p, page_number: idx + 1 }));
    setPages(updated);
    setActiveEditingPageIdx(Math.max(0, index - 1));
  };

  // Update specific page content
  const handlePageChange = (field: 'chapter_title' | 'content', value: string) => {
    const updated = [...pages];
    if (updated[activeEditingPageIdx]) {
      updated[activeEditingPageIdx] = {
        ...updated[activeEditingPageIdx],
        [field]: value,
      };
      setPages(updated);
    }
  };

  // Auto-fill SEO metadata if empty
  const handleAutoGenerateSEO = () => {
    if (!title.trim()) {
      alert(language === 'bn' ? 'দয়া করে প্রথমে বইয়ের নাম লিখুন।' : 'Please enter book title first.');
      return;
    }
    setMetaTitle(`${title} - সম্পূর্ণ ই-বুক ও পিডিএফ`);
    setMetaDescription(
      description.slice(0, 155) ||
        `${title} বইটির সম্পূর্ণ অনলাইন সংস্করণ। অনলাইনে পেজ-বাই-পেজ বিনামূল্যে পড়ুন ও ডাউনলোড করুন।`
    );
    if (!keywordsText.trim()) {
      setKeywordsText(`${title}, বাংলা বই, ই-বুক, PDF ডাউনলোড, ${categoryBn}`);
    }
  };

  // Save Book Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(language === 'bn' ? 'বইয়ের নাম আবশ্যক।' : 'Book title is required.');
      return;
    }
    if (!author.trim()) {
      alert(language === 'bn' ? 'লেখকের নাম আবশ্যক।' : 'Author name is required.');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const slug = book?.slug || generateSlug(title);

    const savedBook: Book = {
      id: book?.id || `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      slug,
      category,
      category_bn: categoryBn,
      cover_image: coverImage.trim(),
      description: description.trim(),
      pdf_url: pdfUrl.trim() || undefined,
      allow_download: allowDownload,
      total_pages: pages.length,
      reading_time_minutes: Number(readingTime) || 10,
      published_year: publishedYear.trim() || '২০২৬',
      language: 'bn',
      is_published: isPublished,
      is_featured: isFeatured,
      views_count: book?.views_count || 0,
      created_at: book?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pages,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
    };

    onSave(savedBook);
  };

  const activePage = pages[activeEditingPageIdx] || pages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {book
                  ? language === 'bn'
                    ? 'বই সম্পাদনা করুন'
                    : 'Edit Book'
                  : language === 'bn'
                  ? 'নতুন বই প্রকাশ করুন (PDF ও পেজ রিডার)'
                  : 'Publish New Book'}
              </h2>
              <p className="text-xs text-stone-400">
                {language === 'bn'
                  ? 'প্রচ্ছদ, পিডিএফ, অধ্যায় ও সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)'
                  : 'Cover, PDF link, page content, and SEO metadata'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'bn' ? '১. মৌলিক তথ্য ও কভার' : '1. Basic Info & Cover'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'pages'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {language === 'bn'
                ? `২. পেজ ও কনটেন্ট (${pages.length} পৃষ্ঠা)`
                : `2. Pages & Content (${pages.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'seo'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'bn' ? '৩. এসইও ও গুগল সার্চ' : '3. SEO & Google Snippet'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO & COVER */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের নাম / শিরোনাম *' : 'Book Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: স্মার্ট ক্যারিয়ার গাইড ২০২৬' : 'e.g. Smart Career Guide 2026'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'লেখক বা প্রকাশকের নাম *' : 'Author or Publisher *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ড. আহমেদ জামান' : 'e.g. John Doe'}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের বিভাগ (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.bn} ({cat.en})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cover Image URL & Preview */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>{language === 'bn' ? 'বইয়ের প্রচ্ছদ ছবি (Cover Image URL)' : 'Cover Image URL'}</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {language === 'bn' ? 'সরাসরি ছবির লিংক দিন' : 'Direct image link'}
                    </span>
                  </label>

                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-36 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-xs">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      />

                      <div className="space-y-1">
                        <span className="text-[11px] text-stone-500 font-semibold block">
                          {language === 'bn' ? 'রেডিমেড প্রচ্ছদ নির্বাচন করুন:' : 'Quick cover presets:'}
                        </span>
                        <div className="flex gap-2">
                          {SAMPLE_COVERS.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Preset ${i}`}
                              onClick={() => setCoverImage(url)}
                              className={`w-10 h-14 object-cover rounded cursor-pointer border-2 transition-all ${
                                coverImage === url ? 'border-rose-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Document URL */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      {language === 'bn'
                        ? 'অরিজিনাল PDF ফাইলের লিংক (ঐচ্ছিক)'
                        : 'Original PDF Document URL (Optional)'}
                    </span>
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/books/my-book.pdf অথবা Google Drive লিংক"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400">
                    {language === 'bn'
                      ? 'পিডিএফ লিংক দিলে পাঠকরা অনলাইনে সরাসরি পিডিএফ দেখতে ও ডাউনলোড করতে পারবেন।'
                      : 'Allows users to embed and download the raw PDF.'}
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'বইয়ের সংক্ষিপ্ত বিবরণ ও ভূমিকা *' : 'Book Description & Synopsis *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'বইটিতে কী কী বিষয় রয়েছে এবং পাঠকরা কেন পড়বে তার সংক্ষিপ্ত বিবরণ...'
                        : 'Write a compelling book overview...'
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Additional Metadata */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'প্রকাশনার সাল' : 'Published Year'}
                  </label>
                  <input
                    type="text"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    placeholder="২০২৬"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'পড়ার আনুমানিক সময় (মিনিট)' : 'Estimated Reading Time (min)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Toggles */}
                <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-stone-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                    />
                    <span>{language === 'bn' ? 'সরাসরি ওয়েবসাইটে প্রকাশ করুন (Live)' : 'Publish to Website'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                    />
                    <span>{language === 'bn' ? 'বিশেষ নির্বাচিত বই (Featured)' : 'Feature on Top'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                    />
                    <span>{language === 'bn' ? 'পাঠকদের ফ্রি ডাউনলোড অনুমোদন করুন' : 'Allow Free Download'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAGE-BY-PAGE CONTENT EDITOR */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold">
                    {language === 'bn'
                      ? 'ইন্টারেক্টিভ পেজ-বাই-পেজ কনটেন্ট সুবিধা'
                      : 'Interactive Page-by-Page Content'}
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    {language === 'bn'
                      ? 'এখানে অধ্যায়ভিত্তিক প্রতিটি পৃষ্ঠার লেখা আলাদাভাবে লিখুন বা পেস্ট করুন। পাঠকরা আসল বইয়ের মতো পৃষ্ঠা উল্টিয়ে আরাম করে পড়তে পারবেন।'
                      : 'Add individual pages and chapters. Readers will turn pages naturally in the digital reader.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Pages Sidebar (4 cols) */}
                <div className="md:col-span-4 bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? `পৃষ্ঠাসমূহ (${pages.length})` : `Pages (${pages.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'পৃষ্ঠা যোগ' : 'Add Page'}</span>
                    </button>
                  </div>

                  <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                    {pages.map((pg, idx) => (
                      <div
                        key={pg.id}
                        onClick={() => setActiveEditingPageIdx(idx)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          activeEditingPageIdx === idx
                            ? 'bg-white text-rose-700 font-bold border border-rose-200 shadow-xs'
                            : 'text-stone-700 hover:bg-stone-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-stone-200/80 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {pg.page_number}
                          </span>
                          <span className="truncate">
                            {pg.chapter_title || `পৃষ্ঠা ${pg.page_number}`}
                          </span>
                        </div>

                        {pages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePage(idx);
                            }}
                            className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="পৃষ্ঠা মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page Content Editor Canvas (8 cols) */}
                <div className="md:col-span-8 bg-white rounded-xl border border-stone-200 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
                        {activePage.page_number}
                      </span>
                      <span>
                        {language === 'bn'
                          ? `পৃষ্ঠা ${activePage.page_number} এর তথ্য ও কনটেন্ট`
                          : `Editing Page ${activePage.page_number}`}
                      </span>
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {activePage.content.length} {language === 'bn' ? 'অক্ষর' : 'chars'}
                    </span>
                  </div>

                  {/* Chapter Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600">
                      {language === 'bn' ? 'অধ্যায়ের নাম বা অনুচ্ছেদ শিরোনাম' : 'Chapter / Section Title'}
                    </label>
                    <input
                      type="text"
                      value={activePage.chapter_title || ''}
                      onChange={(e) => handlePageChange('chapter_title', e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: অধ্যায় ১: নতুন শুরু' : 'e.g. Chapter 1: The Beginning'}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  {/* Page Text Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-600 flex items-center justify-between">
                      <span>{language === 'bn' ? 'পৃষ্ঠার মূল বক্তব্য / গল্প / পাঠ্য *' : 'Page Text Content *'}</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {language === 'bn' ? 'প্যারাগ্রাফ তৈরি করতে এন্টার দিন' : 'Press Enter for paragraphs'}
                      </span>
                    </label>
                    <textarea
                      rows={10}
                      value={activePage.content}
                      onChange={(e) => handlePageChange('content', e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'এখানে এই পৃষ্ঠার সম্পূর্ণ লেখাটি লিখুন বা পেস্ট করুন...'
                          : 'Write or paste the page text here...'
                      }
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm text-stone-900 font-serif leading-relaxed focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO & GOOGLE SEARCH SNIPPET */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'স্মার্ট এসইও অপটিমাইজেশন (SEO)' : 'Smart SEO Optimization'}</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {language === 'bn'
                      ? 'বইটির মেটাডাটা গুগল সার্চ রেজাল্টে শীর্ষ স্থানে আসার জন্য অপটিমাইজ করুন।'
                      : 'Optimize metadata to rank high on Google and social shares.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoGenerateSEO}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  {language === 'bn' ? 'অটো-জেনারেট এসইও' : 'Auto Generate SEO'}
                </button>
              </div>

              {/* Google Search Live Card Preview */}
              <div className="bg-white rounded-xl border border-stone-300 p-4 sm:p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'গুগল সার্চ প্রিভিউ (Google Search Preview)' : 'Google Search Snippet Preview'}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <span className="text-emerald-700 font-medium">https://futurenews.bd/book/{book?.slug || generateSlug(title)}</span>
                  </div>
                  <h3 className="text-blue-700 hover:underline text-base sm:text-lg font-medium cursor-pointer leading-snug">
                    {metaTitle || `${title || 'বইয়ের শিরোনাম'} - ফিউচার নিউজ ই-বুক`}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                    {metaDescription ||
                      description ||
                      'অনলাইনে সম্পূর্ণ বইটি পেজ-বাই-পেজ পড়ুন অথবা ডাউনলোড করুন।'}
                  </p>
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? 'এসইও মেটা টাইটেল (Meta Title)' : 'SEO Meta Title'}
                    </label>
                    <span className="text-[10px] text-stone-400">{metaTitle.length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="স্মার্ট ক্যারিয়ার ও ফ্রিল্যান্সিং গাইড ২০২৬ - সম্পূর্ণ ই-বুক"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? 'এসইও মেটা বিবরণ (Meta Description)' : 'SEO Meta Description'}
                    </label>
                    <span className="text-[10px] text-stone-400">{metaDescription.length}/160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="বইটি সম্পর্কে ১৫০ অক্ষরের ভেতর আকর্ষণীয় বিবরণ লিখুন..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {language === 'bn' ? 'ফোকাস কিওয়ার্ড ও ট্যাগ (কমা দিয়ে লিখুন)' : 'Focus Keywords & Tags (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="বাংলা বই, ফ্রিল্যান্সিং, ই-বুক, ক্যারিয়ার, PDF"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'bn' ? 'বই সংরক্ষণ ও প্রকাশ করুন' : 'Save & Publish Book'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
