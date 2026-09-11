import React, { useEffect, useRef, useState } from 'react';
import { AdSlot, Advertisement } from '../types/news';
import { DEFAULT_AD_CONFIG, AdNetworkType, AdSlotConfig } from '../config/adConfig';
import { getAdBySlot, getAdSenseSettings, recordAdClick, recordAdImpression } from '../utils/storage';
import { ExternalLink, Sparkles, HelpCircle } from 'lucide-react';

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
   * ডিফল্টভাবে `src/config/adConfig.ts` এর activeNetwork ব্যবহার করবে।
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

/**
 * 🎯 DynamicAd Component:
 * Adsterra, Google AdSense এবং Custom Image Banners নির্বিঘ্নে যেকোনো জায়গায় দেখানোর প্রধান কম্পোনেন্ট।
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
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [adSenseError, setAdSenseError] = useState(false);

  // ১. স্টোরেজ থেকে ডাটা এবং গ্লোবাল কনফিগারেশন লোড
  const storedAd = adOverride || getAdBySlot(slot);
  const globalAdSense = getAdSenseSettings();
  const slotConfig: AdSlotConfig | undefined = DEFAULT_AD_CONFIG.slots[slot];

  // ২. সক্রিয় নেটওয়ার্ক নির্ধারণ (Props -> Storage -> adConfig.ts)
  const effectiveNetwork: AdNetworkType =
    network ||
    (storedAd?.type === 'adsense_code'
      ? 'adsense'
      : storedAd?.type === 'adsterra_code'
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

  // ৫. ইম্প্রেশন কাউন্ট রেকর্ড
  useEffect(() => {
    if (storedAd && storedAd.is_enabled) {
      recordAdImpression(storedAd.id);
    }
  }, [storedAd?.id, storedAd?.is_enabled]);

  // --------------------------------------------------------------------------
  // 🟢 Adsterra স্ক্রিপ্ট ও HTML এক্সিকিউশন হ্যান্ডলার
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (effectiveNetwork !== 'adsterra' || !rawHtmlCode) return;

    const container = containerRef.current;
    if (!container) return;

    // যদি Adsterra-র `atOptions` বা `invoke.js` থাকে, তবে আইসোলেটেড আইফ্রেমে এক্সিকিউট করা সবচেয়ে নিরাপদ
    const isAtOptionsScript =
      rawHtmlCode.includes('atOptions') ||
      rawHtmlCode.includes('invoke.js') ||
      rawHtmlCode.includes('topcreativeformat.com') ||
      rawHtmlCode.includes('highcpmgate.com');

    if (isAtOptionsScript && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <base target="_blank" />
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
              </style>
            </head>
            <body>
              ${rawHtmlCode}
            </body>
          </html>
        `);
        doc.close();
      }
      return;
    }

    // সাধারণ HTML / Script ট্যাগ নিরাপদে এক্সিকিউট করা
    container.innerHTML = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtmlCode;

    // সাধারণ এলিমেন্ট অ্যাপেন্ড
    const scripts: HTMLScriptElement[] = [];
    Array.from(tempDiv.childNodes).forEach((node) => {
      if (node.nodeName.toLowerCase() === 'script') {
        scripts.push(node as HTMLScriptElement);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });

    // স্ক্রিপ্টসমূহ একে একে এক্সিকিউট করা
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.text = oldScript.text;
      container.appendChild(newScript);
    });

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [effectiveNetwork, rawHtmlCode]);

  // --------------------------------------------------------------------------
  // 🔵 Google AdSense adsbygoogle.push({}) হ্যান্ডলার
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (effectiveNetwork !== 'adsense') return;

    // Load AdSense global script if not already present
    const adsenseScriptId = 'google-adsense-script';
    if (!document.getElementById(adsenseScriptId) && effectivePublisherId) {
      const script = document.createElement('script');
      script.id = adsenseScriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${effectivePublisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Trigger push for the slot safely
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ad blocker or already filled
      setAdSenseError(true);
    }
  }, [effectiveNetwork, effectivePublisherId, effectiveAdSenseSlot]);

  // যদি স্টোরেজে স্লটটি বন্ধ (disabled) থাকে
  if (storedAd && !storedAd.is_enabled) {
    return null;
  }

  // কাস্টম ব্যানারে ক্লিক হ্যান্ডলার
  const handleCustomBannerClick = () => {
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
          <span className="flex items-center gap-1 text-[10px] text-stone-600 font-mono">
            {effectiveNetwork === 'adsterra'
              ? 'Adsterra Network'
              : effectiveNetwork === 'adsense'
              ? 'Google AdSense'
              : 'Direct Sponsor'}
          </span>
        </div>
      )}

      {/* ================================================================== */}
      {/* 🟢 ১. ADSTERRA নেটওয়ার্ক মোড                                     */}
      {/* ================================================================== */}
      {effectiveNetwork === 'adsterra' && (
        <div className="w-full flex justify-center items-center py-1">
          {rawHtmlCode && (rawHtmlCode.includes('atOptions') || rawHtmlCode.includes('invoke.js')) ? (
            <iframe
              ref={iframeRef}
              title={`Adsterra Ad - ${slot}`}
              className="border-0 overflow-hidden"
              style={{
                width: slot === 'sidebar' ? '300px' : '100%',
                maxWidth: '100%',
                minHeight:
                  slot === 'sidebar' ? '250px' : slot === 'bottom_banner' ? '160px' : '90px',
                height:
                  slot === 'sidebar' ? '250px' : slot === 'bottom_banner' ? '160px' : '95px',
              }}
              scrolling="no"
            />
          ) : (
            <div ref={containerRef} className="w-full flex justify-center items-center" />
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* 🔵 ২. GOOGLE ADSENSE নেটওয়ার্ক মোড                                */}
      {/* ================================================================== */}
      {effectiveNetwork === 'adsense' && (
        <div className="w-full flex justify-center py-2 min-h-[90px]">
          {adSenseError ? (
            <div className="w-full p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-center text-xs text-amber-900">
              <span className="font-bold block">Google AdSense প্রস্তুত</span>
              <span className="text-[11px] text-stone-600">
                পাবলিশার আইডি: <code className="font-mono text-amber-800">{effectivePublisherId}</code> | স্লট আইডি: <code className="font-mono text-amber-800">{effectiveAdSenseSlot}</code>
              </span>
            </div>
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
      {effectiveNetwork === 'custom' && storedAd && (
        <a
          href={storedAd.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleCustomBannerClick}
          className="group block relative overflow-hidden rounded-lg transition-transform hover:scale-[1.003]"
        >
          {storedAd.image_url ? (
            <img
              src={storedAd.image_url}
              alt={storedAd.title}
              className="w-full h-auto max-h-[160px] object-cover rounded-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full py-8 bg-stone-900 text-white text-center rounded-lg">
              <span className="text-sm font-bold">{storedAd.title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 text-white">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold drop-shadow">{storedAd.title}</span>
              <span className="flex items-center gap-1 text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-white group-hover:bg-rose-600 transition-colors">
                ভিজিট করুন <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};
