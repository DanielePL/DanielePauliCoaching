import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateScoreWithIndices } from '../lib/scoring';
import { generateFeedback } from '../lib/feedback';
import type { FeedbackResult } from '../lib/feedback';
import SurveyResults from './SurveyResults';

type Language = 'de' | 'en';

interface Question {
  q: string;
  options: string[];
  multiple?: boolean;
  scale?: boolean;
}

const translations = {
  de: {
    title: "Dein Ich 2.0 Check",
    subtitle: "Finde heraus, wo du stehst – und wie dein Ich 2.0 wirklich aussieht.",
    intro: "Willkommen zu deinem persönlichen Tauchgang. In wenigen Minuten erfährst du, wo du aktuell stehst, was dich zurückhält und was du brauchst, um dein Ich 2.0 zu erreichen. Sei ehrlich – du machst das für dich.",
    nameQuestion: {
      q: "Wie heißt du?",
      placeholder: "Dein Vorname",
      subtext: "Damit ich dich persönlich ansprechen kann"
    },
    next: "Weiter",
    back: "Zurück",
    finish: "Ergebnis anzeigen",
    phases: ["IST-ZUSTAND", "VERGANGENHEIT", "SOLL-ZUSTAND", "COMMITMENT", "REALITY CHECK"],
    questions: [
      // PHASE 1: IST-ZUSTAND (4 Fragen)
      {
        q: "Wie fühlst du dich aktuell körperlich und mental?",
        options: [
          "Energielos, unzufrieden, ohne Richtung",
          "Solide, aber nicht wirklich zufrieden",
          "Fit, will aber mehr Struktur",
          "Stark und stabil, will den nächsten Schritt"
        ]
      },
      {
        q: "Was hindert dich derzeit, dein Potenzial voll zu entfalten? (Mehrfachauswahl möglich)",
        options: [
          "Fehlende Energie",
          "Keine klare Struktur",
          "Selbstzweifel oder Motivation",
          "Zu wenig Zeit",
          "Verletzungen oder Überlastung"
        ],
        multiple: true
      },
      {
        q: "Wie stabil fühlst du dich aktuell in Beruf, Gesundheit und Umfeld?",
        options: [
          "Unsicher – vieles wackelt",
          "Schwankend – mal gut, mal schlecht",
          "Stabil – es läuft, aber da geht mehr",
          "Sehr stabil – ich will wachsen"
        ]
      },
      {
        q: "Wenn du genauso weitermachst wie bisher – wo stehst du in 12 Monaten?",
        options: [
          "Am selben Punkt",
          "Etwas besser, aber nicht dort, wo ich sein will",
          "Spürbar weiter",
          "Auf meinem persönlichen Top-Level"
        ]
      },
      // PHASE 2: VERGANGENHEIT (3 Fragen)
      {
        q: "Hast du schon früher versucht, dein Training oder deine Gesundheit zu verbessern?",
        options: [
          "Nein, das ist mein erster Versuch",
          "Ja, 1-2 Mal",
          "Ja, mehrmals",
          "Ja, viele Male – ich kenne das Muster"
        ]
      },
      {
        q: "Was war der Hauptgrund, warum es nicht funktioniert hat?",
        options: [
          "Keine Struktur oder klarer Plan",
          "Fehlende Motivation nach den ersten Wochen",
          "Zu viel auf einmal, dann Überforderung",
          "Keine Accountability – niemand hat mich in die Pflicht genommen",
          "Trifft nicht zu – ich habe noch nie angefangen"
        ]
      },
      {
        q: "Was denkst du, wie viel Zeit brauchst du, um dein Ziel zu erreichen?",
        options: [
          "3–6 Monate",
          "6–12 Monate",
          "1–2 Jahre",
          "Keine Ahnung – ich brauche Orientierung"
        ]
      },
      // PHASE 3: SOLL-ZUSTAND (3 Fragen)
      {
        q: "Wie sieht dein Ich 2.0 aus? (Mehrfachauswahl möglich)",
        options: [
          "Gesund und schmerzfrei",
          "Stark und leistungsfähig",
          "Attraktiv und athletisch",
          "Mental ruhig und fokussiert",
          "Diszipliniert und strukturiert",
          "Erfolgreich im Beruf und Training",
          "Ausgeglichen mit stabilem Energielevel"
        ],
        multiple: true
      },
      {
        q: "Was bedeutet dieses Ziel wirklich für dich? (Mehrfachauswahl möglich)",
        options: [
          "Sicherheit",
          "Freiheit",
          "Anerkennung",
          "Selbstrespekt",
          "Ruhe und Gelassenheit"
        ],
        multiple: true
      },
      {
        q: "Hast du einen Plan, wie du dein Ziel halten kannst, wenn du es erreicht hast?",
        options: [
          "Ja, ich habe eine klare Vorstellung",
          "Teilweise – ich weiß, dass Erhalt wichtig ist",
          "Nein – ich fokussiere mich erst auf das Erreichen",
          "Keine Ahnung – das habe ich noch nie geschafft"
        ]
      },
      // PHASE 4: COMMITMENT (8 Fragen)
      {
        q: "Bist du bereit, dein Leben zu organisieren und Prioritäten zu setzen?",
        options: [
          "Ja, absolut – ich bin bereit, Dinge zu streichen",
          "Ja, aber es wird schwierig",
          "Ich weiß es nicht – ich habe viele Verpflichtungen",
          "Nein – ich will es irgendwie nebenbei machen"
        ]
      },
      {
        q: "Wie gehst du mit kritischem Feedback um?",
        options: [
          "Ich schätze ehrliches Feedback – es hilft mir",
          "Ich kann damit umgehen, auch wenn es unangenehm ist",
          "Ich bin manchmal sensibel, aber lernfähig",
          "Ich habe Mühe mit Kritik"
        ]
      },
      {
        q: "Wie wichtig ist dir Accountability (dass jemand dich in die Pflicht nimmt)?",
        options: [
          "Sehr wichtig – ich brauche das",
          "Wichtig – es hilft mir dranzubleiben",
          "Etwas wichtig – ich bin meist selbstmotiviert",
          "Nicht wichtig – ich mache es sowieso"
        ]
      },
      {
        q: "Wie effizient soll deine zukünftige Top-Strategie sein?",
        options: [
          "Effizient",
          "Sehr effizient",
          "So effizient wie möglich",
          "Die bestmögliche, individuellste Strategie"
        ]
      },
      {
        q: "Bist du bereit, jetzt wirklich alles herauszuholen, um dein Ich 2.0 zu erreichen?",
        options: [
          "Ja, ich bin bereit",
          "Ich brauche klare Struktur",
          "Ich bin noch unsicher"
        ]
      },
      {
        q: "Wie viel Zeit kannst du pro Woche realistisch investieren?",
        options: [
          "2 Stunden",
          "3–5 Stunden",
          "6–8 Stunden",
          "Mehr als 8 Stunden"
        ]
      },
      {
        q: "Und wie viel Zeit investierst du aktuell pro Woche in dein Ziel?",
        options: [
          "0 Stunden – noch nichts, dieses Ziel ist neu",
          "1–2 Stunden",
          "3–5 Stunden",
          "Mehr als 5 Stunden"
        ]
      },
      {
        q: "Wie wichtig ist dir dein Ziel auf einer Skala von 1 bis 10?",
        options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        scale: true
      },
      // PHASE 5: REALITY CHECK (3 Fragen)
      {
        q: "Was passiert in 2 Jahren, wenn du nichts änderst?",
        options: [
          "Ich bleibe wo ich bin – frustriert",
          "Es wird wahrscheinlich schlechter",
          "Ich weiß es nicht",
          "Ich will nicht darüber nachdenken"
        ]
      },
      {
        q: "Was ist der wahre Grund, warum du JETZT anfangen willst?",
        options: [
          "Ich habe genug – es reicht",
          "Ich will endlich das Leben führen, das ich verdiene",
          "Gesundheit – ich spüre, dass ich handeln muss",
          "Ich will beweisen, dass ich es kann"
        ]
      },
      {
        q: "Welches monatliche Investment wäre für dich realistisch?",
        options: [
          "CHF 150–350",
          "CHF 500",
          "CHF 750",
          "Mehr als CHF 1000",
          "Ich bin aktuell nicht bereit zu investieren"
        ]
      }
    ] as Question[],
    phoneQuestion: {
      q: "Fast geschafft! Wo soll ich dir deine persönliche Analyse schicken?",
      placeholder: "+41 79 123 45 67",
      subtext: "Ich schicke dir deine IST/SOLL-Analyse + erste Schritte direkt per WhatsApp",
      privacy: "Deine Nummer wird nur für das Strategiegespräch verwendet."
    },
    result: {
      title: "Dein persönliches Ergebnis",
      text1: "Du hast erkannt, wo du stehst – und wie dein Ich 2.0 aussieht.",
      text2: "Das ist der erste Schritt in Richtung deines neuen Standards.",
      cta: "Jetzt ist der richtige Moment, tiefer zu gehen.",
      button: "Jetzt WhatsApp öffnen",
      secondary: "Ich melde mich in den nächsten 24h bei dir"
    }
  },
  en: {
    title: "Your Me 2.0 Check",
    subtitle: "Discover where you stand – and what your Me 2.0 really looks like.",
    intro: "Welcome to your personal deep dive. In just a few minutes, you'll learn where you currently stand, what's holding you back, and what you need to reach your Me 2.0. Be honest – you're doing this for yourself.",
    nameQuestion: {
      q: "What's your name?",
      placeholder: "Your first name",
      subtext: "So I can address you personally"
    },
    next: "Next",
    back: "Back",
    finish: "Show Results",
    phases: ["CURRENT STATE", "PAST", "TARGET STATE", "COMMITMENT", "REALITY CHECK"],
    questions: [
      {
        q: "How do you currently feel physically and mentally?",
        options: [
          "Drained, unsatisfied, without direction",
          "Solid, but not really satisfied",
          "Fit, but want more structure",
          "Strong and stable, ready for the next step"
        ]
      },
      {
        q: "What's currently holding you back? (Multiple selection)",
        options: [
          "Lack of energy",
          "No clear structure",
          "Self-doubt or motivation",
          "Not enough time",
          "Injuries or overload"
        ],
        multiple: true
      },
      {
        q: "How stable do you feel in your career, health, and environment?",
        options: [
          "Unstable – many things are shaky",
          "Fluctuating – sometimes good, sometimes bad",
          "Stable – it's working, but there's more",
          "Very stable – I want to grow"
        ]
      },
      {
        q: "If you continue as you are – where will you be in 12 months?",
        options: [
          "At the same point",
          "Somewhat better, but not where I want to be",
          "Noticeably further",
          "At my personal top level"
        ]
      },
      {
        q: "Have you tried improving your training or health before?",
        options: [
          "No, this is my first attempt",
          "Yes, 1-2 times",
          "Yes, multiple times",
          "Yes, many times – I know the pattern"
        ]
      },
      {
        q: "What was the main reason it didn't work?",
        options: [
          "No structure or clear plan",
          "Lack of motivation after the first weeks",
          "Too much at once, then overwhelmed",
          "No accountability",
          "Doesn't apply – I've never started"
        ]
      },
      {
        q: "How much time do you think you need to reach your goal?",
        options: [
          "3–6 months",
          "6–12 months",
          "1–2 years",
          "No idea – I need guidance"
        ]
      },
      {
        q: "What does your Me 2.0 look like? (Multiple selection)",
        options: [
          "Healthy and pain-free",
          "Strong and capable",
          "Attractive and athletic",
          "Mentally calm and focused",
          "Disciplined and structured",
          "Successful in career and training",
          "Balanced with stable energy levels"
        ],
        multiple: true
      },
      {
        q: "What does this goal really mean to you? (Multiple selection)",
        options: [
          "Security",
          "Freedom",
          "Recognition",
          "Self-respect",
          "Peace and calmness"
        ],
        multiple: true
      },
      {
        q: "Do you have a plan for maintaining your goal once you reach it?",
        options: [
          "Yes, I have a clear vision",
          "Partially – I know maintenance is important",
          "No – I'm focusing on reaching it first",
          "No idea – I've never achieved this before"
        ]
      },
      {
        q: "Are you ready to organize your life and set priorities?",
        options: [
          "Yes, absolutely – I'm ready to cut things out",
          "Yes, but it will be difficult",
          "I don't know – I have many obligations",
          "No – I want to do it on the side"
        ]
      },
      {
        q: "How do you handle critical feedback?",
        options: [
          "I appreciate honest feedback – it helps me",
          "I can handle it, even when uncomfortable",
          "I'm sometimes sensitive, but willing to learn",
          "I struggle with criticism"
        ]
      },
      {
        q: "How important is accountability to you?",
        options: [
          "Very important – I need that",
          "Important – it helps me stay on track",
          "Somewhat important – I'm usually self-motivated",
          "Not important – I'll do it anyway"
        ]
      },
      {
        q: "How efficient should your future strategy be?",
        options: [
          "Efficient",
          "Very efficient",
          "As efficient as possible",
          "The best possible, most individualized strategy"
        ]
      },
      {
        q: "Are you ready to give your all to reach your Me 2.0?",
        options: [
          "Yes, I'm ready",
          "I need clear structure",
          "I'm still uncertain"
        ]
      },
      {
        q: "How much time can you realistically invest per week?",
        options: [
          "2 hours",
          "3–5 hours",
          "6–8 hours",
          "More than 8 hours"
        ]
      },
      {
        q: "How much time are you currently investing per week?",
        options: [
          "0 hours – nothing yet, this goal is new",
          "1–2 hours",
          "3–5 hours",
          "More than 5 hours"
        ]
      },
      {
        q: "How important is your goal on a scale from 1 to 10?",
        options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        scale: true
      },
      {
        q: "What happens in 2 years if you don't change anything?",
        options: [
          "I stay where I am – frustrated",
          "It will probably get worse",
          "I don't know",
          "I don't want to think about it"
        ]
      },
      {
        q: "What's the real reason you want to start NOW?",
        options: [
          "I've had enough – that's it",
          "I finally want to live the life I deserve",
          "Health – I feel I must act",
          "I want to prove I can do it"
        ]
      },
      {
        q: "What monthly investment would be realistic for you?",
        options: [
          "$165–385",
          "$550",
          "$825",
          "More than $1100",
          "I'm not ready to invest monthly"
        ]
      }
    ] as Question[],
    phoneQuestion: {
      q: "Almost done! Where should I send your personalized analysis?",
      placeholder: "+41 79 123 45 67",
      subtext: "I'll send you your analysis + first steps via WhatsApp",
      privacy: "Your number will only be used for the strategy call."
    },
    result: {
      title: "Your Personal Result",
      text1: "You've recognized where you stand – and what your Me 2.0 looks like.",
      text2: "This is the first step towards your new standard.",
      cta: "Now is the right moment to go deeper.",
      button: "Open WhatsApp now",
      secondary: "I'll reach out within 24 hours"
    }
  }
};

