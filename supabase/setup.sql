-- ============================================
-- Supabase Setup: Survey Submissions
-- ============================================
-- Führe dieses SQL im Supabase Dashboard aus:
-- SQL Editor → New Query → Einfügen → Run
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS survey_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  score_label TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'neu' CHECK (status IN ('neu', 'angeschaut', 'kontaktiert')),
  coach_note TEXT,
  strengths TEXT[] DEFAULT '{}',
  focus_area TEXT DEFAULT ''
);

-- 2. Index auf Token für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_survey_submissions_token ON survey_submissions(token);

-- 3. Index auf Status für Admin-Dashboard
CREATE INDEX IF NOT EXISTS idx_survey_submissions_status ON survey_submissions(status);

-- 4. Row Level Security (RLS) aktivieren
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Jeder kann einen neuen Eintrag erstellen (INSERT)
CREATE POLICY "Anyone can insert submissions"
  ON survey_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Jeder kann seinen eigenen Eintrag lesen (via Token)
CREATE POLICY "Anyone can read by token"
  ON survey_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Authentifizierte User (Dani) können alles lesen
CREATE POLICY "Authenticated users can read all"
  ON survey_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Authentifizierte User (Dani) können updaten
CREATE POLICY "Authenticated users can update"
  ON survey_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- NACH DEM AUSFÜHREN:
-- ============================================
-- 1. Gehe zu Authentication → Users → Add User
--    - E-Mail: deine Admin-E-Mail
--    - Passwort: dein gewähltes Passwort
--    - "Auto Confirm User" aktivieren
--
-- 2. Gehe zu Project Settings → API
--    - Kopiere "Project URL" → PUBLIC_SUPABASE_URL
--    - Kopiere "anon public key" → PUBLIC_SUPABASE_ANON_KEY
--
-- 3. Für WhatsApp-Benachrichtigung:
--    - Gehe zu Database → Webhooks → Create
--    - Table: survey_submissions
--    - Events: INSERT
--    - Type: Supabase Edge Function
--    - Function: notify-whatsapp
-- ============================================
