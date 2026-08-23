-- ============================================
-- SICHERHEIT: Leads waren für jedermann lesbar
-- ============================================
-- Gefunden am 2026-08-23.
--
-- Die Regel „Anyone can read by token" hiess so, prüfte den Token aber nie:
--
--   CREATE POLICY "Anyone can read by token" ON survey_submissions
--     FOR SELECT TO anon USING (true);        -- <- erlaubt ALLES
--
-- RLS sieht den Filter einer Abfrage nicht. `USING (true)` heisst deshalb nicht
-- „darf die eigene Zeile lesen", sondern „darf jede Zeile lesen". Der anon-Key
-- steht per Design im Browser-Bundle, also konnte ihn jeder auslesen und damit
-- sämtliche Leads abrufen: Namen, Telefonnummern und die 24 Antworten zum
-- körperlichen und mentalen Befinden.
--
-- Nachgewiesen mit einem einzigen curl-Aufruf gegen die REST-Schnittstelle.
--
-- Der Ersatz: kein Direktzugriff mehr für anon, sondern eine Funktion, die
-- genau eine Zeile zu genau einem Token zurückgibt. Der Token ist eine UUID und
-- nicht erratbar. Zusätzlich gibt die Funktion die Telefonnummer NICHT heraus —
-- die Ergebnisseite braucht sie nicht, und was nicht ausgeliefert wird, kann
-- nicht abfliessen.
-- ============================================


-- 1. Die zu weite Regel entfernen ------------------------------------------
--
-- Achtung: In der Produktionsdatenbank heisst die Regel NICHT wie in setup.sql.
-- Dort steht „Anyone can read by token", live hiess sie `select_any` — jemand
-- hat sie irgendwann von Hand ersetzt. Beide Namen werden abgeräumt, damit es
-- egal ist, welcher Stand vorliegt.
DROP POLICY IF EXISTS "Anyone can read by token" ON survey_submissions;
DROP POLICY IF EXISTS select_any ON survey_submissions;


-- 2. Gezielter Zugriff über eine Funktion ----------------------------------
--
-- SECURITY DEFINER: läuft mit den Rechten des Eigentümers und umgeht damit RLS
-- kontrolliert — der einzige Weg hinein führt über einen gültigen Token.
-- search_path wird festgenagelt, sonst könnte ein untergeschobener Schema-Pfad
-- die Funktion auf eine andere Tabelle umlenken.

CREATE OR REPLACE FUNCTION get_submission_by_token(p_token TEXT)
RETURNS TABLE (
  name        TEXT,
  language    TEXT,
  answers     JSONB,
  score       INTEGER,
  score_label TEXT,
  strengths   TEXT[],
  focus_area  TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT s.name, s.language, s.answers, s.score, s.score_label,
         s.strengths, s.focus_area, s.created_at
  FROM survey_submissions s
  WHERE s.token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION get_submission_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_submission_by_token(TEXT) TO anon, authenticated;


-- 3. Kontrolle -------------------------------------------------------------
-- Danach muss das hier LEER zurückkommen (vorher lieferte es alle Zeilen):
--
--   curl "$URL/rest/v1/survey_submissions?select=name,phone" \
--        -H "apikey: $ANON" -H "authorization: Bearer $ANON"
--
-- Und das hier weiterhin genau eine Zeile:
--
--   select * from get_submission_by_token('<ein gültiger token>');
