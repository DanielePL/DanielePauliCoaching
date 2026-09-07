/* Merkt sich, woher ein Besucher kam, und meldet später, dass daraus ein Lead
 * wurde.
 *
 * Warum überhaupt: Ohne das sieht man in Google Ads nur Klicks und Kosten. Was
 * ein Klick gebracht hat — also welcher Suchbegriff zu einem Erstgespräch
 * führte und welcher nur Geld kostete — bleibt unsichtbar. Google optimiert dann
 * auf Klicks statt auf Kunden, und Klicks sind genau das, was bezahlt wird.
 *
 * Warum kein Google-Tag: gtag.js setzt Cookies und braucht damit einen
 * Einwilligungsbanner. Der hier gewählte Weg — die `gclid` aus der Klick-URL
 * merken und die Conversion serverseitig melden — kommt ohne Cookie aus. Der
 * Wert landet im localStorage, verlässt das Gerät erst beim Absenden des Checks
 * und gehört zu einem Klick, nicht zu einer Person.
 *
 * Die gclid muss den ganzen Trichter überleben: zwischen Anzeigenklick und
 * abgeschicktem Check liegen 24 Fragen und oft mehrere Sitzungen. sessionStorage
 * wäre nach dem ersten Schliessen des Tabs weg.
 */

const KEY = 'dp_click_source_v1'
/* 90 Tage — Googles maximales Attributionsfenster für Klicks. Was älter ist,
   akzeptiert Google ohnehin nicht mehr, also weg damit. */
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

export type ClickSource = {
  gclid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  landedAt: number
}

/* Beim ersten Seitenaufruf aufrufen. Überschreibt einen gespeicherten Wert nur,
   wenn wirklich eine neue gclid in der URL steht — sonst würde ein Besucher, der
   über eine Anzeige kam und später direkt wiederkommt, seine Herkunft verlieren. */
export function captureClickSource(): void {
  if (typeof window === 'undefined') return
  try {
    const q = new URLSearchParams(window.location.search)
    const gclid = q.get('gclid') || undefined
    const utm_source = q.get('utm_source') || undefined
    if (!gclid && !utm_source) return

    const data: ClickSource = {
      gclid,
      utm_source,
      utm_medium: q.get('utm_medium') || undefined,
      utm_campaign: q.get('utm_campaign') || undefined,
      landedAt: Date.now(),
    }
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* Privater Modus, voller Speicher — nie den Besucher stören. */
  }
}

export function getClickSource(): ClickSource | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as ClickSource
    if (!d?.landedAt || Date.now() - d.landedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return d
  } catch {
    return null
  }
}

/* Google will 'yyyy-mm-dd hh:mm:ss+hh:mm' — nicht das ISO-Format, das
   toISOString() liefert. Ein falsches Format wird stillschweigend verworfen. */
function googleTimestamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${sign}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)}`
  )
}

const ADS_ENDPOINT =
  'https://zzluhirmmnkfkifriult.supabase.co/functions/v1/admin-google-ads'

/* Anon-Key des Prometheus-Projekts. Das ist ein öffentlicher Wert — er steht per
   Design in jedem Browser-Bundle und ist ohne die serverseitigen Regeln wertlos.
   Er steht hier, weil die Funktion, die Conversions an Google meldet, dort liegt
   und nicht in diesem Projekt: ein Google-Ads-Konto, eine Stelle, an der
   gemeldet wird. Ein Duplikat der Anbindung wäre der teurere Weg. */
const ADS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bHVoaXJtbW5rZmtpZnJpdWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTM1NTAsImV4cCI6MjA4NTk3MzU1MH0._WCjCcUMWeMjdcf_TP1Ah2qlsSRTo4VnOV8FrdOSA7I'

/* Meldet Google, dass aus dem gespeicherten Klick ein Lead wurde.
 *
 * Ohne gclid passiert nichts — der Besuch kam dann nicht über eine Anzeige, und
 * es gibt nichts zuzuordnen. Fehler werden geschluckt: eine fehlgeschlagene
 * Meldung darf niemals verhindern, dass jemand sein Ergebnis sieht. */
async function report(conversionType: 'coaching' | 'coaching_call'): Promise<void> {
  const src = getClickSource()
  if (!src?.gclid) return

  try {
    await fetch(ADS_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: ADS_ANON_KEY,
        authorization: `Bearer ${ADS_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'upload_conversion',
        // Benennt die Conversion-Aktion über einen Typ, nicht über eine id —
        // dasselbe Ads-Konto trägt auch die Prometheus-Kampagne, und die beiden
        // dürfen sich nicht vermischen.
        conversionType,
        gclid: src.gclid,
        conversionDateTime: googleTimestamp(),
      }),
    })
  } catch {
    /* still, siehe oben */
  }
}

/** Check ausgefüllt und abgeschickt. */
export const reportCoachingLead = () => report('coaching')

/** Erstgespräch tatsächlich gebucht — das wertvollere Ereignis. */
export const reportCoachingCall = () => report('coaching_call')
