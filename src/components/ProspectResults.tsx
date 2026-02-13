import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SurveySubmission } from '../lib/types';
import Markdown from 'react-markdown';

function ProximityRing({ score, label }: { score: number; label: string }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
          />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="url(#scoreGradientP)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
          <defs>
            <linearGradient id="scoreGradientP" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b00" />
              <stop offset="100%" stopColor="#ff8533" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold gradient-text">{score}%</span>
          <span className="text-sm text-text-secondary mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProspectResults() {
  const [submission, setSubmission] = useState<SurveySubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setError('Kein Token gefunden.');
      setLoading(false);
      return;
    }

    async function fetchSubmission() {
      const { data, error: fetchError } = await supabase
        .from('survey_submissions')
        .select('*')
        .eq('token', token)
        .single();

      if (fetchError || !data) {
        setError('Ergebnis nicht gefunden.');
        setLoading(false);
        return;
      }

      setSubmission(data as SurveySubmission);
      setLoading(false);
    }

    fetchSubmission();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Link ungültig</h2>
          <p className="text-text-secondary">{error || 'Etwas ist schiefgelaufen.'}</p>
          <a href="/" className="btn-primary mt-6 inline-block">Zur Startseite</a>
        </div>
      </div>
    );
  }

  const lang = submission.language || 'de';

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading-lg mb-4">
            {lang === 'de'
              ? `Hey ${submission.name}! Dein Ich 2.0 Ergebnis`
              : `Hey ${submission.name}! Your Me 2.0 Result`}
          </h1>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-10">
          <div className="glass-card p-8">
            <ProximityRing score={submission.score} label={submission.score_label} />
            <p className="text-center text-text-secondary mt-4 text-sm">
              {lang === 'de'
                ? 'Dein Proximity-Score zu deinem Ich 2.0'
                : 'Your proximity score to your Me 2.0'}
            </p>
          </div>
        </div>

        {/* Stärken */}
        {submission.strengths && submission.strengths.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">
              {lang === 'de' ? 'Deine Stärken' : 'Your Strengths'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submission.strengths.map((strength, i) => (
                <div key={i} className="glass-card p-6 border-l-4 border-green-500">
                  <p className="text-text-primary">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fokus-Bereich */}
        {submission.focus_area && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">
              {lang === 'de' ? 'Dein Fokus-Bereich' : 'Your Focus Area'}
            </h2>
            <div className="glass-card p-6 border-l-4 border-orange glow-orange">
              <p className="text-text-primary">{submission.focus_area}</p>
            </div>
          </div>
        )}

        {/* Coach Note */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">
            {lang === 'de' ? 'Danis persönliche Einschätzung' : "Dani's Personal Assessment"}
          </h2>
          {submission.coach_note ? (
            <div className="glass-card p-8 border-l-4 border-orange">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold">
                  DP
                </div>
                <div>
                  <p className="font-bold text-text-primary">Daniele Pauli</p>
                  <p className="text-text-secondary text-sm">
                    {lang === 'de' ? 'Dein Coach' : 'Your Coach'}
                  </p>
                </div>
              </div>
              <div className="prose prose-invert prose-orange max-w-none text-text-secondary [&_p]:mb-3 [&_strong]:text-text-primary [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
                <Markdown>{submission.coach_note}</Markdown>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">
                {lang === 'de'
                  ? 'Dani bereitet deine persönliche Einschätzung vor...'
                  : 'Dani is preparing your personal assessment...'}
              </p>
              <p className="text-text-muted text-sm mt-2">
                {lang === 'de'
                  ? 'Schau bald wieder vorbei – es lohnt sich!'
                  : "Check back soon – it'll be worth it!"}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 text-center glow-orange">
          <h3 className="text-lg font-bold mb-4">
            {lang === 'de'
              ? 'Bereit für dein Strategiegespräch?'
              : 'Ready for your strategy call?'}
          </h3>
          <a
            href="https://calendly.com/danielepauli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {lang === 'de' ? 'Termin buchen' : 'Book appointment'}
          </a>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <a href="/" className="text-text-secondary hover:text-orange transition-colors text-sm">
            {lang === 'de' ? '← Zurück zur Startseite' : '← Back to homepage'}
          </a>
        </div>
      </div>
    </div>
  );
}
