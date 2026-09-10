import React, { useState, useEffect } from 'react';
import { Article, BlogPost } from '../../types/news';
import { generateDynamicSitemapXml } from '../../utils/seo';
import {
  Globe,
  Search,
  CheckCircle,
  FileCode,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Monitor,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminSeoCenterProps {
  articles: Article[];
  blogs: BlogPost[];
}

export const AdminSeoCenter: React.FC<AdminSeoCenterProps> = ({ articles, blogs }) => {
  const [googleVerificationCode, setGoogleVerificationCode] = useState(() => {
    return localStorage.getItem('future_news_google_verification') || '';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawXml, setShowRawXml] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Handle saving verification code
  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('future_news_google_verification', googleVerificationCode.trim());
    
    // Inject into head
    let meta = document.querySelector('meta[name="google-site-verification"]');
    if (!meta && googleVerificationCode.trim()) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'google-site-verification');
      document.head.appendChild(meta);
    }
    if (meta && googleVerificationCode.trim()) {
      meta.setAttribute('content', googleVerificationCode.trim());
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const xmlContent = generateDynamicSitemapXml(articles, blogs);

  const handleDownloadSitemap = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySitemapUrl = () => {
    const sitemapUrl = `${window.location.origin}/sitemap.xml`;
    navigator.clipboard.writeText(sitemapUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold text-stone-900">
                গুগল সার্চ ও এসইও অটোমেশন সেন্টার (Google Search & SEO)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              গুগল সার্চ ইঞ্জিনে দ্রুত ইনডেক্সিং, সাইটম্যাপ তৈরি, গুগল সার্চ কনসোল ভেরিফিকেশন ও মেটা-ট্যাগ পরিচালনা
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSitemap}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sitemap.xml ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* SEO Checklist Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-xs font-bold">আলাদা URL জেনারেটর</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-emerald-950">{articles.length + blogs.length} URLs</p>
            <p className="text-[11px] text-emerald-700">প্রতিটি সংবাদ ও ব্লগের ইউনিক পার্মালিংক সক্রিয়</p>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-xs font-bold">Google News Schema</span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-black text-blue-950">JSON-LD LD+JSON</p>
            <p className="text-[11px] text-blue-700">NewsArticle এবং BlogPosting স্কিমা ইনজেকশন কার্যকর</p>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-xs font-bold">Robots.txt কনফিগ</span>
              <CheckCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-lg font-black text-rose-950">Active Crawl</p>
            <p className="text-[11px] text-rose-700">Googlebot ও সকল ক্রলারের অ্যাক্সেস অনুমোদিত</p>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-bold">দ্বিভাষিক মেটা-ট্যাগ</span>
              <CheckCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-lg font-black text-amber-950">বাংলা + English</p>
            <p className="text-[11px] text-amber-700">সোশ্যাল কার্ড ও সার্চ মেটা উভয় ভাষায় সমর্থিত</p>
          </div>
        </div>
      </div>

      {/* Google Search Console Verification */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>গুগল সার্চ কনসোল ভেরিফিকেশন মেটা কোড (Google Search Console Verification)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Google Search Console (search.google.com) থেকে আপনার HTML Tag ভেরিফিকেশন কী এখানে পেস্ট করুন।
            </p>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <span>Search Console খুলুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleSaveVerification} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={googleVerificationCode}
              onChange={(e) => setGoogleVerificationCode(e.target.value)}
              placeholder="উদাহরণ: google-site-verification=abc123xyz456... অথবা শুধু ভেরিফিকেশন টোকেন"
              className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              সংরক্ষণ ও মেটা ইনজেক্ট করুন
            </button>
          </div>
          {savedSuccess && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>গুগল সার্চ কনসোল ভেরিফিকেশন কোড সফলভাবে যুক্ত হয়েছে!</span>
            </p>
          )}
        </form>
      </div>

      {/* Google SERP Live Search Preview */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>গুগল সার্চ ফলাফল প্রিভিউ (Live Google SERP Snippet Preview)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              গুগলে আপনার ওয়েবসাইট বা সংবাদ সার্চ করলে যেভাবে উপস্থাপিত হবে:
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                previewMode === 'mobile' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইল প্রিভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                previewMode === 'desktop' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>ডেস্কটপ প্রিভিউ</span>
            </button>
          </div>
        </div>

        {/* Mock Google Result Card */}
        <div className={`p-4 rounded-xl border border-stone-200 bg-white font-sans ${previewMode === 'mobile' ? 'max-w-md' : 'max-w-2xl'}`}>
          <div className="flex items-center gap-2 text-xs text-stone-600 mb-1">
            <div className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
              FN
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-stone-800 text-[11px]">Future News</span>
              <span className="text-[10px] text-stone-500 font-mono">
                {window.location.origin || 'https://futurenews.netlify.app'} › news › bishwa-arthoniti
              </span>
            </div>
          </div>

          <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug">
            {articles[0]?.title_bn || 'Future News - সত্য ও সময়ের প্রতিচ্ছবি | Daily News Portal'}
          </h4>

          <p className="text-xs text-[#4d5156] mt-1.5 leading-relaxed line-clamp-2">
            {articles[0]?.summary_bn || 'দৈনিক ফিউচার নিউজ - দেশ বিদেশের সর্বশেষ ব্রেকিং নিউজ, রাজনীতি, বাণিজ্য, প্রযুক্তি এবং খেলাধুলার নির্ভরযোগ্য খবর।'}
          </p>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
            <span>২ ঘণ্টা আগে</span>
            <span>•</span>
            <span className="text-rose-600 font-medium">Google News Verified</span>
          </div>
        </div>
      </div>

      {/* Dynamic Sitemap XML Inspector */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-600" />
              <span>ডায়নামিক সাইটম্যাপ (Dynamic Sitemap.xml)</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              আপনার সাইটের সব খবর ও ব্লগের লাইভ সাইটম্যাপ XML প্রস্তুত
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySitemapUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-300"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'কপি হয়েছে!' : 'সাইটম্যাপ URL কপি করুন'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRawXml(!showRawXml)}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
            >
              {showRawXml ? 'এক্সএমএল লুকান' : 'কাঁচা XML দেখুন'}
            </button>
          </div>
        </div>

        {showRawXml && (
          <div className="relative">
            <pre className="p-4 bg-stone-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-72 border border-stone-800 leading-relaxed">
              {xmlContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
