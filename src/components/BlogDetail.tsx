import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, Language, Comment } from '../types/news';
import {
  incrementBlogViews,
  toggleBlogLike,
  getComments,
  addComment,
} from '../utils/storage';
import { updateBlogPageSeo } from '../utils/seo';
import { AdBanner } from './AdBanner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Check,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Send,
  Sparkles,
  Camera,
  Languages,
} from 'lucide-react';

interface BlogDetailProps {
  blog: BlogPost;
  allBlogs?: BlogPost[];
  initialLanguage?: Language;
  language?: Language;
  onBack: () => void;
  onSelectBlog: (slug: string) => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({
  blog,
  allBlogs = [],
  initialLanguage,
  language,
  onBack,
  onSelectBlog,
}) => {
  const effectiveLang: Language = initialLanguage || language || 'bn';
  const [contentLang, setContentLang] = useState<Language>(effectiveLang);
  const [likes, setLikes] = useState(blog?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>(blog?.id ? getComments(blog.id) : []);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const recordedBlogIdRef = useRef<string | null>(null);

  // Sync SEO and record view strictly once per blog to prevent infinite re-render loops and scroll-lock
  useEffect(() => {
    if (!blog?.id) return;

    if (recordedBlogIdRef.current !== blog.id) {
      recordedBlogIdRef.current = blog.id;
      incrementBlogViews(blog.id);
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    }

    updateBlogPageSeo(blog, contentLang);
  }, [blog?.id, blog?.slug, contentLang]);

  const handleToggleLike = () => {
    if (!blog?.id) return;
    const newCount = toggleBlogLike(blog.id);
    setLikes(newCount);
    setIsLiked(!isLiked);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !blog?.id) return;

    addComment({
      article_id: blog.id,
      author_name: commentName.trim(),
      author_email: 'reader@futurenews.com',
      content: commentText.trim(),
      status: 'approved',
    });

    setComments(getComments(blog.id));
    setCommentName('');
    setCommentText('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  const title =
    (contentLang === 'bn' ? blog?.title_bn : blog?.title_en) ||
    blog?.title_bn ||
    blog?.title_en ||
    '';
  const summary =
    (contentLang === 'bn' ? blog?.summary_bn : blog?.summary_en) ||
    blog?.summary_bn ||
    blog?.summary_en ||
    '';
  const content =
    (contentLang === 'bn' ? blog?.content_bn : blog?.content_en) ||
    blog?.content_bn ||
    blog?.content_en ||
    '';
  const category =
    (contentLang === 'bn' ? blog?.category_name_bn : blog?.category_name_en) ||
    blog?.category_name_bn ||
    '';
  const caption =
    (contentLang === 'bn' ? blog?.image_caption_bn : blog?.image_caption_en) ||
    blog?.image_caption_bn ||
    '';

  const relatedBlogs = (allBlogs || [])
    .filter((b) => b && b.id !== blog?.id)
    .slice(0, 3);

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return contentLang === 'bn'
        ? d.toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString || '';
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen w-full py-6 sm:py-10 pb-32 overflow-y-visible">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-rose-600 bg-white px-3.5 py-2 rounded-lg border border-stone-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{contentLang === 'bn' ? 'সকল ব্লগে ফিরে যান' : 'Back to Blog Hub'}</span>
          </button>

          {/* Bilingual in-reader switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-stone-200 shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 pl-2 hidden sm:inline flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" />
              <span>{contentLang === 'bn' ? 'ভাষা:' : 'Lang:'}</span>
            </span>
            <button
              type="button"
              onClick={() => setContentLang('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                contentLang === 'bn'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setContentLang('en')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                contentLang === 'en'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Blog Article Container */}
        <article className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Header Info */}
          <div className="p-6 sm:p-10 pb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                {category}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(blog.published_at)}
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1 text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                {blog.reading_time_minutes} {contentLang === 'bn' ? 'মিনিট পাঠ' : 'min read'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-serif italic border-l-4 border-rose-600 pl-4 py-1 bg-stone-50/70 rounded-r-lg">
              {summary}
            </p>

            {/* Author Byline & Social Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={blog.author_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={blog.author_name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-stone-200 shadow-xs"
                />
                <div>
                  <h3 className="text-xs font-bold text-stone-900">{blog.author_name}</h3>
                  <p className="text-[11px] text-stone-500">
                    {contentLang === 'bn' ? blog.author_role_bn : blog.author_role_en}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isLiked
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  <span>{likes}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-stone-600 hover:text-emerald-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-stone-600 hover:text-blue-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Featured Hero Photo */}
          <div className="relative w-full bg-stone-900">
            <img
              src={blog?.featured_image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=1200&auto=format&fit=crop&q=80'}
              alt={title}
              className="w-full max-h-[500px] object-cover cursor-pointer"
              onClick={() => setSelectedPhoto(blog?.featured_image || null)}
              referrerPolicy="no-referrer"
            />
            {caption && (
              <div className="p-3 bg-stone-900/90 text-stone-300 text-xs flex items-center justify-between">
                <span>{caption}</span>
                <span className="text-[10px] text-stone-400">ফিউচার ফটো জার্নাল</span>
              </div>
            )}
          </div>

          {/* In-article Ad */}
          <div className="px-6 sm:px-10 pt-6">
            <AdBanner slot="in_article" />
          </div>

          {/* Main Body Text */}
          <div className="p-6 sm:p-10 space-y-6 text-stone-800 leading-relaxed text-sm sm:text-base font-sans">
            {(content || '')
              .split(/\n+/)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))}
          </div>

          {/* Attached Additional Photo Gallery (Multi-photo Story) */}
          {blog.additional_images && blog.additional_images.length > 0 && (
            <div className="p-6 sm:p-10 pt-0 space-y-4">
              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-600" />
                  <span>{contentLang === 'bn' ? 'ফটো গ্যালারি ও সংশ্লিষ্ট আলোকচিত্র' : 'Photo Gallery & Additional Frames'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blog.additional_images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhoto(imgUrl)}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-stone-200 shadow-xs relative h-56 bg-stone-900"
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo frame ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        বড় করে দেখুন
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="px-6 sm:px-10 pb-8 flex flex-wrap gap-2">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full border border-stone-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Reader Comments Section */}
        <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h3 className="text-base font-bold text-stone-900">
              {contentLang === 'bn' ? `পাঠকদের মতামত (${comments.length})` : `Reader Discussions (${comments.length})`}
            </h3>
          </div>

          {commentSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
              {contentLang === 'bn'
                ? 'ধন্যবাদ! আপনার মন্তব্যটি সফলভাবে প্রকাশিত হয়েছে।'
                : 'Thank you! Your comment has been published.'}
            </div>
          )}

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <input
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder={contentLang === 'bn' ? 'আপনার নাম লিখুন...' : 'Your Name...'}
              className="w-full sm:w-72 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={contentLang === 'bn' ? 'এই ব্লগের ওপর আপনার মূল্যবান মতামত লিখুন...' : 'Write your thoughts on this blog post...'}
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{contentLang === 'bn' ? 'মন্তব্য পাঠান' : 'Post Comment'}</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="divide-y divide-stone-100 pt-4">
            {comments.length > 0 ? (
              comments.map((comm) => (
                <div key={comm.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{comm.author_name}</span>
                    <span className="text-stone-400 text-[11px]">{formatDate(comm.created_at)}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{comm.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-3">
                {contentLang === 'bn'
                  ? 'এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।'
                  : 'No comments yet. Be the first to start the conversation.'}
              </p>
            )}
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {contentLang === 'bn' ? 'আরও পড়ুন' : 'More From Our Blog Hub'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedBlogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBlog(b.slug)}
                  className="cursor-pointer bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group p-3 space-y-2"
                >
                  <img
                    src={b.featured_image}
                    alt={b.title_bn}
                    className="w-full h-32 object-cover rounded-lg group-hover:scale-103 transition-transform"
                  />
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-rose-600 line-clamp-2">
                    {contentLang === 'bn' ? b.title_bn : b.title_en}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1">{b.author_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Enlarged"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};
