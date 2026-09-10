import React, { useState, useEffect } from 'react';
import { Article, Category, Author, Language, Comment } from '../types/news';
import { incrementArticleViews, getComments, addComment } from '../utils/storage';
import { updatePageSeo } from '../utils/seo';
import {
  Clock,
  Eye,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  ArrowLeft,
  Calendar,
  Check,
  MessageSquare,
  Send,
  Sparkles,
  Printer,
  Copy,
} from 'lucide-react';
import { AdBanner } from './AdBanner';
import { ArticleCard } from './ArticleCard';

interface NewsDetailProps {
  article: Article;
  category?: Category;
  author?: Author;
  allArticles: Article[];
  categories: Category[];
  language: Language;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
  onToggleLanguage?: (lang: Language) => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({
  article,
  category,
  author,
  allArticles,
  categories,
  language,
  onBack,
  onSelectArticle,
  onToggleLanguage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Unique article URL
  const articleUrl = `${window.location.origin}/news/${article.slug}`;

  useEffect(() => {
    // Increment views once on load
    incrementArticleViews(article.id);
    updatePageSeo(article, language);
    setComments(getComments(article.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Scroll progress handler
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.speechSynthesis?.cancel();
    };
  }, [article.id, article.slug, language]);

  const title = language === 'bn' ? article.title_bn : article.title_en;
  const summary = language === 'bn' ? article.summary_bn : article.summary_en;
  const content = language === 'bn' ? article.content_bn : article.content_en;
  const catName = category ? (language === 'bn' ? category.name_bn : category.name_en) : '';
  const authorName = author ? (language === 'bn' ? author.name_bn : author.name_en) : 'Staff Reporter';
  const authorRole = author ? (language === 'bn' ? author.role_bn : author.role_en) : '';
  const authorBio = author ? (language === 'bn' ? author.bio_bn : author.bio_en) : '';
  const caption = language === 'bn' ? article.image_caption_bn : article.image_caption_en;

  // Format date
  const formattedDate = new Date(article.published_at).toLocaleDateString(
    language === 'bn' ? 'bn-BD' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  // Copy Link action
  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Text-To-Speech reader
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'bn' ? 'আপনার ব্রাউজারে অডিও রিডার সমর্থিত নয়' : 'Audio reader not supported');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToRead = `${title}. ${summary}. ${content.replace(/\n+/g, ' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Social Share handlers
  const handleSocialShare = (platform: 'fb' | 'x' | 'wa' | 'in') => {
    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(title);
    let shareUrl = '';

    if (platform === 'fb') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    } else if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    } else if (platform === 'wa') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
    } else if (platform === 'in') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  // Submit comment
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newCommentText.trim()) return;

    addComment({
      article_id: article.id,
      author_name: newAuthorName.trim(),
      author_email: newAuthorEmail.trim() || 'reader@futurenews.com',
      content: newCommentText.trim(),
      status: 'approved',
    });

    setCommentSubmitted(true);
    setComments(getComments(article.id));
    setNewAuthorName('');
    setNewAuthorEmail('');
    setNewCommentText('');
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  // Related articles
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  // Split content into paragraphs for readable typography & in-article ad placement
  const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Sticky Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-stone-200 z-50">
        <div
          className="h-full bg-rose-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 font-semibold text-stone-700 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </button>
            <span>/</span>
            {catName && <span className="text-rose-600 font-semibold">{catName}</span>}
          </div>

          {/* Canonical Unique URL Copy Pill & Language Switch */}
          <div className="flex items-center gap-2">
            {onToggleLanguage && (
              <div className="flex items-center bg-white border border-stone-300 rounded p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onToggleLanguage('bn')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    language === 'bn' ? 'bg-rose-600 text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => onToggleLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    language === 'en' ? 'bg-rose-600 text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English
                </button>
              </div>
            )}

            <span className="hidden sm:inline text-stone-600 font-mono text-[11px]">
              /news/{article.slug}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 bg-white border border-stone-300 px-2.5 py-1 rounded text-xs font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors"
              title="Copy news link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">
                    {language === 'bn' ? 'কপি হয়েছে' : 'Copied!'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-600" />
                  <span>{language === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="py-6 max-w-4xl mx-auto">
          {catName && (
            <div className="mb-3">
              <span className="inline-block bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded">
                {catName}
              </span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight sm:leading-snug">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-medium mt-4 leading-relaxed border-l-4 border-rose-500 pl-4 bg-stone-100/50 py-2 rounded-r">
            {summary}
          </p>

          {/* Author and Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-stone-200">
            <div className="flex items-center gap-3">
              {author?.photo && (
                <img
                  src={author.photo}
                  alt={authorName}
                  className="w-11 h-11 rounded-full object-cover border border-stone-300"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <div className="font-bold text-sm text-stone-900">{authorName}</div>
                <div className="text-xs text-stone-600 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.reading_time_minutes} {language === 'bn' ? 'মিনিট পাঠ' : 'min read'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Audio Listen, Views, Social */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  isPlayingAudio
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
                title={language === 'bn' ? 'সংবাদটি শুনুন' : 'Listen to article'}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'থামুন' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{language === 'bn' ? 'সংবাদটি শুনুন' : 'Listen'}</span>
                  </>
                )}
              </button>

              <span className="flex items-center gap-1 text-xs text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-full">
                <Eye className="w-3.5 h-3.5 text-stone-600" />
                <span>{article.views.toLocaleString()}</span>
              </span>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-full hover:bg-stone-50"
                title="Print Article"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Article Main Column (8 cols) */}
          <div className="lg:col-span-8">
            {/* Featured Image */}
            <div className="overflow-hidden rounded-xl bg-stone-900 shadow-md">
              <img
                src={article.featured_image}
                alt={title}
                className="w-full h-auto max-h-[520px] object-cover"
                referrerPolicy="no-referrer"
              />
              {(caption || article.image_credit) && (
                <div className="p-3 bg-stone-900 text-stone-300 text-xs flex flex-wrap items-center justify-between gap-2 border-t border-stone-800">
                  {caption && <span className="italic">{caption}</span>}
                  {article.image_credit && (
                    <span className="text-[11px] text-stone-400">ছবি: {article.image_credit}</span>
                  )}
                </div>
              )}
            </div>

            {/* Social Share Bar */}
            <div className="flex items-center justify-between py-4 my-4 border-y border-stone-200">
              <span className="text-xs font-bold uppercase text-stone-600 tracking-wider">
                {language === 'bn' ? 'সংবাদটি শেয়ার করুন:' : 'SHARE THIS STORY:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialShare('fb')}
                  className="px-3 py-1 bg-[#1877F2] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare('x')}
                  className="px-3 py-1 bg-black text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                >
                  X (Twitter)
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare('wa')}
                  className="px-3 py-1 bg-[#25D366] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare('in')}
                  className="px-3 py-1 bg-[#0A66C2] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                >
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Article Content Paragraphs with In-Article Ad Placement */}
            <div className="font-serif text-stone-900 text-lg sm:text-xl leading-relaxed space-y-6">
              {paragraphs.map((p, idx) => (
                <React.Fragment key={idx}>
                  <p className="text-stone-800 tracking-normal">{p}</p>

                  {/* Insert In-Article Monetization Ad after the 2nd paragraph */}
                  {idx === 1 && (
                    <div className="my-8 not-serif">
                      <AdBanner slot="in_article" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Tags Cloud */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <span className="text-xs font-bold uppercase text-stone-600 block mb-2">
                  {language === 'bn' ? 'বিষয় / ট্যাগসমূহ:' : 'TOPICS / TAGS:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 hover:bg-stone-200 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio Box */}
            {author && (
              <div className="mt-8 p-5 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={author.photo}
                  alt={authorName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-base">{authorName}</h4>
                    <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                      {authorRole}
                    </span>
                  </div>
                  {authorBio && <p className="text-xs text-stone-600 mt-1">{authorBio}</p>}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-10 pt-8 border-t border-stone-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-rose-600" />
                  <span>
                    {language === 'bn'
                      ? `মন্তব্য (${comments.length})`
                      : `Comments (${comments.length})`}
                  </span>
                </h3>
              </div>

              {/* Add Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                className="bg-white p-5 rounded-xl border border-stone-200 mb-8 shadow-xs"
              >
                <h4 className="font-bold text-sm text-stone-800 mb-3">
                  {language === 'bn' ? 'আপনার মতামত দিন' : 'Leave your perspective'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    required
                    placeholder={language === 'bn' ? 'আপনার নাম *' : 'Your name *'}
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <input
                    type="email"
                    placeholder={language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (optional)'}
                    value={newAuthorEmail}
                    onChange={(e) => setNewAuthorEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder={language === 'bn' ? 'আপনার মন্তব্য লিখুন...' : 'Write your comment...'}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-600">
                    {language === 'bn'
                      ? 'নীতিমালা মেনে গঠনমূলক মন্তব্য করুন।'
                      : 'Constructive comments only.'}
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Post Comment'}</span>
                  </button>
                </div>
                {commentSubmitted && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    {language === 'bn'
                      ? 'ধন্যবাদ! আপনার মন্তব্য সফলভাবে যুক্ত হয়েছে।'
                      : 'Thank you! Your comment has been posted.'}
                  </p>
                )}
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-stone-600 text-sm italic">
                    {language === 'bn'
                      ? 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।'
                      : 'No comments yet. Be the first to comment.'}
                  </p>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="bg-white p-4 rounded-lg border border-stone-200"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-stone-900">{comm.author_name}</span>
                        <span className="text-xs text-stone-600">
                          {new Date(comm.created_at).toLocaleDateString(
                            language === 'bn' ? 'bn-BD' : 'en-US'
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sidebar Ad Placement */}
            <AdBanner slot="sidebar" />

            {/* Related News Widget */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-stone-900 pb-2.5 border-b border-stone-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>{language === 'bn' ? 'সম্পর্কিত অন্যান্য খবর' : 'Related Stories'}</span>
              </h3>
              <div className="mt-2 divide-y divide-stone-100">
                {relatedArticles.map((rel) => {
                  const relCat = categories.find((c) => c.id === rel.category_id);
                  return (
                    <ArticleCard
                      key={rel.id}
                      article={rel}
                      category={relCat}
                      language={language}
                      onSelect={onSelectArticle}
                      variant="compact"
                    />
                  );
                })}
              </div>
            </div>

            {/* Newsletter Box */}
            <div className="bg-stone-900 text-white rounded-xl p-5 shadow-xs">
              <h4 className="font-bold text-base mb-1">
                {language === 'bn' ? 'দৈনিক নিউজলেটার' : 'Daily Morning Brief'}
              </h4>
              <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিদিনের সেরা সংবাদ বিশ্লেষণ আপনার ইনবক্সে পেতে সাবস্ক্রাইব করুন।'
                  : 'Get curated analytical briefings and breaking alerts directly to your inbox.'}
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => alert(language === 'bn' ? 'নিউজলেটারে সাবস্ক্রিপশন সফল হয়েছে!' : 'Subscribed successfully!')}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded transition-colors"
                >
                  {language === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
