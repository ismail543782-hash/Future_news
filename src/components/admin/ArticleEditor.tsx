import React, { useState } from 'react';
import { Article, Category, Author } from '../../types/news';
import { generateSlug, autoGenerateSeoFromTitle } from '../../utils/seo';
import {
  Sparkles,
  Save,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowLeft,
  Flame,
  TrendingUp,
  Star,
  DollarSign,
} from 'lucide-react';

interface ArticleEditorProps {
  initialArticle?: Article;
  categories: Category[];
  authors: Author[];
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  categories,
  authors,
  onSave,
  onCancel,
}) => {
  const isEditing = !!initialArticle;

  // Form states
  const [titleBn, setTitleBn] = useState(initialArticle?.title_bn || '');
  const [titleEn, setTitleEn] = useState(initialArticle?.title_en || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [categoryId, setCategoryId] = useState(initialArticle?.category_id || categories[0]?.id || '');
  const [authorId, setAuthorId] = useState(initialArticle?.author_id || authors[0]?.id || '');
  const [featuredImage, setFeaturedImage] = useState(
    initialArticle?.featured_image ||
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80'
  );
  const [imageCaptionBn, setImageCaptionBn] = useState(initialArticle?.image_caption_bn || '');
  const [imageCredit, setImageCredit] = useState(initialArticle?.image_credit || 'Future News Editorial');
  const [summaryBn, setSummaryBn] = useState(initialArticle?.summary_bn || '');
  const [summaryEn, setSummaryEn] = useState(initialArticle?.summary_en || '');
  const [contentBn, setContentBn] = useState(initialArticle?.content_bn || '');
  const [contentEn, setContentEn] = useState(initialArticle?.content_en || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>(
    initialArticle?.status || 'published'
  );

  // Flags
  const [isFeatured, setIsFeatured] = useState(initialArticle?.is_featured || false);
  const [isBreaking, setIsBreaking] = useState(initialArticle?.is_breaking || false);
  const [isTrending, setIsTrending] = useState(initialArticle?.is_trending || false);
  const [isSponsored, setIsSponsored] = useState(initialArticle?.is_sponsored || false);
  const [sponsorName, setSponsorName] = useState(initialArticle?.sponsor_name || '');

  // SEO states
  const [seoTitleBn, setSeoTitleBn] = useState(initialArticle?.seo_title_bn || '');
  const [seoTitleEn, setSeoTitleEn] = useState(initialArticle?.seo_title_en || '');
  const [seoDescBn, setSeoDescBn] = useState(initialArticle?.seo_description_bn || '');
  const [seoDescEn, setSeoDescEn] = useState(initialArticle?.seo_description_en || '');
  const [focusKeyphraseBn, setFocusKeyphraseBn] = useState(initialArticle?.focus_keyphrase_bn || '');
  const [focusKeyphraseEn, setFocusKeyphraseEn] = useState(initialArticle?.focus_keyphrase_en || '');

  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');
  const [notification, setNotification] = useState('');

  // 1-Click Auto SEO Generator
  const handleAutoGenerateSeo = () => {
    if (!titleBn && !titleEn) {
      alert('দয়া করে প্রথমে খবরের শিরোনাম লিখুন!');
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const catNameBn = currentCat?.name_bn || 'খবর';
    const catNameEn = currentCat?.name_en || 'News';

    const bnSeo = autoGenerateSeoFromTitle(titleBn, summaryBn, catNameBn, 'bn');
    const enSeo = autoGenerateSeoFromTitle(titleEn || titleBn, summaryEn || summaryBn, catNameEn, 'en');

    setSeoTitleBn(bnSeo.seo_title);
    setSeoDescBn(bnSeo.seo_description);
    setFocusKeyphraseBn(bnSeo.focus_keyphrase);

    setSeoTitleEn(enSeo.seo_title);
    setSeoDescEn(enSeo.seo_description);
    setFocusKeyphraseEn(enSeo.focus_keyphrase);

    if (!slug) {
      setSlug(enSeo.slug || bnSeo.slug);
    }

    setNotification('সফলভাবে সম্পূর্ণ এসইও (SEO) মেটাডাটা ও ইউআরএল তৈরি হয়েছে!');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleGenerateSlug = () => {
    const textToSlugify = titleEn || titleBn;
    if (textToSlugify) {
      setSlug(generateSlug(textToSlugify));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleBn.trim()) {
      alert('খবরের বাংলা শিরোনাম আবশ্যক!');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(titleEn || titleBn);

    const articleToSave: Article = {
      id: initialArticle?.id || `art-${Date.now()}`,
      category_id: categoryId,
      author_id: authorId,
      featured_image: featuredImage,
      image_caption_bn: imageCaptionBn,
      image_caption_en: imageCaptionBn,
      image_credit: imageCredit,
      status,
      is_featured: isFeatured,
      is_breaking: isBreaking,
      is_trending: isTrending,
      is_sponsored: isSponsored,
      sponsor_name: isSponsored ? sponsorName : undefined,
      views: initialArticle?.views || 10,
      reading_time_minutes: Math.max(2, Math.ceil((contentBn.length + contentEn.length) / 500)),
      published_at: initialArticle?.published_at || new Date().toISOString(),
      created_at: initialArticle?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['সংবাদ', 'ফিউচার নিউজ', categories.find((c) => c.id === categoryId)?.name_bn || ''],

      slug: finalSlug,
      title_bn: titleBn.trim(),
      title_en: titleEn.trim() || titleBn.trim(),
      summary_bn: summaryBn.trim(),
      summary_en: summaryEn.trim() || summaryBn.trim(),
      content_bn: contentBn.trim(),
      content_en: contentEn.trim() || contentBn.trim(),

      seo_title_bn: seoTitleBn || `${titleBn} | ফিউচার নিউজ`,
      seo_title_en: seoTitleEn || `${titleEn || titleBn} | Future News`,
      seo_description_bn: seoDescBn || summaryBn,
      seo_description_en: seoDescEn || summaryEn || summaryBn,
      focus_keyphrase_bn: focusKeyphraseBn || titleBn.slice(0, 30),
      focus_keyphrase_en: focusKeyphraseEn || titleEn.slice(0, 30),
    };

    onSave(articleToSave);
  };

  // Image Presets for rapid testing
  const presets = [
    { label: 'Technology', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Economy', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Politics', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Sports', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80' },
    { label: 'Science', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold">
              {isEditing ? 'সংবাদ সম্পাদনা করুন (Edit Article)' : 'নতুন সংবাদ প্রকাশ করুন (Publish News)'}
            </h2>
            <p className="text-xs text-stone-400">
              দ্বিভাষিক সংবাদ, এসইও মেটাডাটা ও ইউনিক ইউআরএল প্রস্তুতকারী সিস্টেম
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerateSeo}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-xs"
            title="Auto generate SEO Title, Meta Description and Slug"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>স্মার্ট অটো এসইও (1-Click SEO)</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'আপডেট করুন' : 'এখনই প্রকাশ করুন'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Editor Sub Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          মূল খবর ও প্রতিবেদন (Content)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'seo'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          গুগল এসইও ও মেটাডাটা (SEO Suite)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          গুগল সার্চ ও সোশ্যাল প্রিভিউ (Preview)
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Bengali & English Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  বাংলা শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: দেশে প্রযুক্তি বিপ্লবের নতুন দিগন্ত উন্মোচন..."
                  value={titleBn}
                  onChange={(e) => setTitleBn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  English Headline (ঐচ্ছিক / Recommended)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next-Generation AI Supercomputing Blueprint Announced..."
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Slug Generation Bar */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  ইউনিক ইউআরএল স্ল্যাগ (Article URL Slug) *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  শিরোনাম থেকে স্ল্যাগ বানান
                </button>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-stone-200 border border-r-0 border-stone-300 rounded-l-lg text-xs font-mono text-stone-600">
                  /news/
                </span>
                <input
                  type="text"
                  required
                  placeholder="bangladesh-ai-hub-2026"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-r-lg text-sm font-mono text-stone-800 focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                এই সংবাদের প্রতিটি সংবাদের জন্য সম্পূর্ণ আলাদা অনন্য পারমালিঙ্ক তৈরি হবে।
              </p>
            </div>

            {/* Category, Author, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  সংবাদের বিভাগ (Category)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn} ({c.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  লেখক / প্রতিবেদক (Author)
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name_bn} ({a.role_bn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  স্ট্যাটাস (Status)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 bg-white font-semibold text-stone-800"
                >
                  <option value="published">প্রকাশিত (Published)</option>
                  <option value="draft">ড্রাফট (Draft)</option>
                  <option value="scheduled">শিডিউলড (Scheduled)</option>
                </select>
              </div>
            </div>

            {/* Featured Image URL & Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                ফিচারড ইমেজের ইউআরএল (Featured Image URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-stone-600">নমুনা ছবি:</span>
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setFeaturedImage(p.url)}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-0.5 rounded transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {featuredImage && (
                <div className="mt-3 relative w-full h-44 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                    লাইভ প্রিভিউ
                  </span>
                </div>
              )}
            </div>

            {/* Captions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  ছবির ক্যাপশন (বাংলা)
                </label>
                <input
                  type="text"
                  placeholder="ছবির বর্ণনা..."
                  value={imageCaptionBn}
                  onChange={(e) => setImageCaptionBn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  ছবির ক্রেডিট (Photo Credit)
                </label>
                <input
                  type="text"
                  placeholder="Unsplash / Future News"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Flags & Promotion Toggles */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  প্রধান লিড স্টোরি
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  ব্রেকিং নিউজ টিকার
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  ট্রেন্ডিং খবর
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSponsored}
                  onChange={(e) => setIsSponsored(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  স্পন্সরড খবর
                </span>
              </label>
            </div>

            {isSponsored && (
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  স্পন্সরের নাম (Sponsor Name)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Google Cloud, Beximco, Robi..."
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  খবরের সারসংক্ষেপ / প্রথম প্যারা (বাংলা) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="খবরের মূল বক্তব্য এক বা দুই বাক্যে..."
                  value={summaryBn}
                  onChange={(e) => setSummaryBn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Article Summary / Lead Paragraph (English)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key summary of the story in 1-2 sentences..."
                  value={summaryEn}
                  onChange={(e) => setSummaryEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Full Body Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  সম্পূর্ণ সংবাদের বিবরণ (বাংলা) *
                </label>
                <textarea
                  required
                  rows={10}
                  placeholder="এখানে সম্পূর্ণ বিস্তারিত খবর লিখুন। অনুচ্ছেদ ভাগ করতে এন্টার চাপুন..."
                  value={contentBn}
                  onChange={(e) => setContentBn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Article Body (English)
                </label>
                <textarea
                  rows={10}
                  placeholder="Enter full English article body here..."
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 font-serif leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  স্বয়ংক্রিয় এসইও অপটিমাইজেশন
                </h3>
                <p className="text-xs text-indigo-800 mt-0.5">
                  গুগল সার্চ ও গুগল নিউজের অ্যালগরিদম উপযোগী মেটা টাইটেল ও মেটা ডেসক্রিপশন সেট করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoGenerateSeo}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                এখনই অটো-জেনারেট করুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bengali SEO */}
              <div className="p-4 border border-stone-200 rounded-xl space-y-4">
                <h4 className="font-bold text-sm text-stone-900 border-b pb-2">
                  বাংলা এসইও মেটাডাটা
                </h4>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">SEO Meta Title (Title Tag)</span>
                    <span className="text-stone-600">{seoTitleBn.length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitleBn}
                    onChange={(e) => setSeoTitleBn(e.target.value)}
                    placeholder="গুগলে সার্চ রেজাল্টে যে শিরোনাম দেখাবে..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">SEO Meta Description</span>
                    <span className="text-stone-600">{seoDescBn.length}/160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescBn}
                    onChange={(e) => setSeoDescBn(e.target.value)}
                    placeholder="সার্চ ইঞ্জিনে শিরোনামের নিচে যে বিবরণ দেখা যাবে..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-stone-700 mb-1">
                    Focus Keyphrase (মূল ফোকাস কি-ওয়ার্ড)
                  </span>
                  <input
                    type="text"
                    value={focusKeyphraseBn}
                    onChange={(e) => setFocusKeyphraseBn(e.target.value)}
                    placeholder="যেমন: বাংলাদেশ এআই ২০২৬"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* English SEO */}
              <div className="p-4 border border-stone-200 rounded-xl space-y-4">
                <h4 className="font-bold text-sm text-stone-900 border-b pb-2">
                  English SEO Metadata
                </h4>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">SEO Meta Title</span>
                    <span className="text-stone-600">{seoTitleEn.length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitleEn}
                    onChange={(e) => setSeoTitleEn(e.target.value)}
                    placeholder="Google News Search snippet title..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-700">SEO Meta Description</span>
                    <span className="text-stone-600">{seoDescEn.length}/160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescEn}
                    onChange={(e) => setSeoDescEn(e.target.value)}
                    placeholder="Search result summary snippet for web spiders..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-stone-700 mb-1">
                    Focus Keyphrase
                  </span>
                  <input
                    type="text"
                    value={focusKeyphraseEn}
                    onChange={(e) => setFocusKeyphraseEn(e.target.value)}
                    placeholder="e.g. South Asia AI Policy"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-stone-900">গুগল সার্চ স্নsnippet প্রিভিউ (Google Search Simulator)</h3>
            <div className="p-5 bg-white border border-stone-300 rounded-xl max-w-2xl shadow-xs">
              <div className="text-xs text-stone-600 flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                  F
                </span>
                <span>futurenews.netlify.app</span>
                <span>› news › {slug || 'article-slug'}</span>
              </div>
              <h4 className="text-blue-700 hover:underline text-lg font-medium cursor-pointer leading-snug">
                {seoTitleBn || titleBn || 'সংবাদের আকর্ষণীয় এসইও শিরোনাম'}
              </h4>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                {seoDescBn || summaryBn || 'গুগল সার্চ ফলাফলের নিচে এই অংশটি সারসংক্ষেপ হিসেবে প্রদর্শিত হবে।'}
              </p>
            </div>

            {/* Social Share Card Preview */}
            <h3 className="font-bold text-sm text-stone-900 mt-8">সোশ্যাল মিডিয়া প্রিভিউ (Facebook / WhatsApp / Twitter Card)</h3>
            <div className="border border-stone-300 rounded-xl overflow-hidden max-w-md bg-white shadow-xs">
              <img
                src={featuredImage}
                alt="Social Card"
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-3 bg-stone-50 border-t border-stone-200">
                <span className="text-[10px] text-stone-600 uppercase font-mono">FUTURENEWS.NETLIFY.APP</span>
                <h5 className="font-bold text-sm text-stone-900 truncate mt-0.5">{titleBn || 'সংবাদের শিরোনাম'}</h5>
                <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{summaryBn || 'সংবাদের সংক্ষিপ্ত বিবরণী'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 font-medium"
          >
            বাতিল করুন (Cancel)
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'সংবাদ আপডেট করুন' : 'সংবাদ প্রকাশ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
