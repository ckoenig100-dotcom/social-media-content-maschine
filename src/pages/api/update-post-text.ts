import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { id, text, hashtags } = await request.json();

  const { data, error } = await supabase
    .from('content_kalender')
    .update({ text, hashtags })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'Entwurf')
    .select('id');

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!data || data.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'Nur Entwürfe können bearbeitet werden.' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
