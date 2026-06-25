export type UserRole =
  | "system_administrator"
  | "school_administrator"
  | "teacher"
  | "staff"
  | "parent"
  | "student";

export type PublishStatus = "draft" | "published" | "archived";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  status: "active" | "suspended" | "pending";
  phone: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  kind: "image" | "video" | "document";
  mime_type: string | null;
  title: string | null;
  alt: string | null;
  caption: string | null;
  folder: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  school_name: string;
  tagline: string;
  motto: string;
  logo_url: string | null;
  favicon_url: string | null;
  email: string | null;
  phones: string[] | null;
  address: string | null;
  whatsapp: string | null;
  social_links: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  primary_color: string | null;
  data: Record<string, unknown>;
  messaging?: Record<string, any>;
}

export interface PageSection {
  id: string;
  page_slug: string;
  section_key: string;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  media_id: string | null;
  data: Record<string, any>;
  sort_order: number;
  is_published: boolean;
  media?: MediaAsset | null;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  image_id: string | null;
  sort_order: number;
  is_published: boolean;
  image?: MediaAsset | null;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Activity {
  id: string;
  title: string;
  kind: "indoor" | "outdoor";
  description: string | null;
  icon: string | null;
  image_id: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface CoreValue {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface StaffMember {
  id: string;
  full_name: string;
  position: string | null;
  department: string | null;
  bio: string | null;
  photo_id: string | null;
  socials: Record<string, string>;
  is_leadership: boolean;
  sort_order: number;
  is_published: boolean;
  photo?: MediaAsset | null;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  quote: string;
  photo_id: string | null;
  rating: number | null;
  sort_order: number;
  is_published: boolean;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_id: string | null;
  sort_order: number;
  is_published: boolean;
  cover?: MediaAsset | null;
  items?: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  album_id: string | null;
  media_id: string;
  caption: string | null;
  sort_order: number;
  media?: MediaAsset | null;
}

export interface SchoolEvent {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  category: string | null;
  location: string | null;
  start_at: string | null;
  end_at: string | null;
  cover_id: string | null;
  is_featured: boolean;
  status: PublishStatus;
  created_at: string;
  cover?: MediaAsset | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface SiteStat {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  sort_order: number;
}