const STORAGE_KEY = 'survey_progress';

export default function Survey() {
  const [lang, setLang] = useState<Language>('de');
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultData, setResultData] = useState<{
    score: number;
    scoreLabel: string;
    feedback: FeedbackResult;
    personalLink: string;
  } | null>(null);

  const t = translations[lang];
  const totalSteps = t.questions.length + 2; // +1 for name, +1 for phone
  const progress = ((step + 1) / totalSteps) * 100;

  const isNameStep = step === 0;
  const isPhoneStep = step === t.questions.length + 1;
  const currentQuestion = !isNameStep && !isPhoneStep ? t.questions[step - 1] : null;
  const isMultiple = currentQuestion?.multiple;
  const isScale = currentQuestion?.scale;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.name) setName(data.name);
        if (data.answers) setAnswers(data.answers);
        if (data.step) setStep(data.step);
        if (data.lang) setLang(data.lang);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
      } catch (e) {
        console.error('Failed to load progress');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded && !showResult) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name, answers, step, lang, phoneNumber
      }));
    }
  }, [name, answers, step, lang, phoneNumber, isLoaded, showResult]);

  const handleAnswer = (value: string) => {
    const questionIndex = step - 1;
    if (isMultiple) {
      const current = (answers[questionIndex] as string[]) || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [questionIndex]: newValue });
    } else {
      setAnswers({ ...answers, [questionIndex]: value });
    }
  };

  const canProceed = () => {
    if (isNameStep) return name.trim().length >= 2;
    if (isPhoneStep) {
      const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
      return phoneRegex.test(phoneNumber);
    }
    const questionIndex = step - 1;
    if (isMultiple) {
      return ((answers[questionIndex] as string[]) || []).length > 0;
    }
    return answers[questionIndex] !== undefined;
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setIsSubmitting(true);

      // Calculate score using DE questions (scoring is language-independent by index)
      const deQuestions = translations.de.questions;
      const scoreResult = calculateScoreWithIndices(answers, deQuestions);

      // Generate feedback
      const feedback = generateFeedback(name, scoreResult.score, answers, deQuestions, lang);

      // Generate unique token
      const token = crypto.randomUUID();
      const siteUrl = window.location.origin;
      const personalLink = `${siteUrl}/ergebnis/?token=${token}`;

      // Save to Supabase
      try {
        await supabase.from('survey_submissions').insert({
          name,
          phone: phoneNumber,
          language: lang,
          answers,
          score: scoreResult.score,
          score_label: lang === 'de' ? scoreResult.label : scoreResult.labelEn,
          token,
          status: 'neu',
          coach_note: null,
          strengths: feedback.strengths.map(s => `${s.icon} ${s.title}: ${s.description}`),
          focus_area: `${feedback.focusArea.icon} ${feedback.focusArea.title}: ${feedback.focusArea.description}`,
        });
      } catch (err) {
        console.error('Failed to save to Supabase:', err);
      }

      setResultData({
        score: scoreResult.score,
        scoreLabel: lang === 'de' ? scoreResult.label : scoreResult.labelEn,
        feedback,
        personalLink,
      });
      setIsSubmitting(false);
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const getPhaseIndex = () => {
    if (step === 0) return 0;
    if (step <= 4) return 0; // IST
    if (step <= 7) return 1; // VERGANGENHEIT
    if (step <= 10) return 2; // SOLL
    if (step <= 18) return 3; // COMMITMENT
    return 4; // REALITY CHECK
  };

  const resetSurvey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStep(0);
    setName('');
    setAnswers({});
    setPhoneNumber('');
    setShowResult(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Submitting state
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {lang === 'de' ? 'Dein Ergebnis wird berechnet...' : 'Calculating your result...'}
          </p>
        </div>
      </div>
    );
  }

  // Results View
  if (showResult && resultData) {
    return (
      <SurveyResults
        name={name}
        score={resultData.score}
        scoreLabel={resultData.scoreLabel}
        feedback={resultData.feedback}
        personalLink={resultData.personalLink}
        lang={lang}
        onRestart={resetSurvey}
      />
    );
  }

  // Survey View
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.back}
          </a>
          <button
            onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            {lang === 'de' ? 'EN' : 'DE'}
          </button>
        </div>

        {/* Title (only on first step) */}
        {isNameStep && (
          <div className="text-center mb-12">
            <h1 className="heading-lg mb-4">{t.title}</h1>
            <p className="text-xl text-orange mb-4">{t.subtitle}</p>
            <p className="text-text-secondary">{t.intro}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>{t.phases[getPhaseIndex()]}</span>
            <span>{step + 1} / {totalSteps}</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange to-orange-light rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card p-8">
          {/* Name Step */}
          {isNameStep && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.nameQuestion.q}</h2>
              <p className="text-text-secondary mb-6">{t.nameQuestion.subtext}</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.nameQuestion.placeholder}
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          )}

          {/* Phone Step */}
          {isPhoneStep && (
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.phoneQuestion.q}</h2>
              <p className="text-text-secondary mb-6">{t.phoneQuestion.subtext}</p>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t.phoneQuestion.placeholder}
                className="w-full p-4 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              />
              <p className="text-text-muted text-sm mt-4">{t.phoneQuestion.privacy}</p>
            </div>
          )}

          {/* Scale Question */}
          {isScale && currentQuestion && (
            <div>
              <h2 className="text-2xl font-bold mb-8">{currentQuestion.q}</h2>
              <div className="mb-8">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={answers[step - 1] || 5}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full h-3 bg-surface rounded-full appearance-none cursor-pointer accent-orange"
                />
                <div className="flex justify-between mt-2 text-text-secondary text-sm">
                  {currentQuestion.options.map((opt) => (
                    <span key={opt} className={answers[step - 1] === opt ? 'text-orange font-bold' : ''}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <span className="text-6xl font-bold gradient-text">
                  {answers[step - 1] || 5}
                </span>
              </div>
            </div>
          )}

          {/* Regular Questions */}
          {!isNameStep && !isPhoneStep && !isScale && currentQuestion && (
            <div>
              <h2 className="text-2xl font-bold mb-8">{currentQuestion.q}</h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const questionIndex = step - 1;
                  const isSelected = isMultiple
                    ? ((answers[questionIndex] as string[]) || []).includes(option)
                    : answers[questionIndex] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'border-orange bg-orange/10 text-text-primary'
                          : 'border-glass-border bg-surface/50 text-text-secondary hover:border-glass-border-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-orange bg-orange' : 'border-text-muted'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
                step === 0
                  ? 'text-text-muted cursor-not-allowed'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t.back}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`btn-primary ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {step === totalSteps - 1 ? t.finish : t.next}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress saved indicator */}
        <p className="text-center text-text-muted text-sm mt-6">
          {lang === 'de' ? '✓ Fortschritt wird automatisch gespeichert' : '✓ Progress is saved automatically'}
        </p>
      </div>
    </div>
  );
}
