  # Social-Media-Content-Maschine

## Projektbeschreibung
Aus einem Thema/Artikel automatisch 10+ Social-Media-Posts 
für verschiedene Plattformen generieren. Für Agenturen als 
Service oder für die eigene Nutzung.

## Tech-Stack
- Astro 5 + Tailwind CSS 4 (Dashboard/Eingabeformular)
- n8n (Automatisierung + Claude API)
- Supabase/Postgres (Content-Kalender, Tabelle `content_kalender`)
- Optional: Buffer/Publer API (Auto-Posting)

## Datenbank-Schema (Supabase: `content_kalender`)
- id: bigint, Primary Key (auto)
- plattform: enum (LinkedIn, Instagram, X, Facebook)
- text: text
- hashtags: text
- status: enum (Entwurf, Freigegeben, Veröffentlicht), Default: Entwurf
- geplant_fuer: date
- kunde: text (für Agentur-Service-Nutzung)
- created_at: timestamptz (auto)

## Plattform-Anforderungen
- LinkedIn: Professionell, Storytelling, 1.000–1.500 Zeichen,
  3–5 Hashtags, Hook im ersten Satz
- Instagram: Kurz, emotional, Call-to-Action, 10–15 Hashtags,
  Emoji-freundlich, Absätze mit Leerzeilen
- X (Twitter): Knapp, Hook in den ersten Worten, max 280 Zeichen,
  2–3 Hashtags, kontroverse Meinungen funktionieren
- Facebook: Mittelllang, Fragen stellen, Community-orientiert,
  persönlicher Ton

## Output-Format (JSON pro Post)
{
  "platform": "linkedin",
  "text": "...",
  "hashtags": ["#tag1", "#tag2"],
  "suggested_image": "Beschreibung für Bildgenerierung",
  "best_time": "Dienstag 9:00 oder Donnerstag 17:00",
  "content_type": "thought_leadership"
}

## Dashboard-Features
- Eingabeformular: Thema, Kontext, Markenstimme, Zielgruppe
- Content-Kalender: Wochenansicht mit allen geplanten Posts
- Status-Filter: Entwurf, Freigegeben, Veröffentlicht
- "Freigeben"-Button pro Post (ändert Status)
- Export als CSV möglich

## Design (Dashboard)
- Clean, internal-tool-Look
- Weißer Hintergrund, dezente Farben
- Fokus auf Lesbarkeit der Post-Texte
- Mobile: Posts als Karten übereinander