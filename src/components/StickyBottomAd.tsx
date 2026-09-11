import React, { useState } from 'react';
import { getAdBySlot } from '../utils/storage';
import { X, ExternalLink } from 'lucide-react';
import { recordAdClick, recordAdImpression } from '../utils/storage';
import { DynamicAd } from './DynamicAd';

export const StickyBottomAd: React.FC = () => {
  const [closed, setClosed] = useState(false);
  const ad = getAdBySlot('sticky_bottom');

  if (closed) {
    return null;
  }

  // If ad is disabled in storage and no override, return null
  if (ad && !ad.is_enabled) {
    return null;
  }

  const handleClick = () => {
    if (ad) recordAdClick(ad.id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 text-white shadow-2xl p-2 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {ad && (ad.type === 'adsterra_code' || ad.type === 'adsense_code') ? (
          <div className="w-full flex-1 overflow-hidden pr-2">
            <DynamicAd slot="sticky_bottom" showLabel={false} className="my-0 bg-transparent border-0 p-0" />
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded shrink-0">
              স্পন্সরড
            </span>
            {ad?.image_url && (
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-12 h-9 object-cover rounded hidden sm:inline-block shrink-0"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="truncate">
              <h5 className="text-xs sm:text-sm font-bold truncate text-stone-100">
                {ad?.title || 'বিজ্ঞাপন ও স্পন্সর অফার'}
              </h5>
              {ad?.sponsor_name && (
                <p className="text-[11px] text-stone-400 truncate">{ad.sponsor_name}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {(!ad || ad.type === 'custom_banner') && (
            <a
              href={ad?.target_url || '#'}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
            >
              <span>দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setClosed(true)}
            className="p-1 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
