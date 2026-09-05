import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export type Plattform = 'LinkedIn' | 'Instagram' | 'X' | 'Facebook';
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
}
