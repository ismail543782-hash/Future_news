import React, { useState, useEffect, useCallback } from 'react';
import { Article, Category, Author, BreakingNews, Language, BlogPost, Book } from './types/news';
import {
  getArticles,
  getCategories,
  getAuthors,
  getBreakingNews,
  isAdminLoggedIn,
  getArticleBySlug,
  getBlogs,
  getBlogBySlug,
  getBooks,
  getBookBySlug,
  saveBook,
} from './utils/storage';
import { updatePageSeo, updateBlogPageSeo } from './utils/seo';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { HeroSection } from './components/HeroSection';
import { ArticleCard } from './components/ArticleCard';
import { NewsDetail } from './components/NewsDetail';
import { BlogHub } from './components/BlogHub';
import { BlogDetail } from './components/BlogDetail';
import { BlogWriteModal } from './components/BlogWriteModal';
import { BookHub } from './components/BookHub';
import { BookDetail } from './components/BookDetail';
import { BookReader } from './components/BookReader';
import { BookEditor } from './components/admin/BookEditor';
import { AdBanner } from './components/AdBanner';
import { StickyBottomAd } from './components/StickyBottomAd';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Sparkles, TrendingUp, Layers, Newspaper, RefreshCw, PenTool, ArrowRight, BookOpen, Download } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [language, setLanguage] = useState<Language>('bn');

  // Navigation and Routing state
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedBookSlug, setSelectedBookSlug] = useState<string | null>(null);
  const [readingBookSlug, setReadingBookSlug] = useState<string | null>(null);
  const [readingPageNum, setReadingPageNum] = useState<number>(1);
  const [inBlogHubView, setInBlogHubView] = useState(false);
  const [inBookHubView, setInBookHubView] = useState(false);
  const [showWriteBlogModal, setShowWriteBlogModal] = useState(false);
  const [showBookPublishModal, setShowBookPublishModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inAdminView, setInAdminView] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load initial data and parse URL for deep linking
  const loadData = useCallback(() => {
    const arts = getArticles();
    const cats = getCategories();
    const auths = getAuthors();
    const brks = getBreakingNews();
    const blgs = getBlogs();
    const bks = getBooks();
    setArticles(arts);
    setCategories(cats);
    setAuthors(auths);
    setBreakingNews(brks);
    setBlogs(blgs);
    setBooks(bks);
    setIsAdmin(isAdminLoggedIn());
  }, []);

  useEffect(() => {
    loadData();

    // Check if initial URL points to a specific article, blog, book, or admin route
    const path = window.location.pathname;
    if (path.startsWith('/news/')) {
      const slugFromUrl = path.replace('/news/', '').trim();
      if (slugFromUrl) {
        setSelectedSlug(slugFromUrl);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
      }
    } else if (path.startsWith('/blog/')) {
      const blogSlug = path.replace('/blog/', '').trim();
      if (blogSlug) {
        setSelectedBlogSlug(blogSlug);
        setSelectedSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
      }
    } else if (path.startsWith('/book/')) {
      const bookSlug = path.replace('/book/', '').trim();
      if (bookSlug) {
        setSelectedBookSlug(bookSlug);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
      }
    } else if (path.startsWith('/read/')) {
      const bookSlug = path.replace('/read/', '').trim();
      if (bookSlug) {
        setReadingBookSlug(bookSlug);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
      }
    } else if (path === '/blog') {
      setInBlogHubView(true);
      setInBookHubView(false);
      setSelectedSlug(null);
      setSelectedBlogSlug(null);
      setSelectedBookSlug(null);
      setReadingBookSlug(null);
    } else if (path === '/books' || path === '/book') {
      setInBookHubView(true);
      setInBlogHubView(false);
      setSelectedSlug(null);
      setSelectedBlogSlug(null);
      setSelectedBookSlug(null);
      setReadingBookSlug(null);
    } else if (path === '/admin') {
      if (isAdminLoggedIn()) {
        setIsAdmin(true);
        setInAdminView(true);
      } else {
        setIsAdmin(false);
        setInAdminView(false);
        setShowLoginModal(true);
      }
    }

    // Handle browser back and forward buttons
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/news/')) {
        const slug = currentPath.replace('/news/', '').trim();
        setSelectedSlug(slug);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
        setInAdminView(false);
      } else if (currentPath.startsWith('/blog/')) {
        const slug = currentPath.replace('/blog/', '').trim();
        setSelectedBlogSlug(slug);
        setSelectedSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
        setInAdminView(false);
      } else if (currentPath.startsWith('/book/')) {
        const slug = currentPath.replace('/book/', '').trim();
        setSelectedBookSlug(slug);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
        setInAdminView(false);
      } else if (currentPath.startsWith('/read/')) {
        const slug = currentPath.replace('/read/', '').trim();
        setReadingBookSlug(slug);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
        setInAdminView(false);
      } else if (currentPath === '/blog') {
        setInBlogHubView(true);
        setInBookHubView(false);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInAdminView(false);
      } else if (currentPath === '/books' || currentPath === '/book') {
        setInBookHubView(true);
        setInBlogHubView(false);
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInAdminView(false);
      } else if (currentPath === '/admin') {
        if (isAdminLoggedIn()) {
          setIsAdmin(true);
          setInAdminView(true);
        } else {
          setIsAdmin(false);
          setInAdminView(false);
          setShowLoginModal(true);
        }
      } else {
        setSelectedSlug(null);
        setSelectedBlogSlug(null);
        setSelectedBookSlug(null);
        setReadingBookSlug(null);
        setInBlogHubView(false);
        setInBookHubView(false);
        setInAdminView(false);
      }
      loadData();
    };

    // Auto sync when data changes anywhere
    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('futurenews_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('futurenews_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, [loadData]);

  // Handle unique article URL navigation
  const handleSelectArticle = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedBlogSlug(null);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    setInAdminView(false);
    window.history.pushState({}, '', `/news/${slug}`);
  };

  // Handle unique blog URL navigation
  const handleSelectBlog = (slug: string) => {
    setSelectedBlogSlug(slug);
    setSelectedSlug(null);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    setInAdminView(false);
    window.history.pushState({}, '', `/blog/${slug}`);
  };

  // Handle unique book URL navigation
  const handleSelectBook = (slug: string) => {
    loadData();
    setSelectedBookSlug(slug);
    setReadingBookSlug(null);
    setSelectedSlug(null);
    setSelectedBlogSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    setInAdminView(false);
    window.history.pushState({}, '', `/book/${slug}`);
  };

  // Handle Start Reading Book (Interactive Page by Page)
  const handleStartReading = (slug: string, pageNum = 1) => {
    loadData();
    setReadingBookSlug(slug);
    setReadingPageNum(pageNum);
    setSelectedBookSlug(null);
    setSelectedSlug(null);
    setSelectedBlogSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    setInAdminView(false);
    window.history.pushState({}, '', `/read/${slug}`);
  };

  // Handle Opening Book Hub / E-Library
  const handleOpenBookHub = () => {
    loadData();
    setInBookHubView(true);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setInBlogHubView(false);
    setSelectedBlogSlug(null);
    setSelectedSlug(null);
    setInAdminView(false);
    setActiveCategory(null);
    setSearchQuery('');
    window.history.pushState({}, '', '/books');
  };

  // Handle Opening Blog Hub Feed
  const handleOpenBlogHub = () => {
    loadData();
    setInBlogHubView(true);
    setInBookHubView(false);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setSelectedBlogSlug(null);
    setSelectedSlug(null);
    setInAdminView(false);
    setActiveCategory(null);
    setSearchQuery('');
    window.history.pushState({}, '', '/blog');
  };

  // Handle Return to Home
  const handleGoHome = () => {
    loadData();
    setSelectedSlug(null);
    setSelectedBlogSlug(null);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    setActiveCategory(null);
    setSearchQuery('');
    setInAdminView(false);
    window.history.pushState({}, '', '/');
    updatePageSeo(undefined, language);
  };

  // Admin Entry Handler
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn()) {
      setInAdminView(true);
      setSelectedSlug(null);
      setSelectedBlogSlug(null);
      setSelectedBookSlug(null);
      setReadingBookSlug(null);
      setInBlogHubView(false);
      setInBookHubView(false);
      window.history.pushState({}, '', '/admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLoginModal(false);
    setInAdminView(true);
    setSelectedSlug(null);
    setSelectedBlogSlug(null);
    setSelectedBookSlug(null);
    setReadingBookSlug(null);
    setInBlogHubView(false);
    setInBookHubView(false);
    window.history.pushState({}, '', '/admin');
  };

  // Filter articles based on Category, Search & Published Status
  const publishedArticles = (articles || []).filter(
    (a) => a && (a.status === 'published' || a.status === undefined)
  );

  const filteredArticles = publishedArticles.filter((art) => {
    if (!art) return false;
    const matchesCategory = activeCategory === null || art.category_id === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const titleBn = (art.title_bn || '').toLowerCase();
    const titleEn = (art.title_en || '').toLowerCase();
    const summaryBn = (art.summary_bn || '').toLowerCase();
    const summaryEn = (art.summary_en || '').toLowerCase();

    const matchesSearch =
      titleBn.includes(query) ||
      titleEn.includes(query) ||
      summaryBn.includes(query) ||
      summaryEn.includes(query);

    return matchesCategory && matchesSearch;
  });

  // Pick lead story and secondary stories
  const leadArticle =
    publishedArticles.find((a) => a.is_featured) || publishedArticles[0];
  const subArticles = publishedArticles
    .filter((a) => a && a.id !== leadArticle?.id)
    .slice(0, 3);

  // If a single news article, blog, or book is selected, pick entity
  const selectedArticle = selectedSlug ? getArticleBySlug(selectedSlug) : null;
  const selectedBlog = selectedBlogSlug ? getBlogBySlug(selectedBlogSlug) : null;
  const selectedBook = selectedBookSlug ? getBookBySlug(selectedBookSlug) : null;
  const selectedReadingBook = readingBookSlug ? getBookBySlug(readingBookSlug) : null;

  // View: Admin Dashboard
  if (inAdminView && isAdmin) {
    return (
      <ErrorBoundary fallbackTitle="অ্যাডমিন ড্যাশবোর্ডে ত্রুটি">
        <AdminDashboard
          articles={articles}
          categories={categories}
          authors={authors}
          onRefreshData={loadData}
          onExitAdmin={handleGoHome}
          onSelectArticle={handleSelectArticle}
          onSelectBlog={handleSelectBlog}
          onSelectBook={handleSelectBook}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-stone-50 flex flex-col selection:bg-rose-600 selection:text-white overflow-y-visible">
        {/* Header */}
        <Header
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(catId) => {
            loadData();
            setActiveCategory(catId);
            setSelectedSlug(null);
            setSelectedBlogSlug(null);
            setSelectedBookSlug(null);
            setReadingBookSlug(null);
            setInBlogHubView(false);
            setInBookHubView(false);
            setSearchQuery('');
            window.history.pushState({}, '', '/');
          }}
          language={language}
          onToggleLanguage={setLanguage}
          onOpenAdmin={handleOpenAdmin}
          isAdmin={isAdmin}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onGoHome={handleGoHome}
          isBlogHubActive={inBlogHubView || !!selectedBlogSlug}
          onOpenBlogHub={handleOpenBlogHub}
          isBookHubActive={inBookHubView || !!selectedBookSlug || !!readingBookSlug}
          onOpenBookHub={handleOpenBookHub}
          onOpenWriteBlog={() => setShowWriteBlogModal(true)}
        />

        {/* Breaking News Ticker */}
        <BreakingNewsTicker
          items={breakingNews}
          language={language}
          onSelectArticle={handleSelectArticle}
        />

        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-y-visible">
          {/* Active Book Reader (Interactive Page-by-Page) */}
          {readingBookSlug ? (
            selectedReadingBook ? (
              <BookReader
                book={selectedReadingBook}
                initialPage={readingPageNum}
                language={language}
                onClose={() => handleSelectBook(selectedReadingBook.slug)}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-full mx-auto flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {language === 'bn' ? 'বইটি খুঁজে পাওয়া যায়নি' : 'Book Not Found'}
                </h2>
                <p className="text-stone-600 text-sm">
                  {language === 'bn'
                    ? 'যে বইটি পড়তে চাইছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি ভুল।'
                    : 'The book you are looking for has been removed or moved.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenBookHub}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সকল বই দেখুন' : 'Browse All Books'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : selectedBookSlug ? (
            selectedBook ? (
              <BookDetail
                book={selectedBook}
                allBooks={books}
                language={language}
                onOpenReader={(slug, page) => handleStartReading(slug, page)}
                onBack={handleOpenBookHub}
                onSelectOtherBook={handleSelectBook}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-full mx-auto flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {language === 'bn' ? 'বইটি খুঁজে পাওয়া যায়নি' : 'Book Not Found'}
                </h2>
                <p className="text-stone-600 text-sm">
                  {language === 'bn'
                    ? 'যে বইটি খুঁজছেন তা আর পাওয়া যাচ্ছে না।'
                    : 'The book you are looking for cannot be located.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenBookHub}
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সকল বই দেখুন' : 'Browse All Books'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : inBookHubView ? (
            /* Public Book Hub & E-Library Catalog */
            <BookHub
              books={books}
              language={language}
              onSelectBook={handleSelectBook}
              onOpenReader={(slug) => handleStartReading(slug, 1)}
              onOpenAdminUpload={isAdmin ? () => setShowBookPublishModal(true) : undefined}
              onBackToNews={handleGoHome}
            />
          ) : selectedBlogSlug ? (
            selectedBlog ? (
              <BlogDetail
                blog={selectedBlog}
                allBlogs={blogs}
                initialLanguage={language}
                language={language}
                onBack={handleOpenBlogHub}
                onSelectBlog={handleSelectBlog}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-full mx-auto flex items-center justify-center">
                  <Newspaper className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {language === 'bn' ? 'ব্লগটি খুঁজে পাওয়া যায়নি' : 'Blog Post Not Found'}
                </h2>
                <p className="text-stone-600 text-sm">
                  {language === 'bn'
                    ? 'যে ব্লগ পোস্টটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিংকটি পরিবর্তন হয়েছে।'
                    : 'The blog article you are looking for has been moved or removed.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenBlogHub}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সকল ব্লগ দেখুন' : 'Browse All Blogs'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : inBlogHubView ? (
            /* Public Blog Hub & Photo Gallery */
            <BlogHub
              blogs={blogs}
              language={language}
              onSelectBlog={handleSelectBlog}
              onOpenWriteModal={() => setShowWriteBlogModal(true)}
              onBackToNews={handleGoHome}
            />
          ) : selectedSlug ? (
            selectedArticle ? (
              /* Single News Article Deep-Linked View */
              <NewsDetail
                article={selectedArticle}
                category={categories.find((c) => c.id === selectedArticle.category_id)}
                author={authors.find((a) => a.id === selectedArticle.author_id)}
                allArticles={publishedArticles}
                categories={categories}
                language={language}
                onBack={handleGoHome}
                onSelectArticle={handleSelectArticle}
                onToggleLanguage={setLanguage}
              />
            ) : (
              <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-stone-100 text-stone-500 rounded-full mx-auto flex items-center justify-center">
                  <Newspaper className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {language === 'bn' ? 'সংবাদটি খুঁজে পাওয়া যায়নি' : 'Article Not Found'}
                </h2>
                <p className="text-stone-600 text-sm">
                  {language === 'bn'
                    ? 'যে সংবাদটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা ইউআরএল লিংকটি ভুল।'
                    : 'The news story you are looking for cannot be located.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
          /* Portal Homepage / Category Feed */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* If user searched or selected a category, show the filtered grid banner */}
            {(activeCategory || searchQuery) && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-stone-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <h2 className="text-base font-bold text-stone-900">
                    {searchQuery
                      ? language === 'bn'
                        ? `অনুসন্ধানের ফলাফল: "${searchQuery}" (${filteredArticles.length}টি সংবাদ)`
                        : `Search Results for: "${searchQuery}" (${filteredArticles.length} stories)`
                      : language === 'bn'
                      ? `${categories.find((c) => c.id === activeCategory)?.name_bn} বিভাগ`
                      : `${categories.find((c) => c.id === activeCategory)?.name_en} News`}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  {language === 'bn' ? 'সকল খবর দেখুন' : 'Reset to All'}
                </button>
              </div>
            )}

            {/* Hero Section (only when no search or category filter is active) */}
            {!activeCategory && !searchQuery && leadArticle && (
              <HeroSection
                leadArticle={leadArticle}
                subArticles={subArticles}
                categories={categories}
                authors={authors}
                language={language}
                onSelectArticle={handleSelectArticle}
              />
            )}

            {/* In-Feed Banner Monetization Slot */}
            <div className="my-6">
              <AdBanner slot="in_article" />
            </div>

            {/* Main News Layout: Articles Grid + Right Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
              {/* Primary News Feed (8 cols) */}
              <section className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b-2 border-stone-900">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-rose-600" />
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-stone-900">
                      {language === 'bn' ? 'সর্বশেষ সংবাদ ও প্রতিবেদন' : 'Latest Dispatches'}
                    </h2>
                  </div>
                  <span className="text-xs text-stone-600">
                    {language === 'bn' ? 'নিয়মিত আপডেট' : 'Real-time Feed'}
                  </span>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                    <p className="text-stone-600 text-sm">
                      {language === 'bn'
                        ? 'এই বিভাগে বর্তমানে কোনো সংবাদ নেই।'
                        : 'No articles found in this section.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredArticles.map((article) => {
                      const cat = categories.find((c) => c.id === article.category_id);
                      const auth = authors.find((a) => a.id === article.author_id);
                      return (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          category={cat}
                          author={auth}
                          language={language}
                          onSelect={handleSelectArticle}
                          variant="grid"
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Sidebar Rail (4 cols) */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Sidebar Ad Placement (300x600) */}
                <AdBanner slot="sidebar" />

                {/* Trending News Widget */}
                <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-stone-200 mb-4">
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                      {language === 'bn' ? 'সবচেয়ে বেশি পঠিত খবর' : 'Trending Headlines'}
                    </h3>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {[...publishedArticles]
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 4)
                      .map((trendArt, idx) => {
                        const trendCat = categories.find((c) => c.id === trendArt.category_id);
                        return (
                          <div
                            key={trendArt.id}
                            onClick={() => handleSelectArticle(trendArt.slug)}
                            className="py-3 group cursor-pointer flex gap-3 items-start hover:bg-stone-50/70 p-1.5 rounded transition-colors"
                          >
                            <span className="font-mono text-lg font-black text-stone-300 group-hover:text-rose-600 transition-colors shrink-0 w-5">
                              0{idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] uppercase font-bold text-rose-600 block mb-0.5">
                                {trendCat ? (language === 'bn' ? trendCat.name_bn : trendCat.name_en) : ''}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                                {language === 'bn' ? trendArt.title_bn : trendArt.title_en}
                              </h4>
                              <span className="text-[11px] text-stone-600 mt-1 block">
                                {trendArt.views.toLocaleString()} {language === 'bn' ? 'ভিউ' : 'views'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Editorial Columns / Opinion Quote */}
                <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-xl p-5 shadow-xs border border-stone-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block mb-2">
                    {language === 'bn' ? 'সম্পাদকীয় পর্যবেক্ষণ' : 'Editorial Perspective'}
                  </span>
                  <blockquote className="text-xs sm:text-sm font-serif italic text-stone-200 leading-relaxed">
                    "{language === 'bn'
                      ? 'তথ্যের অবাধ প্রবাহ এবং বস্তুনিষ্ঠ বিশ্লেষণই একটি দায়িত্বশীল সমাজের ভিত্তি। সংবাদের নিরপেক্ষতাই আমাদের পরম ব্রত।'
                      : 'Uncompromised objectivity and rigorous context form the cornerstone of informed modern civic discourse.'}"
                  </blockquote>
                  <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-2 text-xs text-stone-400">
                    <span className="font-bold text-stone-200">ইসমাইল হোসেন</span>
                    <span>•</span>
                    <span>প্রধান সম্পাদক ও প্রকাশক</span>
                  </div>
                </div>
              </aside>
            </div>

            {/* Interactive Blog & Community Photo Story Strip */}
            <div className="my-10 p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-stone-950 rounded-2xl text-white shadow-md border border-purple-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>{language === 'bn' ? 'মুক্ত কলম ও আলোকচিত্র' : 'Community Blogs & Stories'}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {language === 'bn' ? 'পাঠকের কণ্ঠস্বর ও ফটো জার্নাল' : 'Public Opinions & Visual Stories'}
                  </h3>
                  <p className="text-xs text-stone-300">
                    {language === 'bn'
                      ? 'খবরের পাশাপাশি আপনার নিজের গল্প, ভ্রমণ অভিজ্ঞতা বা মতামত প্রকাশ করুন সহজে।'
                      : 'Share your own perspectives, travel experiences, or analyses with millions of readers.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWriteBlogModal(true)}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'একটি ব্লগ লিখুন' : 'Write a Blog'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenBlogHub}
                    className="flex items-center gap-1.5 bg-purple-800/80 hover:bg-purple-700 text-purple-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-purple-600/40 transition-all"
                  >
                    <span>{language === 'bn' ? 'সকল ব্লগ দেখুন' : 'Explore All'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mini Blog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {blogs.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBlog(b.slug)}
                    className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 transition-all flex gap-3 items-center"
                  >
                    <img
                      src={b.featured_image}
                      alt={b.title_bn}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-purple-300 uppercase block mb-0.5">
                        {language === 'bn' ? b.category_name_bn : b.category_name_en}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                        {language === 'bn' ? b.title_bn : b.title_en}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                        <span>{b.author_name}</span>
                        <span>•</span>
                        <span>{b.views} ভিউ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Library & Free Digital Books Strip */}
            {books.length > 0 && (
              <div className="my-10 p-6 bg-gradient-to-r from-amber-950 via-stone-900 to-stone-950 rounded-2xl text-white shadow-md border border-amber-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-800/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>{language === 'bn' ? 'অনলাইন ই-লাইব্রেরি ও ফ্রি পিডিএফ' : 'Online E-Library & Free PDF Books'}</span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {language === 'bn' ? 'বই পড়ুন ও সংগ্রহ করুন' : 'Read Books & Download PDFs'}
                    </h3>
                    <p className="text-xs text-stone-300">
                      {language === 'bn'
                        ? 'ক্যারিয়ার, ইতিহাস, সাহিত্য ও মোটিভেশনাল বই অনলাইনে অধ্যায়ভিত্তিক পড়ুন অথবা পিডিএফ ডাউনলোড করুন।'
                        : 'Explore educational, motivational, and literary books online with digital page-turning reader.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenBookHub}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                    >
                      <span>{language === 'bn' ? 'সকল বই দেখুন' : 'Explore Library'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Book Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {books.slice(0, 4).map((bk) => (
                    <div
                      key={bk.id}
                      onClick={() => handleSelectBook(bk.slug)}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 transition-all flex gap-3 items-center"
                    >
                      <img
                        src={bk.cover_image}
                        alt={bk.title}
                        className="w-14 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5 truncate">
                          {bk.category_bn}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {bk.title}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-1 truncate">{bk.author}</p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                          <span>{bk.total_pages} পৃষ্ঠা</span>
                          {bk.pdf_url && (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <Download className="w-2.5 h-2.5" /> PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Homepage Bottom Monetization Banner */}
            <div className="my-8">
              <AdBanner slot="bottom_banner" />
            </div>
          </main>
        )}
      </div>

      {/* Sticky Bottom Floating Banner Ad */}
      <StickyBottomAd />

      {/* Footer */}
      <Footer
        categories={categories}
        language={language}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          setSelectedSlug(null);
          setSelectedBlogSlug(null);
          setSelectedBookSlug(null);
          setReadingBookSlug(null);
          setInBlogHubView(false);
          setInBookHubView(false);
        }}
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdmin}
        onOpenBlogHub={handleOpenBlogHub}
        onOpenBookHub={handleOpenBookHub}
      />

      {/* Write Blog Modal */}
      <BlogWriteModal
        isOpen={showWriteBlogModal}
        language={language}
        onClose={() => setShowWriteBlogModal(false)}
        onSuccess={(newBlog) => {
          loadData();
          handleSelectBlog(newBlog.slug);
        }}
      />

      {/* Book Publish Modal for Admin */}
      {showBookPublishModal && (
        <BookEditor
          language={language}
          onSave={(savedBook) => {
            saveBook(savedBook);
            loadData();
            setShowBookPublishModal(false);
            handleSelectBook(savedBook.slug);
          }}
          onCancel={() => setShowBookPublishModal(false)}
        />
      )}

        {/* Admin Login Modal Gate */}
        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            if (window.location.pathname === '/admin') {
              window.history.pushState({}, '', '/');
            }
          }}
          onSuccess={handleLoginSuccess}
        />
      </div>
    </ErrorBoundary>
  );
}
