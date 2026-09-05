import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!adminProfile?.is_admin) {
    return new Response(JSON.stringify({ success: false, error: 'Kein Admin-Zugriff.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { userId, plan } = await request.json();
  if (!['free', 'paid'].includes(plan)) {
    return new Response(JSON.stringify({ success: false, error: 'Ungültiger Plan.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId);

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
