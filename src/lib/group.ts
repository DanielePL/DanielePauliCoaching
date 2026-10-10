/* Gentlemen's Strength — Zahlung (konzept 2026.md, Abschnitt 14.14).
   Owner-Entscheid 2026-10-10: Zahlung direkt nach der Anmeldung, nur Einmalzahlung, keine Raten.

   Stripe Payment Link aus Danieles eigenem Stripe-Konto (Einzelunternehmen, nicht das Firmenkonto).
   Ein Payment Link ist eine öffentliche URL, kein Secret — er darf im Client stehen.
   Leer = noch kein Link: das Formular meldet dann nur an, ohne Weiterleitung zur Zahlung. */
export const GROUP_PAYMENT_LINK = ''

export const GROUP_PRICE_LABEL = "CHF 1'250"
