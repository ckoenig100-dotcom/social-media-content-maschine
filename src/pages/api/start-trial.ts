import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase, isTrialActive, TRIAL_DURATION_MS, type Profile } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = profileData as Profile | null;

  if (profile?.plan === 'paid') {
    return new Response(
      JSON.stringify({ success: false, error: 'Du hast bereits einen bezahlten Plan.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (isTrialActive(profile)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Es läuft bereits eine Testphase.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

  const { error } = await supabase.from('profiles').update({ trial_ends_at: trialEndsAt }).eq('id', user.id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, trialEndsAt }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
