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

## Auth & Multi-User
- Supabase Auth (E-Mail/Passwort), Session via httpOnly-Cookies (`sb-access-token`/`sb-refresh-token`, siehe `src/lib/auth.ts`)
- Jeder Post gehört einem `user_id` (content_kalender.user_id) — Kalender, Export, Freigeben/Löschen sind pro User isoliert
- Nicht angemeldete Besucher sehen auf der Startseite einen Infotext statt des Formulars: Parametrisierung (Anzahl/Textlänge pro Plattform) und automatisiertes Posting sind bezahlten Plänen vorbehalten
- Free/Paid-Gate ist aktuell ein manuelles Feld `profiles.plan` (`free`/`paid`) — Stripe-Anbindung folgt später, Code ist aber schon darauf vorbereitet
- Free-Plan ist auf **LinkedIn + Facebook** fix eingeschränkt (`FREE_PLAN_PLATFORMS` in `src/lib/supabase.ts`) — `/einstellungen` zeigt Free-Usern nur einen Hinweistext statt der Auswahl, und `getEffectiveSettings()` ignoriert bei `plan = 'free'` jede gespeicherte `platform_settings`-Zeile serverseitig (auch bei einem Downgrade von paid auf free bleiben alte Einstellungen nur "eingefroren", nicht wirksam, bis wieder auf paid gewechselt wird)
- Superadmin-Bereich (`/admin`, `profiles.is_admin`): Nutzerliste mit Plan-Umschalter. Kein Admin ist per Default gesetzt — der erste Admin muss einmalig direkt in der DB markiert werden (`UPDATE profiles SET is_admin = true WHERE email = '...'`), danach kann er weitere über die `/admin`-Oberfläche verwalten (Plan-Umschaltung; `is_admin` selbst ist dort aktuell nicht änderbar)

## Datenbank-Schema (Supabase)

### `content_kalender`
- id: bigint, Primary Key (auto)
- plattform: enum (LinkedIn, Instagram, X, Facebook)
- text: text
- hashtags: text
- status: enum (Entwurf, Freigegeben, Veröffentlicht), Default: Entwurf
- geplant_fuer: date
- kunde: text (für Agentur-Service-Nutzung)
- user_id: uuid → auth.users
- created_at: timestamptz (auto)

### `profiles` (1:1 zu auth.users)
- id: uuid, Primary Key → auth.users
- name, email, phone: text
- avatar_url: text (Supabase Storage Bucket `avatars`, Pfad `{user_id}/avatar.*`)
- plan: text ('free' | 'paid'), Default 'free'
- is_admin: boolean, Default false
- created_at: timestamptz (auto)

### `platform_settings`
- id: bigint, Primary Key (auto)
- user_id: uuid → auth.users
- platform: enum (LinkedIn, Instagram, X, Facebook, TikTok, Pinterest, Threads, YouTube)
- active: boolean, Default true
- post_count, min_length, max_length: int (post_count darf 0 sein)
- unique (user_id, platform)
- Nur für `plan = 'paid'` editierbar (siehe `src/pages/api/settings.ts`); Defaults für free/unset User in `src/lib/supabase.ts` (`DEFAULT_PLATFORM_SETTINGS`) — TikTok/Pinterest/Threads/YouTube sind dort standardmäßig `active: false`
- Bei der Generierung (`/api/generate.ts`) werden nur Plattformen mit `active = true` UND `post_count > 0` an n8n geschickt; sind alle deaktiviert, wird ohne n8n-Aufruf ein 400-Fehler zurückgegeben
- `content_kalender.user_id` und `platform_settings.user_id`/`profiles.id` haben `ON DELETE CASCADE` — löscht man einen `auth.users`-Eintrag, verschwinden Profil, Einstellungen und alle Posts automatisch mit

## Plattform-Anforderungen
Ton/Stil pro Plattform ist fix im n8n-Workflow hinterlegt (Code-Node "Build System Prompt"),
Anzahl Posts und Zeichenlänge kommen dynamisch aus `platform_settings` (bzw. den Defaults):
- LinkedIn: Professionell, Storytelling, Hook im ersten Satz, 3–5 Hashtags
- Instagram: Kurz, emotional, Call-to-Action, 10–15 Hashtags, Emoji-freundlich, Absätze mit Leerzeilen
- X (Twitter): Knapp, Hook in den ersten Worten, 2–3 Hashtags, kontroverse Meinungen funktionieren
- Facebook: Mittellang, Fragen stellen, Community-orientiert, persönlicher Ton

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
- Login/Registrierung (`/login`, `/registrieren`)
- Eingabeformular: Thema, Kontext, Markenstimme, Zielgruppe (nur angemeldet)
- Profil (`/profil`): Bild-Upload, Name, Telefonnummer (E-Mail read-only)
- Einstellungen (`/einstellungen`): Anzahl Posts + Min/Max-Zeichenlänge pro Plattform (nur `plan = 'paid'`)
- Content-Kalender: Wochenansicht mit allen geplanten Posts (nur eigene)
- Monatskalender (`/kalender-monat`): Kalenderraster für freigegebene, datierte Posts
- Status-Filter: Entwurf, Freigegeben, Veröffentlicht
- "Freigeben"-Button pro Post inkl. Datumsauswahl (setzt `geplant_fuer`)
- Löschen (einzeln oder alle Entwürfe/Freigaben); veröffentlichte Posts sind geschützt
- Export als CSV möglich

## Design (Dashboard)
- Clean, internal-tool-Look
- Weißer Hintergrund, dezente Farben
- Fokus auf Lesbarkeit der Post-Texte
- Mobile: Posts als Karten übereinander