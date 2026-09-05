import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const webhookUrl = import.meta.env.PUBLIC_GENERATE_CONTENT_WEBHOOK_URL;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
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
