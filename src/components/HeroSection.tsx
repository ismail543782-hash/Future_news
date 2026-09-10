import React from 'react';
import { Article, Category, Author, Language } from '../types/news';
import { Clock, Eye, Sparkles, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  leadArticle: Article;
  subArticles: Article[];
  categories: Category[];
  authors: Author[];
  language: Language;
  onSelectArticle: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  leadArticle,
  subArticles,
  categories,
  authors,
  language,
  onSelectArticle,
}) => {
  const leadCat = categories.find((c) => c.id === leadArticle.category_id);
  const leadAuthor = authors.find((a) => a.id === leadArticle.author_id);

  const leadTitle = language === 'bn' ? leadArticle.title_bn : leadArticle.title_en;
  const leadSummary = language === 'bn' ? leadArticle.summary_bn : leadArticle.summary_en;
  const leadCatName = leadCat ? (language === 'bn' ? leadCat.name_bn : leadCat.name_en) : '';
  const leadAuthorName = leadAuthor ? (language === 'bn' ? leadAuthor.name_bn : leadAuthor.name_en) : '';

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story (8 cols) */}
        <div
          onClick={() => onSelectArticle(leadArticle.slug)}
          className="lg:col-span-8 group relative bg-stone-900 rounded-2xl overflow-hidden cursor-pointer shadow-md flex flex-col justify-end min-h-[400px] sm:min-h-[480px]"
        >
          <img
            src={leadArticle.featured_image}
            alt={leadTitle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-85"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

          {/* Lead Content Box */}
          <div className="relative p-6 sm:p-8 text-white z-10">
            <div className="flex items-center gap-2 mb-3">
              {leadCatName && (
                <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-xs">
                  {leadCatName}
                </span>
              )}
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {language === 'bn' ? 'শীর্ষ খবর' : 'Lead Story'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight group-hover:text-rose-200 transition-colors">
              {leadTitle}
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm md:text-base mt-3 line-clamp-2 max-w-3xl leading-relaxed">
              {leadSummary}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-white/15 text-xs text-stone-300">
              {leadAuthorName && <span className="font-semibold text-white">{leadAuthorName}</span>}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {leadArticle.reading_time_minutes} {language === 'bn' ? 'মিনিট পাঠ' : 'min read'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                {leadArticle.views.toLocaleString()} {language === 'bn' ? 'বার পঠিত' : 'reads'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub Stories Grid (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-stone-900">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            <h3 className="font-black text-sm uppercase tracking-wider text-stone-900">
              {language === 'bn' ? 'গুরুত্বপূর্ণ বিশ্লেষণ' : 'Critical Focus'}
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3">
            {subArticles.slice(0, 3).map((art) => {
              const cat = categories.find((c) => c.id === art.category_id);
              const title = language === 'bn' ? art.title_bn : art.title_en;
              const catName = cat ? (language === 'bn' ? cat.name_bn : cat.name_en) : '';

              return (
                <div
                  key={art.id}
                  onClick={() => onSelectArticle(art.slug)}
                  className="group bg-white p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 cursor-pointer hover:shadow-xs transition-all flex gap-3 items-center"
                >
                  <img
                    src={art.featured_image}
                    alt={title}
                    className="w-24 h-20 object-cover rounded-lg shrink-0 bg-stone-100 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider block mb-1">
                      {catName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600">
                      <span>{art.reading_time_minutes}m</span>
                      <span>•</span>
                      <span>{art.views.toLocaleString()} reads</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
