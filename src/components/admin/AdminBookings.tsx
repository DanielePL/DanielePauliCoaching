import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatSlotFull } from '../../lib/booking';

/* Übersicht der gebuchten Erstgespräche im Admin-Bereich.
 * Absagen ist ein Soft-Cancel (status = 'abgesagt'): der Slot wird dadurch wieder
 * frei (partieller Unique-Index), die Zeile bleibt erhalten. Nie hart löschen. */

interface Booking {
  id: string;
  created_at: string;
  slot_start: string;
  slot_minutes: number;
  name: string;
  phone: string;
  email: string | null;
  note: string | null;
  status: 'gebucht' | 'bestaetigt' | 'abgesagt';
  utm_source: string | null;
  utm_campaign: string | null;
  gclid: string | null;
}

type Filter = 'kommend' | 'vergangen' | 'abgesagt';

const STATUS: Record<Booking['status'], { label: string; color: string }> = {
  gebucht: { label: 'Gebucht', color: 'bg-blue-500/15 text-blue-700' },
  bestaetigt: { label: 'Bestätigt', color: 'bg-green-500/15 text-green-700' },
  abgesagt: { label: 'Abgesagt', color: 'bg-stone-500/15 text-stone-600' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('kommend');
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const { data, error } = await supabase
      .from('site_bookings')
      .select('id, created_at, slot_start, slot_minutes, name, phone, email, note, status, utm_source, utm_campaign, gclid')
      .eq('is_deleted', false)
      .order('slot_start', { ascending: true });
    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  }

  async function setStatus(id: string, status: Booking['status']) {
    setBusy(id);
    const { error } = await supabase.from('site_bookings').update({ status }).eq('id', id);
    if (error) console.error('Status-Update fehlgeschlagen:', error);
    setConfirmCancel(null);
    await fetchBookings();
    setBusy(null);
  }

  const now = Date.now();
  const isPast = (b: Booking) => new Date(b.slot_start).getTime() + b.slot_minutes * 60000 < now;

  const upcoming = bookings.filter((b) => b.status !== 'abgesagt' && !isPast(b));
  const past = bookings.filter((b) => b.status !== 'abgesagt' && isPast(b)).reverse();
  const cancelled = bookings.filter((b) => b.status === 'abgesagt').reverse();

  const shown = filter === 'kommend' ? upcoming : filter === 'vergangen' ? past : cancelled;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'kommend', label: 'Kommend', count: upcoming.length },
    { key: 'vergangen', label: 'Vergangen', count: past.length },
    { key: 'abgesagt', label: 'Abgesagt', count: cancelled.length },
  ];

  return (
    <div>
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
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-xl font-bold mb-2">
            {filter === 'kommend' ? 'Keine anstehenden Erstgespräche' : 'Nichts hier'}
          </h2>
          <p className="text-text-secondary">
            {filter === 'kommend' && 'Sobald jemand einen Termin bucht, erscheint er hier.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((b) => (
            <div key={b.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-text-primary">
                    {formatSlotFull(new Date(b.slot_start))} Uhr
                    <span className="text-text-muted text-sm font-normal ml-2">{b.slot_minutes} Min</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-medium">{b.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS[b.status].color}`}>
                      {STATUS[b.status].label}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    <a href={`tel:${b.phone}`} className="hover:text-orange">{b.phone}</a>
                    {b.email && (
                      <>
                        {' · '}
                        <a href={`mailto:${b.email}`} className="hover:text-orange">{b.email}</a>
                      </>
                    )}
                  </p>
                  {b.note && (
                    <p className="text-text-primary text-sm mt-2 whitespace-pre-line border-l-2 border-orange/40 pl-3">
                      {b.note}
                    </p>
                  )}
                  <p className="text-text-muted text-xs mt-2">
                    Gebucht am {new Date(b.created_at).toLocaleString('de-CH')}
                    {(b.utm_source || b.gclid) && (
                      <> · Quelle: {b.gclid ? 'Google Ads' : b.utm_source}{b.utm_campaign ? ` / ${b.utm_campaign}` : ''}</>
                    )}
                  </p>
                </div>

                {b.status !== 'abgesagt' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {b.status === 'gebucht' && (
                      <button
                        onClick={() => setStatus(b.id, 'bestaetigt')}
                        disabled={busy === b.id}
                        className="px-3 py-1.5 rounded-lg text-sm bg-green-500/15 text-green-700 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        Bestätigen
                      </button>
                    )}
                    {confirmCancel === b.id ? (
                      <>
                        <button
                          onClick={() => setStatus(b.id, 'abgesagt')}
                          disabled={busy === b.id}
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
                        onClick={() => setConfirmCancel(b.id)}
                        disabled={busy === b.id}
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
