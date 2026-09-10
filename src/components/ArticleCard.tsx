import React from 'react';
import { Article, Category, Author, Language } from '../types/news';
import { Clock, Eye, Share2, Sparkles } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  category?: Category;
  author?: Author;
  language: Language;
  onSelect: (slug: string) => void;
  variant?: 'grid' | 'horizontal' | 'compact' | 'featured';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  category,
  author,
  language,
  onSelect,
  variant = 'grid',
}) => {
  const title =
    (language === 'bn' ? article?.title_bn : article?.title_en) ||
    article?.title_bn ||
    article?.title_en ||
    '';
  const summary =
    (language === 'bn' ? article?.summary_bn : article?.summary_en) ||
    article?.summary_bn ||
    article?.summary_en ||
    '';
  const catName = category ? (language === 'bn' ? category.name_bn : category.name_en) : '';
  const authorName = author ? (language === 'bn' ? author.name_bn : author.name_en) : 'Staff Reporter';
  const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';

  // Format relative time
  const timeAgo = (dateString?: string) => {
    try {
      if (!dateString) return '';
      const parsed = new Date(dateString).getTime();
      if (isNaN(parsed)) return '';
      const diffMs = Date.now() - parsed;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        return language === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
      }
      if (diffHours < 24) {
        return language === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
      }
      const days = Math.floor(diffHours / 24);
      return language === 'bn' ? `${days} দিন আগে` : `${days}d ago`;
    } catch {
      return '';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/news/${article?.slug || ''}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title, text: summary, url }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  if (variant === 'compact') {
    return (
      <article
        onClick={() => onSelect(article.slug)}
        className="group flex items-start gap-3 py-3 border-b border-stone-100 last:border-0 cursor-pointer hover:bg-stone-50/60 p-2 rounded transition-colors"
      >
        <img
          src={article?.featured_image || fallbackImage}
          alt={title}
          className="w-20 h-16 object-cover rounded shrink-0 bg-stone-100"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          {catName && (
            <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
              {catName}
            </span>
          )}
          <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-600">
            <span>{timeAgo(article.published_at)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-stone-600" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article
        onClick={() => onSelect(article.slug)}
        className="group bg-white rounded-lg border border-stone-200 p-4 flex flex-col sm:flex-row gap-4 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="sm:w-1/3 shrink-0 overflow-hidden rounded-md bg-stone-100">
          <img
            src={article.featured_image}
            alt={title}
            className="w-full h-44 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="sm:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                {catName}
              </span>
              <span className="text-xs text-stone-600">{timeAgo(article.published_at)}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 sm:line-clamp-3">
              {summary}
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs text-stone-600">
            <span className="font-medium text-stone-700">{authorName}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                {article.reading_time_minutes} {language === 'bn' ? 'মিনিট' : 'min'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-stone-600" />
                {article.views.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="p-1 hover:text-stone-900 hover:bg-stone-100 rounded"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Grid Variant
  return (
    <article
      onClick={() => onSelect(article.slug)}
      className="group bg-white rounded-lg border border-stone-200 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-stone-100">
        <img
          src={article.featured_image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {article.is_trending && (
          <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {language === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}
          </span>
        )}
        {catName && (
          <span className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold uppercase px-2 py-0.5 rounded">
            {catName}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
            <span>{authorName}</span>
            <span>{timeAgo(article.published_at)}</span>
          </div>
          <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2">
            {summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs text-stone-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-600" />
            {article.reading_time_minutes} {language === 'bn' ? 'মিনিট' : 'min'}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-stone-600" />
              {article.views.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="p-1 hover:text-stone-900 hover:bg-stone-100 rounded"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
