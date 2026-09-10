import React from 'react';
import { Category, Language } from '../types/news';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Lock } from 'lucide-react';

interface FooterProps {
  categories: Category[];
  language: Language;
  onSelectCategory: (id: string | null) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onOpenBlogHub?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  language,
  onSelectCategory,
  onOpenAdmin,
  isAdmin,
  onOpenBlogHub,
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          {/* Col 1: Masthead Info */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                FUTURE<span className="text-rose-500 font-serif">NEWS</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              {language === 'bn'
                ? 'নির্ভরযোগ্য ও সত্যায়িত তথ্যের ভিত্তিতে দেশের শীর্ষস্থানীয় ডিজিটাল সংবাদমাধ্যম। বস্তুনিষ্ঠ বিশ্লেষণ ও দায়িত্বশীল সাংবাদিকতায় আমরা অঙ্গীকারাবদ্ধ।'
                : 'Pioneering independent bilingual journalism with rigorous fact-checking, global reporting, and deep contextual analysis.'}
            </p>

            <div className="mt-4 text-xs text-stone-400 space-y-1">
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {language === 'bn'
                    ? 'প্রধান সম্পাদক ও প্রকাশক: ইসমাইল হোসেন'
                    : 'Publisher & Editor: Ismail Hossain'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>মিডিয়া সেন্টার, ঢাকা, বাংলাদেশ</span>
              </p>
            </div>
          </div>

          {/* Col 2: Categories Links */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {language === 'bn' ? 'বিভাগসমূহ' : 'Categories'}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs text-stone-400">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(c.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {language === 'bn' ? c.name_bn : c.name_en}
                  </button>
                </li>
              ))}
              {onOpenBlogHub && (
                <li className="col-span-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBlogHub();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>★ {language === 'bn' ? 'ব্লগ ও মুক্তমত হাব' : 'Blog & Opinion Hub'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Editorial Policies & AdSense Notice */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {language === 'bn' ? 'নীতিমালা ও বিজ্ঞাপন' : 'Editorial & Ads Policy'}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              {language === 'bn'
                ? 'এই পোর্টালের সকল খবর কপিরাইট আইনের আওতায় সুরক্ষিত। আমরা গুগল অ্যাডসেন্স ও প্রাসঙ্গিক ডিজিটাল বিজ্ঞাপনের মাধ্যমে অর্থায়িত।'
                : 'All news content is protected under global journalistic copyright. Our operations are sustained through verified digital advertising.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-stone-400">
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">Google AdSense ads.txt</span>
            </div>
          </div>

          {/* Col 4: Admin Portal Link */}
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {language === 'bn' ? 'সম্পাদকীয় প্রশাসন' : 'Editorial Desk'}
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              {language === 'bn'
                ? 'সংবাদ প্রকাশ, বিজ্ঞাপন নিয়ন্ত্রণ ও রিয়েল-টাইম অ্যানালিটিক্স অ্যাক্সেস করতে এডমিন প্যানেলে যান।'
                : 'Restricted administrative portal for publishing, Google AdSense management and real-time readership metrics.'}
            </p>
            <button
              type="button"
              id="footer-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded bg-stone-800 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isAdmin
                  ? language === 'bn'
                    ? 'এডমিন ড্যাশবোর্ড খুলুন'
                    : 'Open Admin Dashboard'
                  : language === 'bn'
                    ? 'এডমিন প্রবেশদ্বার (লগইন)'
                    : 'Admin Secure Gateway'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Copyright & Netlify badge */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Future News Inc. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Netlify Production Ready</span>
            <span>•</span>
            <span>Bilingual Dynamic SEO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
