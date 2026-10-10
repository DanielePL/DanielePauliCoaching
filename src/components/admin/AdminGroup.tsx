import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/* Anmeldungen „Gentlemen's Strength" im Admin-Bereich (konzept 2026.md, Abschnitt 14.14).
 * Start 8. Januar 2027, 15 Plätze. „Dabei" heisst: bezahlt, Platz fix. Bis ein Stripe-Webhook
 * das automatisch setzt, stellt Dani den Status von Hand um, sobald die Zahlung in Stripe da ist.
 * Absagen ist ein Soft-Status (status = 'abgesagt'). Nie hart löschen. */

const PLACES = 15;

interface Signup {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  language: 'de' | 'en';
  age_range: string | null;
  note: string | null;
  status: 'neu' | 'kontaktiert' | 'dabei' | 'abgesagt';
  utm_source: string | null;
  utm_campaign: string | null;
  gclid: string | null;
}

type Filter = 'de' | 'en' | 'abgesagt';

const STATUS: Record<Signup['status'], { label: string; color: string }> = {
  neu: { label: 'Neu', color: 'bg-blue-500/15 text-blue-700' },
  kontaktiert: { label: 'Kontaktiert', color: 'bg-orange/15 text-orange' },
  dabei: { label: 'Dabei (bezahlt)', color: 'bg-green-500/15 text-green-700' },
  abgesagt: { label: 'Abgesagt', color: 'bg-stone-500/15 text-stone-600' },
};

export default function AdminGroup() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('de');
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchSignups();
  }, []);

  async function fetchSignups() {
    const { data, error } = await supabase
      .from('site_group_waitlist')
      .select('id, created_at, name, email, phone, language, age_range, note, status, utm_source, utm_campaign, gclid')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    if (!error && data) setSignups(data as Signup[]);
    setLoading(false);
  }

  async function setStatus(id: string, status: Signup['status']) {
    setBusy(id);
    const { error } = await supabase.from('site_group_waitlist').update({ status }).eq('id', id);
    if (error) console.error('Status-Update fehlgeschlagen:', error);
    setConfirmCancel(null);
    await fetchSignups();
    setBusy(null);
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const active = signups.filter((s) => s.status !== 'abgesagt');
  const german = active.filter((s) => s.language === 'de');
  const english = active.filter((s) => s.language === 'en');
  const cancelled = signups.filter((s) => s.status === 'abgesagt').reverse();
  const paid = german.filter((s) => s.status === 'dabei').length;

  const shown = filter === 'de' ? german : filter === 'en' ? english : cancelled;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'de', label: 'Deutsche Gruppe', count: german.length },
    { key: 'en', label: 'English (Warteliste)', count: english.length },
    { key: 'abgesagt', label: 'Abgesagt', count: cancelled.length },
  ];

  return (
    <div>
      {/* Platz-Zähler */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-text-secondary">Start Freitag, 8. Januar 2027 · Anmeldeschluss 18. Dezember 2026</p>
            <p className="text-2xl font-bold mt-1">
              {paid} / {PLACES} <span className="text-base font-normal text-text-secondary">Plätze bezahlt</span>
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            {german.length - paid} angemeldet, noch nicht bezahlt
          </p>
        </div>
        <div className="h-2 rounded-full bg-surface border border-glass-border mt-3 overflow-hidden">
          <div className="h-full bg-orange" style={{ width: `${Math.min(100, (paid / PLACES) * 100)}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              filter === t.key
                ? 'bg-orange text-white'
                : 'bg-surface border border-glass-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">🏋️</div>
          <h2 className="text-xl font-bold mb-2">Noch keine Anmeldungen</h2>
          <p className="text-text-secondary">Sobald sich jemand auf /gentlemens-strength/ anmeldet, erscheint er hier.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((s) => (
            <div key={s.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-text-primary">{s.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS[s.status].color}`}>
                      {STATUS[s.status].label}
                    </span>
                    {s.age_range && <span className="text-text-muted text-sm">{s.age_range} J.</span>}
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    <a href={`mailto:${s.email}`} className="hover:text-orange">{s.email}</a>
                    {s.phone && (
                      <>
                        {' · '}
                        <a href={`tel:${s.phone}`} className="hover:text-orange">{s.phone}</a>
                      </>
                    )}
                  </p>
                  {s.note && (
                    <p className="text-text-primary text-sm mt-2 whitespace-pre-line border-l-2 border-orange/40 pl-3">
                      {s.note}
                    </p>
                  )}
                  <p className="text-text-muted text-xs mt-2">
                    Angemeldet am {new Date(s.created_at).toLocaleString('de-CH')}
                    {(s.utm_source || s.gclid) && (
                      <> · Quelle: {s.gclid ? 'Google Ads' : s.utm_source}{s.utm_campaign ? ` / ${s.utm_campaign}` : ''}</>
                    )}
                  </p>
                </div>

                {s.status !== 'abgesagt' && (
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {s.status === 'neu' && (
                      <button
                        onClick={() => setStatus(s.id, 'kontaktiert')}
                        disabled={busy === s.id}
                        className="px-3 py-1.5 rounded-lg text-sm bg-orange/15 text-orange hover:bg-orange/25 transition-colors disabled:opacity-50"
                      >
                        Kontaktiert
                      </button>
                    )}
                    {s.status !== 'dabei' && s.language === 'de' && (
                      <button
                        onClick={() => setStatus(s.id, 'dabei')}
                        disabled={busy === s.id}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-500/15 text-green-700 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        Bezahlt
                      </button>
                    )}
                    {confirmCancel === s.id ? (
                      <>
                        <button
                          onClick={() => setStatus(s.id, 'abgesagt')}
                          disabled={busy === s.id}
                          className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Wirklich absagen
                        </button>
                        <button
                          onClick={() => setConfirmCancel(null)}
                          className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary"
                        >
                          Nein
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(s.id)}
                        disabled={busy === s.id}
                        className="px-3 py-1.5 rounded-lg text-sm border border-glass-border text-text-secondary hover:text-red-700 hover:border-red-300 transition-colors disabled:opacity-50"
                      >
                        Absagen
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
