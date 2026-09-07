import { useEffect, useState } from 'react'
import {
  loadFreeSlots, submitBooking, formatSlotTime, formatSlotFull,
  BOOKING_CONFIG, type DaySlots,
} from '../lib/booking'

/* Eigener Buchungsdialog für das kostenlose Erstgespräch (ersetzt Calendly).
 * Wird einmal im Layout gemountet und von überall geöffnet mit:
 *   window.dispatchEvent(new CustomEvent('open-booking')) */

type Step = 'slots' | 'contact' | 'done'

export default function BookingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('slots')
  const [days, setDays] = useState<DaySlots[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [slot, setSlot] = useState<Date | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const onOpen = () => {
      setOpen(true)
      setStep('slots')
      setSlot(null)
      setSubmitError(null)
      setLoadError(false)
      setDays(null)
      loadFreeSlots()
        .then((d) => {
          setDays(d)
          setDayKey((prev) => prev && d.some((x) => x.key === prev) ? prev : d[0]?.key ?? null)
        })
        .catch(() => setLoadError(true))
    }
    window.addEventListener('open-booking', onOpen)
    return () => window.removeEventListener('open-booking', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const activeDay = days?.find((d) => d.key === dayKey) ?? null
  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 8 && !submitting

  const handleSubmit = async () => {
    if (!slot || !canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    const result = await submitBooking({
      slot,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      note: note.trim() || undefined,
    })
    setSubmitting(false)
    if (result.ok) {
      setStep('done')
    } else if (result.conflict) {
      setSubmitError('Dieser Termin wurde gerade eben vergeben. Bitte wähle einen anderen.')
      setStep('slots')
      setSlot(null)
      loadFreeSlots().then(setDays).catch(() => setLoadError(true))
    } else {
      setSubmitError('Das hat leider nicht geklappt. Versuch es nochmals oder schreib mir direkt per WhatsApp.')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <button
          onClick={() => setOpen(false)}
          aria-label="Schliessen"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === 'slots' && (
          <>
            <h3 className="text-2xl font-bold text-text-primary mb-1">Kostenloses Erstgespräch</h3>
            <p className="text-text-secondary text-sm mb-6">
              {BOOKING_CONFIG.slotMinutes} Minuten, per Telefon oder Video. Zeiten in Schweizer Zeit.
            </p>

            {submitError && (
              <p className="text-sm text-orange mb-4">{submitError}</p>
            )}

            {loadError && (
              <p className="text-text-secondary">
                Der Kalender lässt sich gerade nicht laden. Versuch es gleich nochmals
                oder schreib mir direkt per{' '}
                <a className="text-orange underline" href="https://wa.me/41798675705">WhatsApp</a>.
              </p>
            )}

            {!loadError && !days && (
              <p className="text-text-secondary animate-pulse">Freie Termine werden geladen …</p>
            )}

            {days && days.length === 0 && (
              <p className="text-text-secondary">
                Aktuell sind keine Termine frei. Schreib mir per{' '}
                <a className="text-orange underline" href="https://wa.me/41798675705">WhatsApp</a>,
                wir finden etwas.
              </p>
            )}

            {days && days.length > 0 && (
              <>
                {/* Tage */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => { setDayKey(d.key); setSlot(null) }}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        d.key === dayKey
                          ? 'bg-orange text-white border-orange'
                          : 'bg-surface border-glass-border text-text-secondary hover:border-orange/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Slots des Tages */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                  {activeDay?.slots.map((s) => (
                    <button
                      key={s.getTime()}
                      onClick={() => setSlot(s)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                        slot?.getTime() === s.getTime()
                          ? 'bg-orange text-white border-orange'
                          : 'bg-surface border-glass-border text-text-primary hover:border-orange/50'
                      }`}
                    >
                      {formatSlotTime(s)}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!slot}
                  onClick={() => { setSubmitError(null); setStep('contact') }}
                >
                  Weiter
                </button>
              </>
            )}
          </>
        )}

        {step === 'contact' && slot && (
          <>
            <h3 className="text-2xl font-bold text-text-primary mb-1">Fast geschafft</h3>
            <p className="text-text-secondary text-sm mb-6">
              {formatSlotFull(slot)} Uhr · {BOOKING_CONFIG.slotMinutes} Minuten
            </p>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                autoComplete="name"
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefonnummer (für den Anruf)"
                autoComplete="tel"
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail (optional, für die Bestätigung)"
                autoComplete="email"
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Worum geht es dir? (optional)"
                rows={2}
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors resize-none"
              />
            </div>

            {submitError && <p className="text-sm text-orange mb-4">{submitError}</p>}

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep('slots')}>
                Zurück
              </button>
              <button
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? 'Wird gebucht …' : 'Termin buchen'}
              </button>
            </div>

            <p className="text-xs text-text-muted mt-4">
              Deine Angaben werden nur für dieses Gespräch verwendet.{' '}
              <a href="/datenschutz/" className="underline">Datenschutz</a>
            </p>
          </>
        )}

        {step === 'done' && slot && (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-orange/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Termin ist gebucht.</h3>
            <p className="text-text-secondary mb-6">
              {formatSlotFull(slot)} Uhr. Ich melde mich bei dir — freu mich auf das Gespräch.
            </p>
            <button className="btn-primary w-full" onClick={() => setOpen(false)}>
              Alles klar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
