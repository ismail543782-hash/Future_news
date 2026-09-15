import React, { useEffect, useRef, useState } from 'react';
import { AdSlot, Advertisement } from '../types/news';
import { DEFAULT_AD_CONFIG, AdNetworkType, AdSlotConfig } from '../config/adConfig';
import { getAdBySlot, getAdSenseSettings, recordAdClick, recordAdImpression } from '../utils/storage';
import { ExternalLink, Sparkles, ShieldCheck, Info } from 'lucide-react';

export interface DynamicAdProps {
  /**
   * বিজ্ঞাপনের অবস্থান বা স্লট নাম:
   * - 'header_leaderboard' : হোমপেজ ও সাইটের মূল হেডার ব্যানার (728x90 / responsive)
   * - 'in_article'         : খবরের মাঝের ব্যানার (300x250 / fluid)
   * - 'sidebar'            : সাইডবার ব্যানার (300x250 / 300x600)
   * - 'bottom_banner'      : আর্টিকেল বা ব্লগের নিচের ব্যানার (728x90 / responsive)
   * - 'sticky_bottom'      : স্ক্রিনের নিচে ফিক্সড ভাসমান ব্যানার
   */
  slot: AdSlot;

  /**
   * ঐচ্ছিক: নির্দিষ্ট অ্যাড নেটওয়ার্ক ফোর্স করতে পারেন ('adsterra' | 'adsense' | 'custom')
   */
  network?: AdNetworkType;

  /**
   * সরাসরি কোনো কাস্টম Adsterra HTML/JS কোড পাঠাতে চাইলে
   */
  customHtml?: string;

  /**
   * গুগল অ্যাডসেন্স স্লট আইডি (যেমন: "1234567890")
   */
  adSenseSlotId?: string;

  /**
   * অতিরিক্ত CSS ক্লাস
   */
  className?: string;

  /**
   * "বিজ্ঞাপন / ADVERTISEMENT" লেবেল প্রদর্শন করবে কি না (ডিফল্ট: true)
   */
  showLabel?: boolean;

  /**
   * সরাসরি কোনো ডাটাবেজ Advertisement অবজেক্ট ওভাররাইড
   */
  adOverride?: Advertisement;
}

// ডিফল্ট ব্যাকআপ স্পন্সর ব্যানারসমূহ (যদি অ্যাডব্লকার সক্রিয় থাকে বা অ্যাড কোড এখনো লোড না হয়ে থাকে)
const DEFAULT_FALLBACKS: Record<
  AdSlot,
  {
    title: string;
    sponsorName: string;
    imageUrl: string;
    targetUrl: string;
    badge: string;
    description: string;
  }
> = {
  header_leaderboard: {
    title: 'গুগল ক্লাউড প্ল্যাটফর্ম — আধুনিক ক্লাউড সলিউশন ও হোস্টিং মেগা অফার',
    sponsorName: 'Google Cloud Partner',
    imageUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80',
    targetUrl: 'https://cloud.google.com',
    badge: 'ক্লাউড স্পন্সর',
    description: 'আল্ট্রা-ফাস্ট হোস্টিং ও এন্টারপ্রাইজ ক্লাউড ডাটাবেজ সার্ভিস',
  },
  in_article: {
    title: 'বিশ্বসেরা প্রযুক্তি ও স্কিল ডেভেলপমেন্ট কোর্স — ৫০% বিশেষ ছাড়',
    sponsorName: 'Global EduTech Platform',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    targetUrl: 'https://www.coursera.org',
    badge: 'এডুকেশন পার্টনার',
    description: 'প্রোগ্রামিং, কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল স্কিলের আন্তর্জাতিক সার্টিফিকেশন',
  },
  sidebar: {
    title: 'ফিউচার টেক ইনোভেশন সামিট ২০২৬ — আর্লি বার্ড রেজিস্ট্রেশন',
    sponsorName: 'TechCrunch Innovations',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    targetUrl: 'https://techcrunch.com',
    badge: 'টেক সামিট',
    description: 'এআই ও প্রযুক্তি স্টার্টআপদের জন্য এশিয়ার বৃহত্তম সম্মেলন',
  },
  bottom_banner: {
    title: 'আল্টিমেট সাইবার সিকিউরিটি ও এনক্রিপ্টেড ভিপিএন প্রোটেকশন',
    sponsorName: 'CyberShield VPN',
    imageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
    targetUrl: 'https://nordvpn.com',
    badge: 'সিকিউরিটি স্পন্সর',
    description: 'আপনার অনলাইন ব্রাউজিং ও গোপনীয়তা রাখুন সম্পূর্ণ সুরক্ষিত',
  },
  sticky_bottom: {
    title: 'ফিউচার নিউজ ডিজিটাল প্রিমিয়াম মেম্বারশিপ অফার',
    sponsorName: 'Future News Premium',
    imageUrl:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80',
    targetUrl: 'https://google.com',
    badge: 'প্রিমিয়াম ডিল',
    description: 'বিজ্ঞাপনমুক্ত দ্রুততম ডিজিটাল নিউজ পাঠ অভিজ্ঞতা',
  },
};

