import React from 'react';
import { AdSlot, Advertisement } from '../types/news';
import { DynamicAd } from './DynamicAd';

export interface AdBannerProps {
  slot: AdSlot;
  className?: string;
  adOverride?: Advertisement;
  showLabel?: boolean;
}

/**
 * AdBanner Component (Wrapper around DynamicAd)
 * Handles Adsterra, Google AdSense and Custom image banners for all slots.
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  slot,
  className = '',
  adOverride,
  showLabel = true,
}) => {
  return (
    <DynamicAd
      slot={slot}
      className={className}
      adOverride={adOverride}
      showLabel={showLabel}
    />
  );
};
