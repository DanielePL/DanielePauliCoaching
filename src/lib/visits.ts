import { supabase } from './supabase'
import { getClickSource } from './tracking'

/* Zählt Seitenaufrufe. Nichts weiter.
 *
 * Wozu: Werbung ohne diese Zahl gibt Geld aus und lehrt nichts. Erst das
 * Verhältnis Besuche → abgeschlossene Checks sagt, ob ein Klick für CHF 4 sich
 * lohnt oder ob die Seite die Leute verliert.
 *
 * Kein Cookie, kein localStorage für den Zähler selbst, keine IP, kein
 * User-Agent, keine Kennung. Damit ist nichts einzuwilligen und kein Banner
 * nötig. Der Preis: Besuche lassen sich zählen, Personen nicht — für die Quote
 * reicht das.
 *
 * Der Referrer wird auf den Host gekürzt, BEVOR er das Gerät verlässt: eine
 * vollständige Referrer-URL kann die Suchbegriffe des Besuchers enthalten.
 *
 * Die gclid ist die Ausnahme. Sie steht ohnehin in der Klick-URL und reist zu
 * Google; ohne sie lässt sich ein Anzeigenklick nicht mit dem Lead verbinden,
 * den er erzeugt hat — und genau darum geht es hier.
 *
 * Läuft über den anon-Key gegen die Tabelle `site_visits`, deren Regel nur
 * INSERT erlaubt (siehe supabase/setup-tracking.sql). Lesen kann der Key nicht.
 */
export async function countVisit(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    let referrerHost: string | null = null
    if (document.referrer) {
      try {
        const h = new URL(document.referrer).host
        // Eigene Seiten nicht als Herkunft zählen — sonst sieht jeder Wechsel
        // von / nach /survey/ aus wie ein neuer Besucher von aussen.
        if (h && !h.endsWith('danielepauli.com')) referrerHost = h
      } catch { /* kein gültiger URL-String */ }
    }

    const src = getClickSource()
    await supabase.from('site_visits').insert({
      path: window.location.pathname.slice(0, 300),
      referrer_host: referrerHost,
      gclid: src?.gclid ?? null,
      utm_source: src?.utm_source ?? null,
      utm_campaign: src?.utm_campaign ?? null,
      viewport: window.innerWidth < 768 ? 'mobile' : 'desktop',
    })
  } catch {
    /* Ein Zähler darf niemals eine Seite kaputt machen. */
  }
}