/**
 * 🎯 DynamicAd Component:
 * Adsterra, Google AdSense এবং Custom Image Banners নির্বিঘ্নে যেকোনো জায়গায় দেখানোর প্রধান কম্পোনেন্ট।
 * কখনো কোনো ফাঁকা সাদা স্পেস থাকে না; ক্লিকে সবসময় কাঙ্ক্ষিত সাইট ওপেন হয়।
 */
export const DynamicAd: React.FC<DynamicAdProps> = ({
  slot,
  network,
  customHtml,
  adSenseSlotId,
  className = '',
  showLabel = true,
  adOverride,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [adSenseError, setAdSenseError] = useState(false);
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [adScriptLoaded, setAdScriptLoaded] = useState(false);

  // ১. স্টোরেজ থেকে ডাটা এবং গ্লোবাল কনফিগারেশন লোড
  const storedAd = adOverride || getAdBySlot(slot);
  const globalAdSense = getAdSenseSettings();
  const slotConfig: AdSlotConfig | undefined = DEFAULT_AD_CONFIG.slots[slot];
  const fallback = DEFAULT_FALLBACKS[slot] || DEFAULT_FALLBACKS.header_leaderboard;

  // ২. সক্রিয় নেটওয়ার্ক নির্ধারণ (Props -> Storage -> adConfig.ts)
  const effectiveNetwork: AdNetworkType =
    network ||
    (storedAd?.type === 'adsense_code'
      ? 'adsense'
      : storedAd?.type === 'custom_banner'
      ? 'custom'
      : storedAd?.type === 'adsterra_code'
      ? 'adsterra'
      : storedAd?.image_url
      ? 'custom'
      : storedAd?.code_html
      ? 'adsterra'
      : DEFAULT_AD_CONFIG.activeNetwork);

  // ৩. HTML কোড সংগ্রহ (Props -> Storage -> adConfig.ts)
  const rawHtmlCode =
    customHtml ||
    storedAd?.code_html ||
    (effectiveNetwork === 'adsterra' ? slotConfig?.adsterraHtml : undefined) ||
    '';

  // ৪. গুগল অ্যাডসেন্স পাবলিশার ও স্লট আইডি
  const effectivePublisherId = globalAdSense.publisherId || DEFAULT_AD_CONFIG.googleAdSense.client;
  const effectiveAdSenseSlot =
    adSenseSlotId ||
    slotConfig?.adSenseSlotId ||
    (storedAd && storedAd.type === 'adsense_code' ? storedAd.id : '1234567890');

  // ৫. টার্গেট URL এবং ইমেজ URL নির্ণয়
  const effectiveTargetUrl = storedAd?.target_url || fallback.targetUrl;
  const effectiveImageUrl = storedAd?.image_url || fallback.imageUrl;
  const effectiveTitle = storedAd?.title || fallback.title;
  const effectiveSponsorName = storedAd?.sponsor_name || fallback.sponsorName;

  // ৬. ইম্প্রেশন কাউন্ট রেকর্ড
  useEffect(() => {
    if (storedAd && storedAd.is_enabled) {
      recordAdImpression(storedAd.id);
    }
  }, [storedAd?.id, storedAd?.is_enabled]);

  // ৭. ব্রাউজারের অ্যাডব্লকার বা স্ক্রিপ্ট ব্লক পরীক্ষা
  useEffect(() => {
    const testAdScript = async () => {
      try {
        // Simple test request to detect if external ad scripts are blocked by client
        const url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => null);
        if (!res) {
          setIsAdBlockerActive(true);
        }
      } catch {
        setIsAdBlockerActive(true);
      }
    };
    testAdScript();
  }, []);

  // --------------------------------------------------------------------------
  // 🟢 Adsterra স্ক্রিপ্ট ও HTML এক্সিকিউশন হ্যান্ডলার (আইসোলেটেড আইফ্রেমে)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (effectiveNetwork !== 'adsterra' || !rawHtmlCode) return;

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <base target="_blank" />
                <script>
                  window.onerror = function() { return true; };
                  window.addEventListener('error', function(e) {
                    if (e) {
                      e.preventDefault && e.preventDefault();
                      e.stopPropagation && e.stopPropagation();
                    }
                    return true;
                  }, true);
                </script>
                <style>
                  body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; }
                </style>
              </head>
              <body>
                ${rawHtmlCode}
                <script>
                  try {
                    window.addEventListener('load', function() {
                      try {
                        window.parent.postMessage({ type: 'ADSTERRA_LOADED', slot: '${slot}' }, '*');
                      } catch(e) {}
                    });
                  } catch(e) {}
                </script>
              </body>
            </html>
          `);
          doc.close();
          setAdScriptLoaded(true);
        }
      } catch {
        setAdScriptLoaded(false);
      }
    }
  }, [effectiveNetwork, rawHtmlCode, slot]);

  // --------------------------------------------------------------------------
  // 🔵 Google AdSense adsbygoogle.push({}) হ্যান্ডলার
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (effectiveNetwork !== 'adsense') return;

    const adsenseScriptId = 'google-adsense-script';
    if (!document.getElementById(adsenseScriptId) && effectivePublisherId) {
      const script = document.createElement('script');
      script.id = adsenseScriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${effectivePublisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = () => {
        setAdSenseError(true);
      };
      document.head.appendChild(script);
    }

    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      setAdSenseError(true);
    }
  }, [effectiveNetwork, effectivePublisherId, effectiveAdSenseSlot]);

  // Priority check: Database / Admin configuration takes precedence
  if (storedAd && !storedAd.is_enabled && !adOverride) {
    return null;
  }
  if (!storedAd && slotConfig && !slotConfig.enabled && !adOverride) {
    return null;
  }

  // রেকর্ড অ্যাড ক্লিক ইন স্টোরেজ
  const handleAdClick = () => {
    if (storedAd) {
      recordAdClick(storedAd.id);
    }
  };

  return (
    <div
      id={`dynamic-ad-${slot}`}
      className={`relative w-full my-4 overflow-hidden rounded-xl bg-stone-100/90 border border-stone-200/80 p-3 transition-all ${className}`}
    >
      {/* Top Header Label */}
      {showLabel && (
        <div className="flex items-center justify-between pb-2 mb-2 px-1 border-b border-stone-200/70 text-[10px] uppercase font-bold text-stone-600 tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            বিজ্ঞাপন / ADVERTISEMENT
          </span>
          <div className="flex items-center gap-2">
            {isAdBlockerActive && (
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[9px] text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium"
                title="ব্রাউজারে অ্যাডব্লকার সক্রিয় থাকলে ব্যাকআপ স্পন্সর বিজ্ঞাপনটি প্রদর্শিত হয় যাতে স্ক্রিন সাদা না থাকে।"
              >
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>স্পন্সর ব্যাকআপ সক্রিয়</span>
              </span>
            )}
            <span className="text-[10px] text-stone-600 font-mono font-bold">
              {effectiveNetwork === 'adsterra'
                ? 'Adsterra Network'
                : effectiveNetwork === 'adsense'
                ? 'Google AdSense'
                : 'Direct Sponsor'}
            </span>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 🟢 ১. ADSTERRA নেটওয়ার্ক মোড                                     */}
      {/* ================================================================== */}
      {effectiveNetwork === 'adsterra' && (
        <div className="w-full flex flex-col items-center justify-center">
          {/* অ্যাড কোড সম্পূর্ণভাবে আইসোলেটেড আইফ্রেমে চালান */}
          {rawHtmlCode ? (
            <div className="w-full flex justify-center items-center py-1">
              <iframe
                ref={iframeRef}
                title={`Adsterra Ad - ${slot}`}
                className="border-0 overflow-hidden bg-transparent"
                style={{
                  width: slot === 'sidebar' ? '300px' : '100%',
                  maxWidth: '100%',
                  minHeight:
                    slot === 'sidebar' ? '250px' : slot === 'bottom_banner' ? '120px' : '90px',
                  height:
                    slot === 'sidebar' ? '250px' : slot === 'bottom_banner' ? '120px' : '95px',
                }}
                scrolling="no"
              />
            </div>
          ) : null}

          {/* ব্যাকআপ স্পন্সর ব্যানার (অ্যাডস্টারার কোডটি ব্লকার দ্বারা বাধা পেলে বা কোনো কারণে সাদা দেখালে যেন গ্রাহক ফাঁকা না দেখে) */}
          <a
            href={effectiveTargetUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="w-full group block relative overflow-hidden rounded-lg bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-3 sm:p-4 mt-2 transition-all hover:shadow-md border border-stone-700/60 no-underline"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {effectiveImageUrl && (
                  <img
                    src={effectiveImageUrl}
                    alt={effectiveTitle}
                    className="w-14 h-12 sm:w-16 sm:h-14 object-cover rounded-md shrink-0 border border-stone-700"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-rose-600 text-white px-1.5 py-0.2 rounded">
                      {fallback.badge}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {effectiveSponsorName}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-rose-400 transition-colors line-clamp-1">
                    {effectiveTitle}
                  </h4>
                  <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5 hidden sm:block">
                    {fallback.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <span className="flex items-center gap-1 text-xs bg-rose-600 group-hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0">
                  <span>ভিজিট করুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </a>
        </div>
      )}

      {/* ================================================================== */}
      {/* 🔵 ২. GOOGLE ADSENSE নেটওয়ার্ক মোড                                */}
      {/* ================================================================== */}
      {effectiveNetwork === 'adsense' && (
        <div className="w-full flex flex-col justify-center py-1">
          {adSenseError || isAdBlockerActive ? (
            <a
              href={effectiveTargetUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleAdClick}
              className="w-full group block relative overflow-hidden rounded-lg bg-stone-900 text-white p-4 border border-stone-800 no-underline"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400">
                    গুগল অ্যাডসেন্স পার্টনার
                  </span>
                  <h4 className="text-sm font-bold text-stone-100 mt-1">{effectiveTitle}</h4>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    পাবলিশার: {effectivePublisherId}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs bg-rose-600 px-3 py-1.5 rounded text-white font-bold shrink-0">
                  <span>দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ) : (
            <ins
              className="adsbygoogle"
              style={{ display: 'block', textAlign: 'center' }}
              data-ad-client={effectivePublisherId}
              data-ad-slot={effectiveAdSenseSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* 🟡 ৩. কাস্টম ইমেজ ও লিংক স্পন্সর ব্যানার                            */}
      {/* ================================================================== */}
      {effectiveNetwork === 'custom' && (
        <a
          href={effectiveTargetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="group block relative overflow-hidden rounded-lg transition-transform hover:scale-[1.003] no-underline"
        >
          {effectiveImageUrl ? (
            <div className="relative">
              <img
                src={effectiveImageUrl}
                alt={effectiveTitle}
                className="w-full h-auto max-h-[160px] object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3 sm:p-4 text-white">
                <div className="flex items-center justify-between w-full">
                  <div className="max-w-[75%]">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded inline-block mb-1">
                      {effectiveSponsorName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white drop-shadow line-clamp-1">
                      {effectiveTitle}
                    </h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs bg-white text-stone-900 group-hover:bg-rose-600 group-hover:text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors shrink-0">
                    <span>ভিজিট করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white text-center rounded-lg hover:from-rose-950 hover:to-stone-900 transition-all">
              <span className="text-sm font-bold block">{effectiveTitle}</span>
              {effectiveSponsorName && (
                <span className="text-xs text-stone-400 mt-1 block">
                  স্পন্সর: {effectiveSponsorName}
                </span>
              )}
            </div>
          )}
        </a>
      )}
    </div>
  );
};
