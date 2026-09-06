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
  is_admin: boolean;
  is_superadmin: boolean;
  trial_ends_at: string | null;
  created_at: string;
}

export const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

export function isTrialActive(profile: Pick<Profile, 'trial_ends_at'> | null): boolean {
  if (!profile?.trial_ends_at) return false;
  return new Date(profile.trial_ends_at).getTime() > Date.now();
}

/** Effektiver Plan unter Berücksichtigung einer laufenden 24h-Testphase. */
export function getEffectivePlan(profile: Pick<Profile, 'plan' | 'trial_ends_at'> | null): 'free' | 'paid' {
  if (!profile) return 'free';
  if (profile.plan === 'paid') return 'paid';
  return isTrialActive(profile) ? 'paid' : 'free';
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

/** Free-Plan-Nutzer dürfen ausschließlich diese Plattformen nutzen — fix, nicht konfigurierbar. */
export const FREE_PLAN_PLATFORMS: Plattform[] = ['LinkedIn', 'Facebook'];

/**
 * Ermittelt die tatsächlich wirksamen Plattform-Einstellungen eines Users.
 * Free-Plan ignoriert jede gespeicherte platform_settings-Zeile und bekommt
 * immer genau FREE_PLAN_PLATFORMS mit den Standardwerten, alles andere inaktiv.
 * Paid-Plan nutzt gespeicherte Werte, fällt sonst auf DEFAULT_PLATFORM_SETTINGS zurück.
 */
export function getEffectiveSettings(
  plan: 'free' | 'paid',
  byPlatform: Partial<Record<Plattform, PlatformSetting>>
): Record<Plattform, { post_count: number; min_length: number; max_length: number; active: boolean }> {
  const result = {} as Record<Plattform, { post_count: number; min_length: number; max_length: number; active: boolean }>;

  for (const platform of PLATFORMS) {
    if (plan === 'paid') {
      const s = byPlatform[platform] ?? DEFAULT_PLATFORM_SETTINGS[platform];
      result[platform] = { post_count: s.post_count, min_length: s.min_length, max_length: s.max_length, active: s.active };
    } else if (FREE_PLAN_PLATFORMS.includes(platform)) {
      const d = DEFAULT_PLATFORM_SETTINGS[platform];
      result[platform] = { post_count: d.post_count, min_length: d.min_length, max_length: d.max_length, active: true };
    } else {
      result[platform] = { post_count: 0, min_length: 1, max_length: 1, active: false };
    }
  }

  return result;
}
