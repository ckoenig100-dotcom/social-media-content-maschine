import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase, PLATFORMS, getEffectivePlan, type Profile } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (getEffectivePlan(profile as Profile | null) !== 'paid') {
    return new Response(
      JSON.stringify({ success: false, error: 'Das Anpassen der Parameter ist nur im bezahlten Plan möglich.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { settings } = await request.json();

  const rows = PLATFORMS.filter((p) => settings[p]).map((platform) => ({
    user_id: user.id,
    platform,
    active: Boolean(settings[platform].active),
    post_count: Math.max(0, Math.min(10, parseInt(settings[platform].post_count) || 0)),
    min_length: Math.max(1, parseInt(settings[platform].min_length) || 1),
    max_length: Math.max(1, parseInt(settings[platform].max_length) || 1)
  }));

  const { error } = await supabase.from('platform_settings').upsert(rows, { onConflict: 'user_id,platform' });

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
