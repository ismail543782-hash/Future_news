/**
 * ============================================================================
 * 🎯 ADVERTISEMENT CONFIGURATION / কেন্দ্রীয় বিজ্ঞাপন কনফিগারেশন ফাইল
 * ============================================================================
 * এই ফাইলটি থেকে আপনি পুরো ওয়েবসাইটের সমস্ত বিজ্ঞাপন এক জায়গা থেকেই নিয়ন্ত্রণ করতে পারবেন।
 *
 * 🟢 বর্তমানের জন্য: Adsterra (অ্যাডস্টারার ব্যানার, ইন-আর্টিকেল, সাইডবার ও পপকর্ন অ্যাড কোড)
 * 🔵 ভবিষ্যতের জন্য: Google AdSense এপ্রুভাল পেলে শুধু `activeNetwork: 'adsense'` করে দিন!
 * 🟡 কাস্টম ব্যানার: কোনো নিজস্ব স্পন্সর ব্যানার থাকলে 'custom' নির্বাচন করতে পারেন।
 */

export type AdNetworkType = 'adsterra' | 'adsense' | 'custom';

export interface AdSlotConfig {
  /** বিজ্ঞাপনটি সক্রিয় আছে কি না */
  enabled: boolean;
  /** স্লটের নাম বা পরিচয় */
  label: string;
  /** বিজ্ঞাপনের সাইজ (যেমন: 728x90, 300x250, 300x600, Responsive) */
  sizeHint: string;

  // 1. ADSTERRA কোড অপশন (এখানে অ্যাডস্টারার দেওয়া HTML বা JavaScript কোড পেস্ট করুন)
  adsterraHtml?: string;

  // 2. GOOGLE ADSENSE স্লট অপশন (অ্যাডসেন্স এপ্রুভাল পেলে শুধু data-ad-slot আইডি বসাবেন)
  adSenseSlotId?: string;

  // 3. কাস্টম স্পন্সর ব্যানার অপশন
  customBanner?: {
    imageUrl: string;
    targetUrl: string;
    title: string;
    sponsorName?: string;
  };
}

export interface AdSystemConfig {
  /**
   * মূল অ্যাক্টিভ অ্যাড নেটওয়ার্ক সিলেক্ট করুন:
   * - 'adsterra' : অ্যাডস্টারার অ্যাড প্রদর্শন করবে (বর্তমান রিকমেন্ডেড)
   * - 'adsense'  : গুগল অ্যাডসেন্স বিজ্ঞাপন প্রদর্শন করবে
   * - 'custom'   : নিজস্ব ছবি ও ব্যানার লিঙ্ক প্রদর্শন করবে
   */
  activeNetwork: AdNetworkType;

  /**
   * গুগল অ্যাডসেন্স গ্লোবাল সেটিংস (ভবিষ্যতে অ্যাডসেন্স এপ্রুভাল পেলে এখানে বসাবেন)
   */
  googleAdSense: {
    /** আপনার গুগল অ্যাডসেন্স পাবলিশার আইডি (যেমন: ca-pub-1234567890123456) */
    client: string;
    /** অটো অ্যাডস সক্রিয় করতে চাইলে true দিন */
    autoAdsEnabled: boolean;
  };

  /**
   * অ্যাডস্টারা গ্লোবাল সেটিংস (পপকর্ন / পপআন্ডার / সোশ্যাল বার অ্যাড স্ক্রিপ্ট)
   * যদি আপনি সাইটে পপকর্ন বা ডিরেক্ট সোশ্যাল বার অ্যাড দিতে চান, তবে নিচে কোডটি পেস্ট করুন।
   */
  adsterraGlobal: {
    /** পপকর্ন বা পপআন্ডার স্ক্রিপ্ট কোড (ঐচ্ছিক) */
    popunderScript: string;
    /** সোশ্যাল বার বা ফ্লোটিং উইজেট স্ক্রিপ্ট কোড (ঐচ্ছিক) */
    socialBarScript: string;
  };

  /**
   * ওয়েবসাইটের বিভিন্ন স্থানের স্লট কনফিগারেশন
   */
  slots: {
    /** ১. হোমপেজ ও সাইটের মূল হেডার ব্যানার (728x90 বা রেসপনসিভ) */
    header_leaderboard: AdSlotConfig;

    /** ২. নিউজ ও ব্লগ আর্টিকেলের মাঝখানের বিজ্ঞাপন (300x250 বা Fluid) */
    in_article: AdSlotConfig;

    /** ৩. সাইডবার ব্যানার (300x250 বা 300x600 Half-page) */
    sidebar: AdSlotConfig;

    /** ৪. নিউজ ও ব্লগের নিচে বা কমেন্টের আগের ব্যানার (বটম অ্যাড) */
    bottom_banner: AdSlotConfig;

    /** ৫. মোবাইল স্ক্রিনের নিচে ভাসমান স্টিকি বার */
    sticky_bottom: AdSlotConfig;
  };
}

