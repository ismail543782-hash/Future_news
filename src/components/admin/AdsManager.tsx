import React, { useState } from 'react';
import { Advertisement, AdSlot } from '../../types/news';
import { getAdvertisements, saveAdvertisement } from '../../utils/storage';
import {
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Code,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { AdBanner } from '../AdBanner';

export const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<Advertisement[]>(getAdvertisements());
  const [selectedSlot, setSelectedSlot] = useState<AdSlot>('header_leaderboard');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentAd = ads.find((a) => a.slot === selectedSlot) || {
    id: `ad-${selectedSlot}`,
    title: 'New Ad',
    slot: selectedSlot,
    type: 'custom_banner',
    image_url: '',
    target_url: '',
    sponsor_name: '',
    code_html: '',
    is_enabled: true,
    impressions: 0,
    clicks: 0,
  };

  // Metrics
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  // Estimated earnings based on standard $1.80 RPM
  const estimatedEarnings = ((totalImpressions / 1000) * 1.85 + totalClicks * 0.12).toFixed(2);

  const handleUpdateCurrentAd = (field: keyof Advertisement, value: any) => {
    const updated = { ...currentAd, [field]: value };
    saveAdvertisement(updated);
    setAds(getAdvertisements());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const slotLabels: Record<AdSlot, { title: string; size: string; desc: string }> = {
    header_leaderboard: {
      title: 'শীর্ষ হেডার ব্যানার (Header Leaderboard)',
      size: '728x90 বা রেস্পনসিভ',
      desc: 'ওয়েবসাইটের লোগো ও মূল ন্যাভিগেশনের ঠিক পাশে প্রদর্শিত হয়। সর্বোচ্চ দৃশ্যমানতা।',
    },
    in_article: {
      title: 'খবরের ভেতরের বিজ্ঞাপন (In-Article Ad)',
      size: '300x250 বা ইন-আর্টিকেল ফ্লুইড',
      desc: 'প্রতিটি খবরের দ্বিতীয় প্যারার ঠিক নিচে প্রদর্শিত হয়। পাঠকদের সবচেয়ে বেশি ক্লিক আসে।',
    },
    sidebar: {
      title: 'সাইডবার ব্যানার (Sidebar Half-Page)',
      size: '300x600 বা 300x250',
      desc: 'ডেস্কটপ স্ক্রিনে খবরের ডানপাশে ফিক্সড ও স্পষ্ট অবস্থানে প্রদর্শিত হয়।',
    },
    sticky_bottom: {
      title: 'স্টিকি বটম ব্যানার (Sticky Footer Bar)',
      size: 'রেস্পনসিভ ফ্লোটিং বার',
      desc: 'স্ক্রিনের নিচে ভাসমান থাকে। মোবাইল পাঠকদের কাছ থেকে উচ্চ আয়ের উৎস।',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Income Metrics */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <DollarSign className="w-4 h-4" />
              <span>ডিজিটাল আয় ও মনিটাইজেশন কন্ট্রোল হাব</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              গুগল অ্যাডসেন্স ও বিজ্ঞাপন ম্যানেজার (AdSense Hub)
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              এখানে গুগল অ্যাডসেন্স স্ক্রিপ্ট কোড অথবা নিজস্ব ক্লায়েন্টের স্পন্সর ব্যানার বসিয়ে আপনার নিউজ পোর্টাল থেকে নিয়মিত আয় নিশ্চিত করুন।
            </p>
          </div>

          {/* Revenue metrics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-700/60 text-center">
            <div className="p-2">
              <span className="text-[11px] text-stone-400 block font-medium">মোট ইম্প্রেশন</span>
              <span className="text-lg font-bold text-white font-mono">
                {totalImpressions.toLocaleString()}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-stone-400 block font-medium">অ্যাড ক্লিক</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {totalClicks.toLocaleString()}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-stone-400 block font-medium">গড় সিটিআর (CTR)</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{avgCtr}%</span>
            </div>
            <div className="p-2">
              <span className="text-[11px] text-stone-400 block font-medium">আনুমানিক আয় (USD)</span>
              <span className="text-lg font-bold text-rose-400 font-mono">${estimatedEarnings}</span>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>বিজ্ঞাপন কনফিগারেশন তাৎক্ষণিকভাবে সংরক্ষিত ও সক্রিয় হয়েছে!</span>
        </div>
      )}

      {/* Main Grid: Slot Selector + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Slot Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 px-1">
            বিজ্ঞাপন স্লট নির্বাচন করুন:
          </h3>
          {(Object.keys(slotLabels) as AdSlot[]).map((slotKey) => {
            const adItem = ads.find((a) => a.slot === slotKey);
            const isSelected = selectedSlot === slotKey;
            const isEnabled = adItem ? adItem.is_enabled : true;

            return (
              <button
                key={slotKey}
                type="button"
                onClick={() => setSelectedSlot(slotKey)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-50/50 border-rose-500 shadow-xs ring-1 ring-rose-500'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-stone-900">
                    {slotLabels[slotKey].title.split('(')[0]}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
                <span className="text-xs font-mono text-stone-600">
                  {slotLabels[slotKey].size}
                </span>
                <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                  {slotLabels[slotKey].desc}
                </p>
              </button>
            );
          })}

          {/* AdSense Verification Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>গুগল অ্যাডসেন্স ads.txt প্রস্তুত</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              আপনার ওয়েবসাইটের রুট ডিরেক্টরিতে <code className="font-mono bg-amber-100 px-1 rounded">/ads.txt</code> ফাইলটি আগে থেকেই যুক্ত রয়েছে। অ্যাডসেন্সে আবেদন করার পর সেখানে শুধু আপনার পাবলিশার আইডি বসিয়ে দিলেই অনুমোদন পাবেন।
            </p>
          </div>
        </div>

        {/* Right: Slot Configuration (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                {slotLabels[selectedSlot].title}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {slotLabels[selectedSlot].desc}
              </p>
            </div>

            {/* Toggle Enable/Disable Slot */}
            <label className="flex items-center gap-2 cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg">
              <input
                type="checkbox"
                checked={currentAd.is_enabled}
                onChange={(e) => handleUpdateCurrentAd('is_enabled', e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="text-xs font-bold text-stone-800">
                {currentAd.is_enabled ? 'এই স্লট চালু আছে' : 'এই স্লট বন্ধ আছে'}
              </span>
            </label>
          </div>

          {/* Ad Format Selector: Custom Banner vs AdSense Code */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              বিজ্ঞাপনের ধরন (Format Type)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateCurrentAd('type', 'adsense_code')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                  currentAd.type === 'adsense_code'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Code className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-stone-900">
                    গুগল অ্যাডসেন্স / কাস্টম স্ক্রিপ্ট কোড
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Google AdSense, Ezoic বা যেকোনো বিজ্ঞাপনের HTML/JS কোড স্নsnippet পেস্ট করুন।
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateCurrentAd('type', 'custom_banner')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                  currentAd.type === 'custom_banner'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-stone-900">
                    কাস্টম ব্যানার বিজ্ঞাপন (ছবি + লিংক)
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    নিজের বিজ্ঞাপন বা কোনো স্পন্সরের ছবির ব্যানার ও টার্গেট ওয়েবসাইটের লিংক দিন।
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Type Specific Fields */}
          {currentAd.type === 'adsense_code' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    গুগল অ্যাডসেন্স কোড (HTML/JavaScript Snippet)
                  </label>
                  <span className="text-[11px] text-stone-600">AdSense &lt;ins&gt; or &lt;script&gt; tag</span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`<!-- Example Google AdSense Code -->\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-0000000000000000"\n     data-ad-slot="1234567890"\n     data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                  value={currentAd.code_html || ''}
                  onChange={(e) => handleUpdateCurrentAd('code_html', e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-stone-900 text-stone-100 rounded-lg border border-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
                <span className="font-bold text-stone-800">পরামর্শ:</span> আপনি গুগল অ্যাডসেন্সে লগইন করে "By ad unit" অপশন থেকে একটি ডিসপ্লে বা ইন-আর্টিকেল অ্যাড তৈরি করবেন এবং প্রাপ্ত কোডটি এখানে পেস্ট করবেন।
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  বিজ্ঞাপনের শিরোনাম / ক্যাম্পেইন নাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: প্রিমিয়াম ক্লাউড হোস্টিং মেগা সেল"
                  value={currentAd.title}
                  onChange={(e) => handleUpdateCurrentAd('title', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    ব্যানার ইমেজের ইউআরএল (Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={currentAd.image_url || ''}
                    onChange={(e) => handleUpdateCurrentAd('image_url', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    টার্গেট লিংক (Destination Web URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://sponsorwebsite.com"
                    value={currentAd.target_url || ''}
                    onChange={(e) => handleUpdateCurrentAd('target_url', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  স্পন্সরের নাম (Sponsor Label)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Google Cloud, Beximco, Pathao..."
                  value={currentAd.sponsor_name || ''}
                  onChange={(e) => handleUpdateCurrentAd('sponsor_name', e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Live Ad Preview Section */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-2 flex items-center justify-between">
              <span>লাইভ প্রিভিউ (পাঠকরা যেভাবে দেখবেন):</span>
              <span className="text-[11px] font-normal text-stone-600">
                ইম্প্রেশন: {currentAd.impressions || 0} • ক্লিক: {currentAd.clicks || 0}
              </span>
            </h4>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <AdBanner slot={selectedSlot} adOverride={currentAd} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
