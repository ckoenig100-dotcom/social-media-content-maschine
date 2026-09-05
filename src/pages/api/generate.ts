import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase, PLATFORMS, DEFAULT_PLATFORM_SETTINGS, type PlatformSetting } from '../../lib/supabase';

export const prerender = false;

const platformKeyMap: Record<string, string> = {
  LinkedIn: 'linkedin',
  Instagram: 'instagram',
  X: 'x',
  Facebook: 'facebook'
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Bitte melde dich an.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await request.json();
  const webhookUrl = import.meta.env.PUBLIC_GENERATE_CONTENT_WEBHOOK_URL;

  const { data: settingsData } = await supabase.from('platform_settings').select('*').eq('user_id', user.id);
  const settings = (settingsData ?? []) as PlatformSetting[];
  const byPlatform = Object.fromEntries(settings.map((s) => [s.platform, s]));

  const platforms = PLATFORMS.map((platform) => {
    const s = byPlatform[platform] ?? DEFAULT_PLATFORM_SETTINGS[platform];
    return {
      platform: platformKeyMap[platform],
      count: s.post_count,
      minLength: s.min_length,
      maxLength: s.max_length
    };
  });

  const payload = { ...body, platforms, user_id: user.id };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Der Workflow hat eine ungültige Antwort geliefert. Bitte erneut versuchen.'
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
