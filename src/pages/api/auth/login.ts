import type { APIRoute } from 'astro';
import { supabaseAuth, setSessionCookies } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Login fehlgeschlagen.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  setSessionCookies(cookies, data.session);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
