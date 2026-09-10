export type Language = 'bn' | 'en';

export interface CountryEdition {
  id: string;
  name_bn: string;
  name_en: string;
  flag: string;
  currency_label: string;
  currency_rate: string;
  weather_temp_c: number;
  weather_desc_bn: string;
  weather_desc_en: string;
  timezone: string;
  city_bn: string;
  city_en: string;
}

export interface Category {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface Author {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  role_bn: string;
  role_en: string;
  photo: string;
  bio_bn?: string;
  bio_en?: string;
}

export interface Article {
  id: string;
  category_id: string;
  author_id: string;
  featured_image: string;
  image_caption_bn?: string;
  image_caption_en?: string;
  image_credit?: string;
  status: 'published' | 'draft' | 'scheduled';
  is_featured: boolean;
  is_breaking: boolean;
  is_trending: boolean;
  is_sponsored: boolean;
  sponsor_name?: string;
  views: number;
  reading_time_minutes: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[];

  // Bilingual content
  slug: string; // unique URL identifier
  slug_bn?: string;
  slug_en?: string;
  title_bn: string;
  title_en: string;
  summary_bn: string;
  summary_en: string;
  content_bn: string;
  content_en: string;

  // SEO fields
  seo_title_bn: string;
  seo_title_en: string;
  seo_description_bn: string;
  seo_description_en: string;
  focus_keyphrase_bn: string;
  focus_keyphrase_en: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_bn: string;
  title_en: string;
  summary_bn: string;
  summary_en: string;
  content_bn: string;
  content_en: string;
  featured_image: string;
  additional_images?: string[];
  image_caption_bn?: string;
  image_caption_en?: string;
  author_name: string;
  author_role_bn?: string;
  author_role_en?: string;
  author_photo?: string;
  category_name_bn: string;
  category_name_en: string;
  tags: string[];
  reading_time_minutes: number;
  views: number;
  likes: number;
  status: 'published' | 'pending' | 'draft';
  published_at: string;
  created_at: string;
  updated_at?: string;
  is_user_submitted?: boolean;

  // SEO fields
  seo_title_bn?: string;
  seo_title_en?: string;
  seo_description_bn?: string;
  seo_description_en?: string;
}

export interface BreakingNews {
  id: string;
  title_bn: string;
  title_en: string;
  article_slug?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export type AdSlot = 'header_leaderboard' | 'in_article' | 'sidebar' | 'sticky_bottom';

export interface Advertisement {
  id: string;
  title: string;
  slot: AdSlot;
  type: 'custom_banner' | 'adsense_code';
  image_url?: string;
  target_url?: string;
  sponsor_name?: string;
  code_html?: string;
  is_enabled: boolean;
  impressions: number;
  clicks: number;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}
