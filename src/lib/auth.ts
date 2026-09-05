import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

export const supabaseAuth = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30
};

export function setSessionCookies(
  cookies: AstroCookies,
  session: { access_token: string; refresh_token: string }
) {
  cookies.set(ACCESS_COOKIE, session.access_token, cookieOptions);
  cookies.set(REFRESH_COOKIE, session.refresh_token, cookieOptions);
}

export function clearSessionCookies(cookies: AstroCookies) {
  cookies.delete(ACCESS_COOKIE, { path: '/' });
  cookies.delete(REFRESH_COOKIE, { path: '/' });
}

export async function getCurrentUser(cookies: AstroCookies) {
  const accessToken = cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookies.get(REFRESH_COOKIE)?.value;
  if (!accessToken) return null;

  let { data, error } = await supabaseAuth.auth.getUser(accessToken);

  if (error && refreshToken) {
    const { data: refreshed, error: refreshError } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken
    });
    if (refreshError || !refreshed.session || !refreshed.user) {
      clearSessionCookies(cookies);
      return null;
    }
    setSessionCookies(cookies, refreshed.session);
    return refreshed.user;
  }

  if (error || !data.user) return null;
  return data.user;
}
