-- ============================================
-- Messung: Besuche zählen + Herkunft am Lead festhalten
-- ============================================
-- Im Supabase-Dashboard ausführen:
--   SQL Editor → New Query → einfügen → Run
--
-- Warum das nötig ist: Ohne diese beiden Dinge zeigt Google Ads nur Klicks und
-- Kosten. Welcher Suchbegriff ein Erstgespräch gebracht hat und welcher nur
-- Geld gekostet hat, bleibt unsichtbar — und Google optimiert dann auf Klicks
-- statt auf Kunden.
--
-- Nichts hier löscht oder verändert Bestehendes. Beide Anweisungen sind
-- wiederholbar; ein zweiter Durchlauf ändert nichts.
-- ============================================


-- 1. Besuche ---------------------------------------------------------------
--
-- Bewusst OHNE Besucher-Kennung: keine IP, kein User-Agent, kein Cookie, kein
-- Fingerabdruck. Damit sind das keine Personendaten, es braucht keinen
-- Einwilligungsbanner, und es kann nichts auslaufen. Der Preis ist, dass sich
-- Besuche zählen lassen, aber keine eindeutigen Besucher — für die Frage
-- „lohnt sich der Klick?" genügt das.
--
-- referrer_host ist bewusst nur der Host, nicht die volle URL: eine vollständige
-- Referrer-URL kann die Suchbegriffe des Besuchers enthalten.

CREATE TABLE IF NOT EXISTS site_visits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  path          TEXT NOT NULL,
  referrer_host TEXT,
  gclid         TEXT,
  utm_source    TEXT,
  utm_campaign  TEXT,
  viewport      TEXT CHECK (viewport IN ('mobile', 'desktop'))
);

-- Fast jede Auswertung fragt „wie viele seit wann" — ohne Index wird das mit
-- wachsender Tabelle spürbar langsam.
CREATE INDEX IF NOT EXISTS site_visits_created_at_idx ON site_visits (created_at DESC);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Nur schreiben, nie lesen: Der anon-Key steckt im Browser-Bundle und ist damit
-- öffentlich. Schreiben ist harmlos (schlimmstenfalls aufgeblähte Zahlen),
-- Lesen wäre es nicht. Ausgewertet wird über das Dashboard oder den
-- service_role-Key.
DROP POLICY IF EXISTS "anon darf Besuche eintragen" ON site_visits;
CREATE POLICY "anon darf Besuche eintragen"
  ON site_visits FOR INSERT TO anon
  WITH CHECK (true);


-- 2. Herkunft am Lead ------------------------------------------------------
--
-- Ohne diese Spalten weiss man zwar, dass jemand den Check ausgefüllt hat, aber
-- nicht, über welche Anzeige er kam. Beide sind NULL-bar: die allermeisten
-- Besucher kommen nicht über eine Anzeige, und das ist kein Fehler.

ALTER TABLE survey_submissions ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE survey_submissions ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE survey_submissions ADD COLUMN IF NOT EXISTS utm_campaign TEXT;


-- 3. Kontrolle -------------------------------------------------------------
-- Nach dem Ausführen sollte das hier drei Zeilen zeigen:
--
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'survey_submissions'
--     AND column_name IN ('gclid', 'utm_source', 'utm_campaign');
--
-- Und die Auswertung, sobald Daten da sind:
--
--   SELECT date_trunc('day', created_at) AS tag,
--          count(*)                       AS besuche,
--          count(gclid)                   AS davon_ueber_anzeige
--   FROM site_visits
--   GROUP BY 1 ORDER BY 1 DESC;
