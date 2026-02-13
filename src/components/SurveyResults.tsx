import type { FeedbackResult } from '../lib/feedback';

interface SurveyResultsProps {
  name: string;
  score: number;
  scoreLabel: string;
  feedback: FeedbackResult;
  personalLink: string;
  lang: 'de' | 'en';
  onRestart: () => void;
}

function ProximityRing({ score, label }: { score: number; label: string }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

export default function SurveyResults({
  name,
  score,
  scoreLabel,
  feedback,
  personalLink,
  lang,
  onRestart,
}: SurveyResultsProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(personalLink);
    const btn = document.getElementById('copy-btn');
    if (btn) {
      btn.textContent = lang === 'de' ? 'Kopiert!' : 'Copied!';
      setTimeout(() => {
        btn.textContent = lang === 'de' ? 'Link kopieren' : 'Copy link';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="heading-lg mb-4">{feedback.headline}</h1>
        </div>

        {/* Proximity Ring */}
        <div className="flex justify-center mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-card p-8">
            <ProximityRing score={score} label={scoreLabel} />
            <p className="text-center text-text-secondary mt-4 text-sm">
              {lang === 'de'
                ? 'Dein Proximity-Score zu deinem Ich 2.0'
                : 'Your proximity score to your Me 2.0'}
            </p>
          </div>
        </div>

        {/* Stärken-Karten */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-xl font-bold mb-4 text-center">
            {lang === 'de' ? 'Deine Stärken' : 'Your Strengths'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feedback.strengths.map((strength, i) => (
              <div key={i} className="glass-card p-6 border-l-4 border-green-500">
                <div className="text-2xl mb-2">{strength.icon}</div>
                <h3 className="font-bold text-green-400 mb-2">{strength.title}</h3>
                <p className="text-text-secondary text-sm">{strength.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fokus-Bereich */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-xl font-bold mb-4 text-center">
            {lang === 'de' ? 'Dein Fokus-Bereich' : 'Your Focus Area'}
          </h2>
          <div className="glass-card p-6 border-l-4 border-orange glow-orange">
            <div className="text-2xl mb-2">{feedback.focusArea.icon}</div>
            <h3 className="font-bold text-orange mb-2">{feedback.focusArea.title}</h3>
            <p className="text-text-secondary">{feedback.focusArea.description}</p>
          </div>
        </div>

        {/* Gratulation */}
        <div className="glass-card p-8 text-center mb-8 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <div className="text-4xl mb-4">🎉</div>
          <p className="text-lg text-text-primary font-medium mb-2">
            {feedback.congratsText}
          </p>
          <p className="text-text-secondary">
            {feedback.ctaText}
          </p>
        </div>

        {/* Persönlicher Link */}
        <div className="glass-card p-6 text-center mb-8 animate-fade-up" style={{ animationDelay: '1000ms' }}>
          <p className="text-text-secondary mb-3 text-sm">
            {lang === 'de'
              ? 'Dein persönlicher Link – hier siehst du bald Danis Einschätzung:'
              : "Your personal link – you'll soon see Dani's assessment here:"}
          </p>
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <code className="text-orange text-sm bg-surface px-3 py-2 rounded-lg break-all">
              {personalLink}
            </code>
            <button
              id="copy-btn"
              onClick={copyLink}
              className="btn-secondary text-sm !py-2 !px-4"
            >
              {lang === 'de' ? 'Link kopieren' : 'Copy link'}
            </button>
          </div>
        </div>

        {/* Restart */}
        <div className="text-center mt-8">
          <button onClick={onRestart} className="text-text-secondary hover:text-orange transition-colors text-sm">
            {lang === 'de' ? 'Survey neu starten' : 'Restart survey'}
          </button>
        </div>
      </div>
    </div>
  );
}
