import React, { useEffect, useRef } from 'react';
import { AdSlot, Advertisement } from '../types/news';
import { getAdBySlot, recordAdClick, recordAdImpression } from '../utils/storage';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
  adOverride?: Advertisement;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, className = '', adOverride }) => {
  const ad = adOverride || getAdBySlot(slot);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ad && ad.is_enabled) {
      recordAdImpression(ad.id);
    }
  }, [ad?.id, ad?.is_enabled]);

  // Execute embedded script tags if adsense code is provided
  useEffect(() => {
    if (ad && ad.type === 'adsense_code' && ad.code_html && containerRef.current) {
      const container = containerRef.current;
      container.innerHTML = ad.code_html;
      const scripts = container.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const s = document.createElement('script');
        s.text = scripts[i].text;
        if (scripts[i].src) s.src = scripts[i].src;
        document.body.appendChild(s);
      }
    }
  }, [ad?.type, ad?.code_html]);

  if (!ad || !ad.is_enabled) {
    return null;
  }

  const handleClick = () => {
    recordAdClick(ad.id);
  };

  return (
    <div
      id={`ad-container-${slot}`}
      className={`relative w-full my-4 overflow-hidden rounded-lg bg-stone-100/90 border border-stone-200/80 p-2.5 transition-all ${className}`}
    >
      <div className="flex items-center justify-between pb-1.5 px-1 border-b border-stone-200/60 text-[10px] uppercase font-semibold text-stone-600 tracking-wider">
        <span>বিজ্ঞাপন / ADVERTISEMENT</span>
        {ad.sponsor_name && (
          <span className="flex items-center gap-1 font-medium lowercase italic text-stone-600">
            sponsor: {ad.sponsor_name}
          </span>
        )}
      </div>

      {ad.type === 'adsense_code' ? (
        <div ref={containerRef} className="w-full flex justify-center py-2" />
      ) : (
        <a
          href={ad.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="group block relative overflow-hidden rounded mt-1.5 transition-transform hover:scale-[1.005]"
        >
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-auto max-h-[140px] object-cover rounded"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 text-white">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold drop-shadow">{ad.title}</span>
              <span className="flex items-center gap-1 text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white group-hover:bg-rose-600 transition-colors">
                ভিজিট করুন <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </a>
      )}
    </div>
  );
};
