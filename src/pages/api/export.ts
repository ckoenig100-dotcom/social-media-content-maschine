import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

function csvEscape(value: string | null): string {
  if (value === null) return '';
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export const GET: APIRoute = async ({ url }) => {
  const status = url.searchParams.get('status');

  let query = supabase.from('content_kalender').select('*').order('created_at', { ascending: true });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const header = ['ID', 'Plattform', 'Text', 'Hashtags', 'Status', 'Geplant für', 'Kunde'];
  const rows = (data ?? []).map((post) =>
    [
      post.id,
      csvEscape(post.plattform),
      csvEscape(post.text),
      csvEscape(post.hashtags),
      csvEscape(post.status),
      csvEscape(post.geplant_fuer),
      csvEscape(post.kunde)
    ].join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="content-kalender.csv"'
    }
  });
};
