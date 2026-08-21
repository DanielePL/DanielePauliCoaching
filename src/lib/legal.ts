/* Anbieterangaben — einmal hier, verwendet von Impressum und Datenschutz.
 *
 * An zwei Stellen gepflegte Adressen laufen auseinander, und bei rechtlich
 * verbindlichen Angaben ist eine veraltete Adresse schlimmer als gar keine.
 *
 * Ausgefüllt am 2026-08-21. Fehlt hier etwas, blenden beide Seiten sichtbar
 * einen Warnhinweis ein, statt still eine Lücke zu lassen.
 *
 * Als Einzelunternehmen ohne Handelsregister-Eintrag braucht es keine UID; sie
 * wird erst bei Eintragung oder Mehrwertsteuerpflicht (ab CHF 100'000 Umsatz)
 * fällig und ist dann hier zu ergänzen.
 */
export const OPERATOR = {
  name: 'Daniele Pauli',
  legalForm: 'Daniele Pauli Coaching, Einzelunternehmen',
  address: 'St. Annagasse 9\n8001 Zürich\nSchweiz',
  email: 'danielepauli@gmail.com',
  phone: '+41 79 867 57 05',
  /* Nur wenn im Handelsregister eingetragen bzw. mehrwertsteuerpflichtig. */
  uid: '',
} as const

export const isComplete = Boolean(OPERATOR.legalForm && OPERATOR.address)

/* Wo die Daten des „Ich 2.0 Checks" tatsächlich liegen. Steht hier, damit die
   Datenschutzerklärung beschreibt, was der Code wirklich tut — geprüft in
   src/components/Survey.tsx: Insert in `survey_submissions`, danach ein Aufruf
   der Edge Function `notify-email`. */
export const PROCESSING = {
  host: 'Supabase Inc. (Datenbank und Hosting der Funktionen)',
  fields: ['Vorname', 'Telefonnummer', 'Sprache', 'Antworten der 24 Fragen', 'errechneter Punktwert'],
  purpose: 'Auswertung des Checks, persönliches Ergebnis und Kontaktaufnahme zum Coaching',
} as const
