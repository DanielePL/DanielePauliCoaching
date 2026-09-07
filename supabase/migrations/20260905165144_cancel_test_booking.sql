-- Storniert die End-to-End-Testbuchung vom 2026-09-05 (Soft-Cancel, kein Delete).
UPDATE site_bookings SET status = 'abgesagt' WHERE name = 'TEST Buchung' AND phone = '0790000000';
