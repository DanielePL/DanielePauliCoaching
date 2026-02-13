import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { SurveySubmission } from '../../lib/types';

type ViewMode = 'list' | 'detail';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  neu: { label: 'Neu', color: 'bg-blue-500/20 text-blue-400' },
  angeschaut: { label: 'Angeschaut', color: 'bg-yellow-500/20 text-yellow-400' },
  kontaktiert: { label: 'Kontaktiert', color: 'bg-green-500/20 text-green-400' },
};

// German question labels for the detail view
const QUESTION_LABELS = [
  'Körperlich/Mental',
  'Barrieren',
  'Stabilität',
  '12-Monats-Projektion',
  'Frühere Versuche',
  'Warum nicht funktioniert',
  'Zeiteinschätzung',
  'Ich 2.0 Vision',
  'Bedeutung des Ziels',
  'Erhaltungsplan',
  'Bereitschaft Prioritäten',
  'Umgang mit Feedback',
  'Accountability',
  'Effizienz',
  'Bereit alles zu geben',
  'Zeitinvestment (geplant)',
  'Zeitinvestment (aktuell)',
  'Wichtigkeit (1-10)',
  '2-Jahres-Konsequenz',
  'Warum JETZT',
  'Investment-Bereitschaft',
];

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSubmission, setSelectedSubmission] = useState<SurveySubmission | null>(null);
  const [coachNote, setCoachNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('survey_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as SurveySubmission[]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase
      .from('survey_submissions')
      .update({ status })
      .eq('id', id);
    fetchSubmissions();
  }

  async function saveCoachNote() {
    if (!selectedSubmission?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from('survey_submissions')
      .update({ coach_note: coachNote })
      .eq('id', selectedSubmission.id);

    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Update local state
      setSelectedSubmission({ ...selectedSubmission, coach_note: coachNote });
      fetchSubmissions();
    }
    setSaving(false);
  }

  function openDetail(submission: SurveySubmission) {
    setSelectedSubmission(submission);
    setCoachNote(submission.coach_note || '');
    setViewMode('detail');

    // Mark as seen if new
    if (submission.status === 'neu' && submission.id) {
      updateStatus(submission.id, 'angeschaut');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedSubmission) {
    const answers = selectedSubmission.answers || {};
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const prospectLink = `${siteUrl}/ergebnis/?token=${selectedSubmission.token}`;

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setViewMode('list')}
              className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[selectedSubmission.status]?.color || ''}`}>
                {STATUS_LABELS[selectedSubmission.status]?.label || selectedSubmission.status}
              </span>
              <select
                value={selectedSubmission.status}
                onChange={(e) => {
                  updateStatus(selectedSubmission.id!, e.target.value);
                  setSelectedSubmission({ ...selectedSubmission, status: e.target.value as SurveySubmission['status'] });
                }}
                className="bg-surface border border-glass-border rounded-lg px-3 py-1 text-sm text-text-primary"
              >
                <option value="neu">Neu</option>
                <option value="angeschaut">Angeschaut</option>
                <option value="kontaktiert">Kontaktiert</option>
              </select>
            </div>
          </div>

          {/* Person Info */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold">{selectedSubmission.name}</h1>
                <p className="text-text-secondary">{selectedSubmission.phone}</p>
                <p className="text-text-muted text-sm">
                  {selectedSubmission.created_at
                    ? new Date(selectedSubmission.created_at).toLocaleString('de-CH')
                    : ''}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">{selectedSubmission.score}%</div>
                <div className="text-text-secondary text-sm">{selectedSubmission.score_label}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-glass-border">
              <p className="text-text-secondary text-sm">
                Persönlicher Link:
                <a href={prospectLink} target="_blank" rel="noopener" className="text-orange ml-2 break-all">
                  {prospectLink}
                </a>
              </p>
            </div>
          </div>

          {/* Alle 21 Antworten */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Alle Antworten</h2>
            <div className="space-y-4">
              {QUESTION_LABELS.map((label, i) => {
                const answer = answers[i];
                if (answer === undefined) return null;

                return (
                  <div key={i} className="border-b border-glass-border pb-3 last:border-0">
                    <p className="text-text-muted text-xs mb-1">Frage {i + 1}</p>
                    <p className="text-text-secondary text-sm font-medium mb-1">{label}</p>
                    <p className="text-text-primary">
                      {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coach Note */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Persönliche Einschätzung</h2>
            <p className="text-text-secondary text-sm mb-4">
              Markdown wird unterstützt. Wird sofort auf der persönlichen Seite des Interessenten sichtbar.
            </p>
            <textarea
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              rows={10}
              className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors font-mono text-sm resize-y"
              placeholder={`Hey ${selectedSubmission.name}!\n\nIch habe mir deine Antworten angeschaut und möchte dir meine Einschätzung geben...\n\n**Deine Stärke:** ...\n\n**Mein Vorschlag:** ...`}
            />
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={saveCoachNote}
                disabled={saving}
                className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? 'Speichern...' : 'Einschätzung speichern'}
              </button>
              {saveSuccess && (
                <span className="text-green-400 text-sm">Gespeichert!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  const newCount = submissions.filter(s => s.status === 'neu').length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-text-secondary">
              {submissions.length} Submissions
              {newCount > 0 && (
                <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                  {newCount} neu
                </span>
              )}
            </p>
          </div>
          <button onClick={handleLogout} className="text-text-secondary hover:text-text-primary transition-colors text-sm">
            Abmelden
          </button>
        </div>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">Noch keine Submissions</h2>
            <p className="text-text-secondary">Sobald jemand den Survey abschliesst, erscheint er hier.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => openDetail(sub)}
                className="w-full glass-card p-5 text-left hover:border-glass-border-hover transition-all flex items-center gap-4"
              >
                {/* Status dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  sub.status === 'neu' ? 'bg-blue-400' :
                  sub.status === 'angeschaut' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-text-primary">{sub.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[sub.status]?.color || ''}`}>
                      {STATUS_LABELS[sub.status]?.label || sub.status}
                    </span>
                    {sub.coach_note && (
                      <span className="text-green-400 text-xs">Einschätzung geschrieben</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm">
                    {sub.phone} · Wichtigkeit: {sub.answers?.[17] || '?'}/10
                  </p>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold gradient-text">{sub.score}%</div>
                  <div className="text-text-muted text-xs">{sub.score_label}</div>
                </div>

                {/* Date */}
                <div className="text-text-muted text-xs text-right flex-shrink-0 w-20">
                  {sub.created_at
                    ? new Date(sub.created_at).toLocaleDateString('de-CH')
                    : ''}
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
