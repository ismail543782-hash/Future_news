import React, { useState } from 'react';
import { BlogPost, Language } from '../types/news';
import {
  PenTool,
  Search,
  Eye,
  Heart,
  Clock,
  Calendar,
  Sparkles,
  Camera,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { AdBanner } from './AdBanner';

interface BlogHubProps {
  blogs?: BlogPost[];
  language: Language;
  onSelectBlog: (slug: string) => void;
  onOpenWriteModal: () => void;
  onBackToNews?: () => void;
}

export const BlogHub: React.FC<BlogHubProps> = ({
  blogs = [],
  language,
  onSelectBlog,
  onOpenWriteModal,
  onBackToNews,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const safeBlogs = (blogs || []).filter(Boolean);

  const categories = Array.from(
    new Set(
      safeBlogs
        .map((b) => (language === 'bn' ? b.category_name_bn : b.category_name_en) || b.category_name_bn || b.category_name_en)
        .filter(Boolean) as string[]
    )
  );

  const filteredBlogs = safeBlogs.filter((blog) => {
    const cat = (language === 'bn' ? blog.category_name_bn : blog.category_name_en) || blog.category_name_bn || '';
    const matchesCat = selectedCategory === 'all' || cat === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const titleBn = (blog.title_bn || '').toLowerCase();
    const titleEn = (blog.title_en || '').toLowerCase();
    const summaryBn = (blog.summary_bn || '').toLowerCase();
    const authorName = (blog.author_name || '').toLowerCase();

    const matchesSearch =
      query === '' ||
      titleBn.includes(query) ||
      titleEn.includes(query) ||
      summaryBn.includes(query) ||
      authorName.includes(query);

    return matchesCat && matchesSearch;
  });

  const featuredBlog = filteredBlogs[0] || safeBlogs[0];
  const restBlogs = filteredBlogs.filter((b) => b && b.id !== featuredBlog?.id);

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return language === 'bn'
        ? d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString || '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Blog Hub Banner / Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-10 border border-stone-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 text-xs font-bold border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'bn' ? 'মুক্ত কলম ও ভিজ্যুয়াল স্টোরি' : 'Editorial Voices & Visual Stories'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {language === 'bn' ? 'ফিউচার ব্লগ ও আলোকচিত্র হাব' : 'Future News Blog & Visual Journal'}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              {language === 'bn'
                ? 'অনুসন্ধানী মতামত, প্রযুক্তি দর্শন, ভ্রমণের গল্প এবং প্রফেশনাল আলোকচিত্রীদের চোখ দিয়ে বিশ্বকে দেখুন। আপনিও আপনার লেখা ও ছবি সরাসরি পোস্ট করতে পারেন।'
                : 'Immerse in thought leadership, tech ethics, visual travelogues, and cultural commentaries. Contribute your own perspectives and photo stories.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              id="btn-write-blog-hub"
              onClick={onOpenWriteModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <PenTool className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন ব্লগ ও ছবি লিখুন' : 'Write Blog / Post Photos'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {language === 'bn' ? 'সব ব্লগ' : 'All Blogs'}
          </button>
          {categories.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'ব্লগ খুঁজুন...' : 'Search blog stories...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Featured Lead Blog */}
      {featuredBlog && (
        <div
          onClick={() => onSelectBlog(featuredBlog.slug)}
          className="group cursor-pointer bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden bg-stone-900">
            <img
              src={featuredBlog.featured_image}
              alt={language === 'bn' ? featuredBlog.title_bn : featuredBlog.title_en}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-md">
                {language === 'bn' ? featuredBlog.category_name_bn : featuredBlog.category_name_en}
              </span>
              {featuredBlog.additional_images && featuredBlog.additional_images.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>+{featuredBlog.additional_images.length} Photos</span>
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(featuredBlog.published_at)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredBlog.reading_time_minutes} {language === 'bn' ? 'মিনিট পাঠ' : 'min read'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-rose-600 transition-colors leading-snug">
                {language === 'bn' ? featuredBlog.title_bn : featuredBlog.title_en}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                {language === 'bn' ? featuredBlog.summary_bn : featuredBlog.summary_en}
              </p>
            </div>

            {/* Author Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={featuredBlog.author_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={featuredBlog.author_name}
                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{featuredBlog.author_name}</h4>
                  <p className="text-[11px] text-stone-500">
                    {language === 'bn' ? featuredBlog.author_role_bn : featuredBlog.author_role_en}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {featuredBlog.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-rose-600" />
                  {featuredBlog.likes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-article ad banner */}
      <AdBanner slot="in_article" className="my-6" />

      {/* Grid of Remaining Blogs */}
      {restBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => onSelectBlog(blog.slug)}
              className="group cursor-pointer bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-900">
                  <img
                    src={blog.featured_image}
                    alt={language === 'bn' ? blog.title_bn : blog.title_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-900/80 text-white text-[11px] font-bold backdrop-blur-xs">
                    {language === 'bn' ? blog.category_name_bn : blog.category_name_en}
                  </span>
                  {blog.additional_images && blog.additional_images.length > 0 && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      +{blog.additional_images.length}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span>{formatDate(blog.published_at)}</span>
                    <span>•</span>
                    <span>{blog.reading_time_minutes} {language === 'bn' ? 'মি. পাঠ' : 'min'}</span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                    {language === 'bn' ? blog.title_bn : blog.title_en}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {language === 'bn' ? blog.summary_bn : blog.summary_en}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 text-[11px]">
                    {blog.author_name}
                  </span>
                  <div className="flex items-center gap-2.5 text-stone-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {blog.views}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600">
                      <Heart className="w-3 h-3 fill-rose-600" />
                      {blog.likes}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
          <p className="text-stone-500 text-sm">
            {language === 'bn' ? 'কোনো ব্লগ পাওয়া যায়নি।' : 'No blog articles found.'}
          </p>
        </div>
      )}
    </div>
  );
};