export const DEFAULT_AD_CONFIG: AdSystemConfig = {
  // 👈 এখানে 'adsterra' অথবা 'adsense' সিলেক্ট করুন
  activeNetwork: 'adsterra',

  // --------------------------------------------------------------------------
  // 🔵 গুগল অ্যাডসেন্স সেটিংস (ভবিষ্যতে এপ্রুভাল পেলে এটি আপডেট করবেন)
  // --------------------------------------------------------------------------
  googleAdSense: {
    client: 'ca-pub-0000000000000000', // আপনার ca-pub আইডি এখানে বসাবেন
    autoAdsEnabled: false,
  },

  // --------------------------------------------------------------------------
  // 🟢 অ্যাডস্টারা গ্লোবাল পপকর্ন / সোশ্যাল বার স্ক্রিপ্ট কোড
  // --------------------------------------------------------------------------
  adsterraGlobal: {
    popunderScript: `<script src="https://pl31276433.profitableratecpmnetwork.com/27/ea/8b/27ea8ba3fd3f5fb1d9bfbb2cb86fb64e.js"></script>`,
    socialBarScript: ``,
  },

  // --------------------------------------------------------------------------
  // 🎯 নির্দিষ্ট স্লটভিত্তিক কোডসমূহ (Adsterra বা Google AdSense)
  // --------------------------------------------------------------------------
  slots: {
    // ১. শীর্ষ হেডার ব্যানার (Leaderboard 728x90)
    header_leaderboard: {
      enabled: true,
      label: 'শীর্ষ হেডার ব্যানার (Header 728x90)',
      sizeHint: '728x90 বা রেস্পনসিভ ব্যানার',
      adsterraHtml: `<script async="async" data-cfasync="false" src="https://pl31276435.profitableratecpmnetwork.com/0c21abd70645ec3de555805c1c040ade/invoke.js"></script>
<div id="container-0c21abd70645ec3de555805c1c040ade"></div>`,
      adSenseSlotId: '1234567890',
    },

    // ২. খবরের ভেতরের ব্যানার (In-Article) - পাঠকের সুবিধার জন্য বন্ধ রাখা হয়েছে
    in_article: {
      enabled: false, // খবরের পড়ার মাঝে কোনো বিরক্তি যাতে না হয় সেজন্য নিষ্ক্রিয়
      label: 'আর্টিকেলের ভেতরের বিজ্ঞাপন (বন্ধ রাখা হয়েছে)',
      sizeHint: '300x250 বা ফ্লুইড ইন-আর্টিকেল',
      adsterraHtml: ``,
      adSenseSlotId: '2345678901',
    },

    // ৩. সাইডবার ব্যানার (Sidebar 300x250 Adsterra) - খবরের পাশে মার্জিত অবস্থান
    sidebar: {
      enabled: true,
      label: 'সাইডবার ব্যানার (Sidebar 300x250 Adsterra)',
      sizeHint: '300x250 কমপ্যাক্ট ব্যানার',
      adsterraHtml: `<script>
  atOptions = {
    'key' : 'df15c15bbb929ea00dcbac992a9419a4',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://www.highrevenueformat.com/df15c15bbb929ea00dcbac992a9419a4/invoke.js"></script>`,
      adSenseSlotId: '3456789012',
    },

    // ৪. নিউজ ও ব্লগের শেষে নিচের ব্যানার (Bottom Native Banner)
    bottom_banner: {
      enabled: true,
      label: 'নিউজ শেষে নিচের ব্যানার (Native Banner Widget)',
      sizeHint: 'রেস্পনসিভ নেটিভ কনটেইনার',
      adsterraHtml: `<script async="async" data-cfasync="false" src="https://pl31276435.profitableratecpmnetwork.com/0c21abd70645ec3de555805c1c040ade/invoke.js"></script>
<div id="container-0c21abd70645ec3de555805c1c040ade"></div>`,
      adSenseSlotId: '4567890123',
    },

    // ৫. মোবাইল স্ক্রিনের নিচে ভাসমান স্টিকি বার (Sticky Footer)
    sticky_bottom: {
      enabled: true,
      label: 'স্টিকি বটম ফ্লোটিং ব্যানার (Sticky Footer)',
      sizeHint: 'রেস্পনসিভ ফ্লোটিং বার',
      adsterraHtml: `<!-- Adsterra Sticky Bottom Banner -->
<div style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; color:#ffffff;">
  <div style="display:flex; align-items:center; gap:8px;">
    <span style="background:#e11d48; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">AD</span>
    <span style="font-size:12px; font-weight:600;">বিশেষ ডিসকাউন্টে প্রিমিয়াম সাবস্ক্রিপশন নিন!</span>
  </div>
  <a href="#" style="background:#ffffff; color:#0f172a; font-size:11px; font-weight:700; padding:4px 10px; border-radius:4px; text-decoration:none;">ভিজিট করুন</a>
</div>`,
      adSenseSlotId: '5678901234',
    },
  },
};
