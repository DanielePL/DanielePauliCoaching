-- ============================================
-- Warteliste für die Gruppe „Gentlemen's Strength“ (konzept 2026.md, Abschnitt 14)
-- ============================================
-- Jeder darf sich eintragen (INSERT), niemand Anonymes darf die Liste lesen.
-- Dani (authentifiziert) liest und pflegt sie. Nur Soft-Delete (is_deleted).

CREATE TABLE IF NOT EXISTS site_group_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 200),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  language TEXT NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en')),
  age_range TEXT CHECK (age_range IS NULL OR age_range IN ('<40', '40-44', '45-49', '50-54', '55+')),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 2000),
  status TEXT NOT NULL DEFAULT 'neu' CHECK (status IN ('neu', 'kontaktiert', 'dabei', 'abgesagt')),
  gclid TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_site_group_waitlist_created ON site_group_waitlist (created_at);

ALTER TABLE site_group_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON site_group_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'neu' AND is_deleted = false);

CREATE POLICY "Authenticated can read the waitlist"
  ON site_group_waitlist FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update the waitlist"
  ON site_group_waitlist FOR UPDATE TO authenticated
  USING (true);

-- Kein DELETE-Recht für irgendwen: Löschen = is_deleted setzen.
REVOKE DELETE, TRUNCATE ON site_group_waitlist FROM anon, authenticated;
