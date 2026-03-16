export interface Project {
  id: number;
  slug: string;
  category: string;
  image_url: string;
  location_tg: string; location_ru: string; location_en: string;
  year: number;
  title_tg: string; title_ru: string; title_en: string;
  description_tg: string; description_ru: string; description_en: string;
  is_featured: number;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: number;
  slug: string;
  category_tg: string; category_ru: string; category_en: string;
  image_url: string;
  title_tg: string; title_ru: string; title_en: string;
  description_tg: string; description_ru: string; description_en: string;
  sort_order: number;
  features: ServiceFeature[];
}

export interface ServiceFeature {
  id: number;
  service_id: number;
  feature_tg: string; feature_ru: string; feature_en: string;
  sort_order: number;
}

export interface TeamMember {
  id: number;
  name_tg: string; name_ru: string; name_en: string;
  position_tg: string; position_ru: string; position_en: string;
  photo_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
  page: string;
  sort_order: number;
}

export interface Seminar {
  id: number;
  title_tg: string; title_ru: string; title_en: string;
  description_tg: string; description_ru: string; description_en: string;
  date: string;
  location_tg: string; location_ru: string; location_en: string;
  image_url?: string;
  is_upcoming: number;
}

export interface NewsItem {
  id: number;
  slug: string;
  title_tg: string; title_ru: string; title_en: string;
  body_tg: string; body_ru: string; body_en: string;
  media_type: 'none' | 'image' | 'gallery' | 'youtube' | 'vimeo' | 'video_file';
  cover_image?: string;
  video_url?: string;
  video_embed_url?: string;
  category: string;
  is_published: number;
  published_at?: string;
  images: NewsImage[];
  created_at: string;
}

export interface NewsImage {
  id: number;
  news_id: number;
  url: string;
  caption_tg?: string; caption_ru?: string; caption_en?: string;
  sort_order: number;
}

export interface MapMarker {
  id: number;
  project_id?: number;
  name_tg: string; name_ru: string; name_en: string;
  latitude: number;
  longitude: number;
  marker_type: 'solar' | 'wind' | 'energy' | 'education';
  is_visible: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface Contact extends ContactForm {
  id: number;
  is_read: number;
  created_at: string;
}

export interface Settings {
  phone_primary: string;
  phone_secondary: string;
  email_primary: string;
  email_secondary: string;
  address_tg: string; address_ru: string; address_en: string;
  working_hours_tg: string; working_hours_ru: string; working_hours_en: string;
  telegram_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  hero_stats_projects: string;
  hero_stats_capacity: string;
  hero_stats_families: string;
  [key: string]: string;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  sort_order: number;
  is_visible: number;
}

export interface TimelineItem {
  id: number;
  year: string;
  title_tg: string; title_ru: string; title_en: string;
  desc_tg: string; desc_ru: string; desc_en: string;
  projects_count: string;
  sort_order: number;
}

export interface PageBackground {
  id: number;
  page_key: string;
  page_label: string;
  image_url: string;
  video_url: string;
  overlay_opacity: number;
}

export type Lang = 'tg' | 'ru' | 'en';
