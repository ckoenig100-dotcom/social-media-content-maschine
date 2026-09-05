import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export type Plattform =
  | 'LinkedIn'
  | 'Instagram'
  | 'X'
  | 'Facebook'
  | 'TikTok'
  | 'Pinterest'
  | 'Threads'
  | 'YouTube';
export type Status = 'Entwurf' | 'Freigegeben' | 'Veröffentlicht';

export interface Post {
  id: number;
  plattform: Plattform;
  text: string;
  hashtags: string | null;
  status: Status;
  geplant_fuer: string | null;
  kunde: string | null;
  created_at: string;
  user_id: string | null;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  plan: 'free' | 'paid';
  created_at: string;
}

export interface PlatformSetting {
  id: number;
  user_id: string;
  platform: Plattform;
  post_count: number;
  min_length: number;
  max_length: number;
  active: boolean;
}

export const PLATFORMS: Plattform[] = [
  'LinkedIn',
  'Instagram',
  'X',
  'Facebook',
  'TikTok',
  'Pinterest',
  'Threads',
  'YouTube'
];

export const DEFAULT_PLATFORM_SETTINGS: Record<
  Plattform,
  { post_count: number; min_length: number; max_length: number; active: boolean }
> = {
  LinkedIn: { post_count: 3, min_length: 1000, max_length: 1500, active: true },
  Instagram: { post_count: 3, min_length: 150, max_length: 400, active: true },
  X: { post_count: 2, min_length: 100, max_length: 280, active: true },
  Facebook: { post_count: 2, min_length: 300, max_length: 800, active: true },
  TikTok: { post_count: 2, min_length: 50, max_length: 150, active: false },
  Pinterest: { post_count: 2, min_length: 100, max_length: 300, active: false },
  Threads: { post_count: 2, min_length: 100, max_length: 300, active: false },
  YouTube: { post_count: 1, min_length: 300, max_length: 1000, active: false }
};
