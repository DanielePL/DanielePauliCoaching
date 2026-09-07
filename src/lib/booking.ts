import { supabase } from './supabase'
import { getClickSource, reportCoachingCall } from './tracking'

/* Eigener Buchungskalender für das kostenlose Erstgespräch (ersetzt Calendly).
 *
 * Verfügbarkeit ist bewusst Konfiguration im Code, keine eigene Admin-Maske:
 * Fenster ändern = die Konstante unten anpassen und deployen. Die Slots werden
 * in Schweizer Zeit (Europe/Zurich) gerechnet und als absolute Zeitstempel
 * gespeichert — ein Besucher in einer anderen Zeitzone sieht die Slots trotzdem
 * als Schweizer Zeiten beschriftet und bucht dieselbe absolute Uhrzeit. */

export const BOOKING_CONFIG = {
  slotMinutes: 30,
  /** Frühester buchbarer Slot: so viele Stunden ab jetzt. */
  leadHours: 18,
  /** Wie weit in die Zukunft gebucht werden kann. */
  horizonDays: 21,
  /** Wochentag (1 = Montag … 7 = Sonntag) → Zeitfenster in Schweizer Zeit. */
  windows: {
    1: [['09:00', '19:00']],
    2: [['09:00', '19:00']],
    3: [['09:00', '19:00']],
    4: [['09:00', '19:00']],
    5: [['09:00', '19:00']],
  } as Record<number, [string, string][]>,
}

const ZURICH = 'Europe/Zurich'

/* Wandelt eine Schweizer Wanduhrzeit in einen absoluten Zeitpunkt um.
 * Ohne Datumsbibliothek: erst als UTC raten, dann den Zürich-Offset des
 * Schätzwerts ablesen und abziehen. Für die halbe Stunde um die Zeitumstellung
 * herum kann das daneben liegen — für Buchungsslots irrelevant. */
function zurichOffsetMs(utcInstant: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: ZURICH, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const p = Object.fromEntries(dtf.formatToParts(utcInstant).map((x) => [x.type, x.value]))
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second)
  return asUtc - utcInstant.getTime()
}

function zurichDate(y: number, m: number, d: number, hh: number, mm: number): Date {
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  return new Date(guess - zurichOffsetMs(new Date(guess)))
}

/** Kalendertag + Wochentag eines Zeitpunkts, gesehen aus Schweizer Sicht. */
function zurichParts(instant: Date): { y: number; m: number; d: number; weekday: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: ZURICH, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  })
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value]))
  const weekdays: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }
  return { y: +p.year, m: +p.month, d: +p.day, weekday: weekdays[p.weekday] }
}

export interface DaySlots {
  /** Anzeige-Label des Tages, z.B. "Mo, 8. September" */
  label: string
  /** ISO-Schlüssel des Tages (YYYY-MM-DD in CH-Zeit) */
  key: string
  slots: Date[]
}

export function formatSlotTime(slot: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH, hour: '2-digit', minute: '2-digit',
  }).format(slot)
}

export function formatSlotFull(slot: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH, weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  }).format(slot)
}

/** Alle freien Slots der nächsten Wochen, nach Tag gruppiert (leere Tage fehlen). */
export async function loadFreeSlots(): Promise<DaySlots[]> {
  const now = new Date()
  const from = now
  const to = new Date(now.getTime() + BOOKING_CONFIG.horizonDays * 24 * 3600 * 1000)

  const { data, error } = await supabase.rpc('site_get_booked_slots', {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  })
  if (error) throw error
  const booked = new Set<number>((data ?? []).map((row: string | { site_get_booked_slots: string }) =>
    new Date(typeof row === 'string' ? row : Object.values(row)[0] as string).getTime()
  ))

  const earliest = now.getTime() + BOOKING_CONFIG.leadHours * 3600 * 1000
  const days: DaySlots[] = []
  const dayFmt = new Intl.DateTimeFormat('de-CH', {
    timeZone: ZURICH, weekday: 'short', day: 'numeric', month: 'long',
  })

  for (let i = 0; i < BOOKING_CONFIG.horizonDays; i++) {
    const dayInstant = new Date(now.getTime() + i * 24 * 3600 * 1000)
    const { y, m, d, weekday } = zurichParts(dayInstant)
    const windows = BOOKING_CONFIG.windows[weekday]
    if (!windows) continue

    const slots: Date[] = []
    for (const [start, end] of windows) {
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const windowEnd = zurichDate(y, m, d, eh, em).getTime()
      let t = zurichDate(y, m, d, sh, sm)
      while (t.getTime() + BOOKING_CONFIG.slotMinutes * 60000 <= windowEnd) {
        if (t.getTime() >= earliest && !booked.has(t.getTime())) slots.push(t)
        t = new Date(t.getTime() + BOOKING_CONFIG.slotMinutes * 60000)
      }
    }
    if (slots.length > 0) {
      days.push({
        label: dayFmt.format(slots[0]),
        key: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        slots,
      })
    }
  }
  return days
}

export interface BookingRequest {
  slot: Date
  name: string
  phone: string
  email?: string
  note?: string
}

export type BookingResult = { ok: true } | { ok: false; conflict: boolean }

export async function submitBooking(req: BookingRequest): Promise<BookingResult> {
  const token = crypto.randomUUID()
  const clickSource = getClickSource()

  const { error } = await supabase.from('site_bookings').insert({
    slot_start: req.slot.toISOString(),
    slot_minutes: BOOKING_CONFIG.slotMinutes,
    name: req.name,
    phone: req.phone,
    email: req.email || null,
    note: req.note || null,
    language: 'de',
    token,
    gclid: clickSource?.gclid ?? null,
    utm_source: clickSource?.utm_source ?? null,
    utm_campaign: clickSource?.utm_campaign ?? null,
  })

  if (error) {
    // 23505 = Unique-Verletzung: jemand war schneller, Slot ist weg
    const conflict = (error as { code?: string }).code === '23505'
    if (!conflict) console.error('Booking failed:', error)
    return { ok: false, conflict }
  }

  // Conversion melden (ersetzt den früheren Calendly-postMessage-Listener)
  void reportCoachingCall()

  // Dani sofort benachrichtigen. Darf den Nutzer-Flow nie blockieren.
  try {
    await supabase.functions.invoke('notify-email', {
      body: {
        type: 'INSERT',
        table: 'site_bookings',
        record: {
          name: req.name,
          phone: req.phone,
          email: req.email || null,
          note: req.note || null,
          slot_start: req.slot.toISOString(),
          token,
        },
      },
    })
  } catch (notifyErr) {
    console.error('Notification failed (nicht kritisch):', notifyErr)
  }

  return { ok: true }
}
