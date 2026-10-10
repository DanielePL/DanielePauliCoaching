import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getClickSource } from '../lib/tracking'

/* Warteliste „Gentlemen's Strength" (konzept 2026.md, Abschnitt 14).
   Insert in `site_group_waitlist`, danach notify-email an Dani. Zweisprachig:
   die Gruppe startet auf Deutsch, eine englische Gruppe folgt bei Nachfrage —
   deshalb fragen wir die Sprache ab. */

const inputClass =
  'w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors'

type Lang = 'de' | 'en'

const T = {
  de: {
    name: 'Vorname und Name',
    email: 'E-Mail',
    phone: 'Telefon / WhatsApp (optional)',
    age: 'Dein Alter',
    agePick: 'Bitte wählen',
    note: 'Was soll sich in den nächsten 6 Monaten ändern? (optional)',
    submit: 'Jetzt anmelden',
    sending: 'Wird gesendet …',
    privacy: 'Deine Angaben nutze ich nur, um dich wegen der Gruppe zu kontaktieren.',
    privacyLink: 'Datenschutz',
    errRequired: 'Bitte Name und eine gültige E-Mail angeben.',
    errSend: 'Das hat nicht geklappt. Versuch es nochmals oder schreib mir auf WhatsApp.',
    doneTitle: 'Du bist angemeldet.',
    doneText: 'Ich melde mich persönlich bei dir und wir klären alles vor dem Start am 8. Januar 2027.',
  },
  en: {
    name: 'Full name',
    email: 'Email',
    phone: 'Phone / WhatsApp (optional)',
    age: 'Your age',
    agePick: 'Please choose',
    note: 'What should change in the next 6 months? (optional)',
    submit: 'Join the waitlist',
    sending: 'Sending …',
    privacy: 'I only use your details to contact you about the group.',
    privacyLink: 'Privacy',
    errRequired: 'Please enter your name and a valid email.',
    errSend: 'That did not work. Please try again or message me on WhatsApp.',
    doneTitle: "You're on the list.",
    doneText: 'The first group runs in German. I will contact you personally as soon as the English group opens.',
  },
} as const

const AGES = ['<40', '40-44', '45-49', '50-54', '55+'] as const

export default function GroupWaitlistForm() {
  const [lang, setLang] = useState<Lang>('de')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [note, setNote] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const t = T[lang]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanEmail = email.trim()
    if (!name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setError(t.errRequired)
      return
    }
    setState('sending')
    const click = getClickSource()
    const record = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim() || null,
      language: lang,
      age_range: age || null,
      note: note.trim() || null,
    }
    const { error: insertError } = await supabase.from('site_group_waitlist').insert({
      ...record,
      gclid: click?.gclid ?? null,
      utm_source: click?.utm_source ?? null,
      utm_campaign: click?.utm_campaign ?? null,
    })
    if (insertError) {
      console.error('Waitlist insert failed:', insertError)
      setError(t.errSend)
      setState('idle')
      return
    }
    // Dani sofort benachrichtigen. Darf den Nutzer-Flow nie blockieren.
    try {
      await supabase.functions.invoke('notify-email', {
        body: { type: 'INSERT', table: 'site_group_waitlist', record },
      })
    } catch (notifyErr) {
      console.error('Notification failed (nicht kritisch):', notifyErr)
    }
    setState('done')
  }

  if (state === 'done') {
    return (
      <div className="text-center py-6" role="status">
        <p className="text-2xl font-semibold mb-2">{t.doneTitle}</p>
        <p className="text-text-secondary">{t.doneText}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex gap-2 justify-center" role="group" aria-label="Sprache / Language">
        {(['de', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              lang === l ? 'bg-orange text-white border-orange' : 'border-glass-border text-text-secondary hover:border-orange'
            }`}
          >
            {l === 'de' ? 'Deutsch' : 'English'}
          </button>
        ))}
      </div>

      <input className={inputClass} placeholder={t.name} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} aria-label={t.name} />
      <input className={inputClass} type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={200} aria-label={t.email} />
      <input className={inputClass} type="tel" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={40} aria-label={t.phone} />
      <select className={inputClass} value={age} onChange={(e) => setAge(e.target.value)} aria-label={t.age}>
        <option value="">{t.age}: {t.agePick}</option>
        {AGES.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <textarea className={`${inputClass} resize-none`} rows={3} placeholder={t.note} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} aria-label={t.note} />

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <button type="submit" className="btn-primary w-full text-lg" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.submit}
      </button>
      <p className="text-xs text-text-muted text-center">
        {t.privacy} <a href="/datenschutz/" className="underline hover:text-orange">{t.privacyLink}</a>
      </p>
    </form>
  )
}
