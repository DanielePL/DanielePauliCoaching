-- ============================================
-- Abbrecher nicht mehr verlieren
-- ============================================
-- Bisher wurde erst nach der 24. Frage gespeichert. Wer bei Frage 12 aufhörte,
-- war spurlos weg — der Anzeigenklick war bezahlt, der Kontakt verloren.
--
-- Ab jetzt wird gespeichert, sobald Name und Nummer da sind (Schritt 2), und am
-- Ende dieselbe Zeile vervollständigt. Aus einem Abbruch wird ein Interessent.
-- ============================================


-- 1. Zustand einer Zeile ---------------------------------------------------
--
-- Der bestehende CHECK erlaubt nur ('neu','angeschaut','kontaktiert'). Ein
-- angefangener Check ist keines davon.
ALTER TABLE survey_submissions DROP CONSTRAINT IF EXISTS survey_submissions_status_check;
ALTER TABLE survey_submissions ADD CONSTRAINT survey_submissions_status_check
  CHECK (status IN ('unvollstaendig', 'neu', 'angeschaut', 'kontaktiert'));

-- NULL = angefangen und nie beendet. Bewusst eine eigene Spalte statt nur des
-- Status: der Status wird beim Nachfassen von Hand geändert, der Zeitstempel
-- bleibt eine Tatsache.
ALTER TABLE survey_submissions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Bestandsdaten: alles, was vor dieser Änderung existierte, war vollständig.
UPDATE survey_submissions SET completed_at = created_at WHERE completed_at IS NULL;


-- 2. Schreiben über eine Funktion, nicht direkt ------------------------------
--
-- Warum nicht einfach eine UPDATE-Regel für anon: die müsste `USING (true)`
-- lauten, weil RLS den Filter einer Abfrage nicht sieht — und damit könnte
-- jeder mit dem öffentlichen Key jede fremde Zeile überschreiben. Dieselbe
-- Falle wie beim Lesen (siehe fix-leads-readable.sql).
--
-- Diese Funktion darf nur zwei Dinge: eine Zeile zu einem Token anlegen oder
-- dieselbe Zeile ergänzen. Der Token ist eine UUID und nicht erratbar.
--
-- Eine bereits abgeschlossene Zeile wird NICHT mehr verändert: sonst könnte
-- jemand mit einem abgefangenen Token ein fertiges Ergebnis überschreiben.

CREATE OR REPLACE FUNCTION save_submission(
  p_token        TEXT,
  p_name         TEXT,
  p_phone        TEXT,
  p_language     TEXT DEFAULT 'de',
  p_answers      JSONB DEFAULT '{}'::jsonb,
  p_score        INTEGER DEFAULT 0,
  p_score_label  TEXT DEFAULT '',
  p_strengths    TEXT[] DEFAULT '{}',
  p_focus_area   TEXT DEFAULT '',
  p_complete     BOOLEAN DEFAULT FALSE,
  p_gclid        TEXT DEFAULT NULL,
  p_utm_source   TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO survey_submissions (
    name, phone, language, answers, score, score_label, token, status,
    strengths, focus_area, completed_at, gclid, utm_source, utm_campaign
  ) VALUES (
    p_name, p_phone, p_language, p_answers, p_score, p_score_label, p_token,
    CASE WHEN p_complete THEN 'neu' ELSE 'unvollstaendig' END,
    p_strengths, p_focus_area,
    CASE WHEN p_complete THEN now() ELSE NULL END,
    p_gclid, p_utm_source, p_utm_campaign
  )
  ON CONFLICT (token) DO UPDATE SET
    name        = EXCLUDED.name,
    phone       = EXCLUDED.phone,
    language    = EXCLUDED.language,
    answers     = EXCLUDED.answers,
    score       = EXCLUDED.score,
    score_label = EXCLUDED.score_label,
    strengths   = EXCLUDED.strengths,
    focus_area  = EXCLUDED.focus_area,
    status      = CASE WHEN p_complete THEN 'neu' ELSE survey_submissions.status END,
    completed_at = CASE WHEN p_complete THEN now() ELSE survey_submissions.completed_at END
  -- Nur solange die Zeile noch offen ist. Danach ist sie unantastbar.
  WHERE survey_submissions.completed_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION save_submission FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_submission TO anon, authenticated;


-- 3. Auswertung ------------------------------------------------------------
-- Wie viele brechen ab, und wo:
--
--   SELECT status, count(*) FROM survey_submissions GROUP BY 1;
--
--   SELECT count(*) FILTER (WHERE completed_at IS NOT NULL) AS fertig,
--          count(*) FILTER (WHERE completed_at IS NULL)     AS abgebrochen
--   FROM survey_submissions WHERE created_at > now() - interval '30 days';
