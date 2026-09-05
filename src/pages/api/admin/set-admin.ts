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

  const { data: caller } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();

  if (!caller?.is_admin) {
    return new Response(JSON.stringify({ success: false, error: 'Kein Admin-Zugriff.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { userId, isAdmin } = await request.json();

  if (userId === user.id) {
    return new Response(JSON.stringify({ success: false, error: 'Du kannst deinen eigenen Admin-Status nicht ändern.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: target } = await supabase.from('profiles').select('is_superadmin').eq('id', userId).single();

  if (target?.is_superadmin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Der Status eines Superadmins kann nicht geändert werden.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabase.from('profiles').update({ is_admin: Boolean(isAdmin) }).eq('id', userId);

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
