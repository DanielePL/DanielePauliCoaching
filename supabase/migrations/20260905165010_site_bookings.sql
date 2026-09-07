-- ============================================
-- Supabase Setup: Eigener Buchungskalender (ersetzt Calendly)
-- ============================================
-- Führe dieses SQL im Supabase Dashboard aus:
-- SQL Editor → New Query → Einfügen → Run
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS site_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  slot_start TIMESTAMPTZ NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 30,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  note TEXT,
  language TEXT DEFAULT 'de',
  status TEXT DEFAULT 'gebucht' CHECK (status IN ('gebucht', 'bestaetigt', 'abgesagt')),
  token TEXT UNIQUE NOT NULL,
  gclid TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- 2. Doppelbuchungen hart verhindern: pro Startzeit maximal eine aktive Buchung.
--    Abgesagte/gelöschte Buchungen geben den Slot wieder frei.
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_bookings_active_slot
  ON site_bookings (slot_start)
  WHERE is_deleted = false AND status <> 'abgesagt';

CREATE INDEX IF NOT EXISTS idx_site_bookings_created ON site_bookings (created_at);

-- 3. Row Level Security
ALTER TABLE site_bookings ENABLE ROW LEVEL SECURITY;

-- Jeder darf buchen (INSERT), aber niemand Anonymes darf Buchungen lesen —
-- Namen und Telefonnummern anderer gehen Besucher nichts an.
CREATE POLICY "Anyone can book"
  ON site_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Dani (authentifiziert) darf lesen und ändern (Status, Absagen via Soft-Delete)
CREATE POLICY "Authenticated can read bookings"
  ON site_bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update bookings"
  ON site_bookings
  FOR UPDATE
  TO authenticated
  USING (true);

-- 4. Belegte Slots ohne Personendaten abfragbar machen (für die Verfügbarkeits-
--    Anzeige im Frontend). SECURITY DEFINER, gibt NUR Zeitstempel zurück.
--    Präfix site_ damit nichts mit den Prometheus-Booking-Funktionen auf der
--    gleichen DB kollidiert.
CREATE OR REPLACE FUNCTION site_get_booked_slots(p_from TIMESTAMPTZ, p_to TIMESTAMPTZ)
RETURNS SETOF TIMESTAMPTZ
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT slot_start
  FROM site_bookings
  WHERE slot_start >= p_from
    AND slot_start < p_to
    AND is_deleted = false
    AND status <> 'abgesagt';
$$;

GRANT EXECUTE ON FUNCTION site_get_booked_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
