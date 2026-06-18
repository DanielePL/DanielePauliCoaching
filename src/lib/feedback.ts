/**
 * Personalisiertes Feedback generieren (DE/EN)
 *
 * Basierend auf den Survey-Antworten werden Stärken und ein Fokus-Bereich identifiziert.
 */

type Language = 'de' | 'en';

export interface FeedbackResult {
  headline: string;
  strengths: { title: string; description: string; icon: string }[];
  deepDriver: { title: string; description: string; icon: string } | null;
  focusArea: { title: string; description: string; icon: string };
  congratsText: string;
  ctaText: string;
}

// Hilfsfunktion: gewählte Options-Indizes einer (Multi-)Antwort ermitteln
function selectedIndices(
  answer: string | string[] | undefined,
  options: string[]
): number[] {
  if (answer === undefined) return [];
  const arr = Array.isArray(answer) ? answer : [answer];
  return arr.map((a) => options.indexOf(a)).filter((i) => i >= 0);
}

// Stärken-Erkennung basierend auf Antwort-Indizes
interface StrengthRule {
  questionIndex: number;
  optionIndices: number[]; // Welche Optionen diese Stärke auslösen
  de: { title: string; description: string };
  en: { title: string; description: string };
  icon: string;
}

const STRENGTH_RULES: StrengthRule[] = [
  // Guter aktueller Zustand
  {
    questionIndex: 0,
    optionIndices: [2, 3],
    de: { title: 'Starkes Fundament', description: 'Du startest nicht bei Null – dein Körper und Geist sind bereit für das nächste Level.' },
    en: { title: 'Strong Foundation', description: "You're not starting from zero – your body and mind are ready for the next level." },
    icon: '💪',
  },
  // Stabilität
  {
    questionIndex: 2,
    optionIndices: [2, 3],
    de: { title: 'Innere Stabilität', description: 'Du hast eine stabile Basis in Beruf und Umfeld – das ist die perfekte Grundlage für Wachstum.' },
    en: { title: 'Inner Stability', description: 'You have a stable foundation in career and environment – the perfect base for growth.' },
    icon: '🏔️',
  },
  // Erfahrung mit Versuchen
  {
    questionIndex: 4,
    optionIndices: [2, 3],
    de: { title: 'Wertvolle Erfahrung', description: 'Deine bisherigen Versuche waren nicht umsonst – du weisst jetzt, was NICHT funktioniert. Das ist Gold wert.' },
    en: { title: 'Valuable Experience', description: "Your previous attempts weren't wasted – you now know what DOESN'T work. That's invaluable." },
    icon: '🎯',
  },
  // Erhaltungsplan
  {
    questionIndex: 10,
    optionIndices: [0, 1],
    de: { title: 'Langfristiges Denken', description: 'Du denkst bereits an Nachhaltigkeit – das unterscheidet dich von 90% der Menschen.' },
    en: { title: 'Long-term Thinking', description: 'You already think about sustainability – that sets you apart from 90% of people.' },
    icon: '🧠',
  },
  // Prioritäten setzen
  {
    questionIndex: 11,
    optionIndices: [0, 1],
    de: { title: 'Klare Prioritäten', description: 'Du bist bereit, Dinge zu verändern und neu zu ordnen. Das zeigt echtes Commitment.' },
    en: { title: 'Clear Priorities', description: "You're ready to change things and reorganize. That shows real commitment." },
    icon: '🔥',
  },
  // Umgang mit Feedback
  {
    questionIndex: 12,
    optionIndices: [0, 1],
    de: { title: 'Coachable', description: 'Du bist offen für ehrliches Feedback – die wichtigste Eigenschaft für echte Transformation.' },
    en: { title: 'Coachable', description: "You're open to honest feedback – the most important trait for real transformation." },
    icon: '🤝',
  },
  // Accountability
  {
    questionIndex: 13,
    optionIndices: [0, 1],
    de: { title: 'Verantwortungsbewusstsein', description: 'Du verstehst den Wert von Accountability – mit der richtigen Unterstützung bist du unstoppbar.' },
    en: { title: 'Accountability Mindset', description: 'You understand the value of accountability – with the right support, you\'re unstoppable.' },
    icon: '⚡',
  },
  // Bereit alles zu geben
  {
    questionIndex: 14,
    optionIndices: [0],
    de: { title: 'Volle Bereitschaft', description: 'Deine Entschlossenheit ist spürbar. Das ist genau die Energie, die den Unterschied macht.' },
    en: { title: 'Full Commitment', description: 'Your determination is palpable. That\'s exactly the energy that makes the difference.' },
    icon: '🚀',
  },
  // Zeitinvestment
  {
    questionIndex: 15,
    optionIndices: [2, 3],
    de: { title: 'Zeitinvestment', description: 'Du bist bereit, die nötige Zeit zu investieren – das zeigt, wie ernst es dir ist.' },
    en: { title: 'Time Investment', description: "You're ready to invest the necessary time – that shows how serious you are." },
    icon: '⏱️',
  },
];

// Fokus-Bereiche (was Coaching verbessern kann)
interface FocusRule {
  questionIndex: number;
  optionIndices: number[];
  de: { title: string; description: string };
  en: { title: string; description: string };
  icon: string;
  priority: number;
}

const FOCUS_RULES: FocusRule[] = [
  {
    questionIndex: 5,
    optionIndices: [0],
    de: { title: 'Struktur & System', description: 'Dir fehlt ein klarer Plan – genau das liefert ein personalisiertes Coaching-System.' },
    en: { title: 'Structure & System', description: "You lack a clear plan – that's exactly what a personalized coaching system provides." },
    icon: '📋',
    priority: 1,
  },
  {
    questionIndex: 5,
    optionIndices: [1],
    de: { title: 'Langfristige Motivation', description: 'Der Anfang klappt, aber danach wird es schwer – mit dem richtigen System bleibt der Drive.' },
    en: { title: 'Long-term Motivation', description: 'You start strong but struggle to maintain – with the right system, the drive stays.' },
    icon: '🔋',
    priority: 2,
  },
  {
    questionIndex: 5,
    optionIndices: [3],
    de: { title: 'Accountability & Begleitung', description: 'Du brauchst jemanden, der dich in die Pflicht nimmt – genau das macht ein Coach.' },
    en: { title: 'Accountability & Guidance', description: 'You need someone to hold you accountable – that\'s exactly what a coach does.' },
    icon: '🎯',
    priority: 1,
  },
  {
    questionIndex: 11,
    optionIndices: [2, 3],
    de: { title: 'Prioritäten-Management', description: 'Zeit und Prioritäten neu ordnen – gemeinsam finden wir Raum für deine Transformation.' },
    en: { title: 'Priority Management', description: "Reorganizing time and priorities – together we'll find space for your transformation." },
    icon: '⚖️',
    priority: 3,
  },
  {
    questionIndex: 10,
    optionIndices: [2, 3],
    de: { title: 'Nachhaltigkeits-Strategie', description: 'Ein Plan für danach fehlt noch – das ist der Schlüssel zu dauerhaften Ergebnissen.' },
    en: { title: 'Sustainability Strategy', description: "A plan for after is still missing – that's the key to lasting results." },
    icon: '🔄',
    priority: 2,
  },
];

// "Warum unterm Warum" — der tiefere Treiber (Frage 8: "Was bedeutet dieses Ziel wirklich für dich?")
// Index = Options-Index in Frage 8. Priorität = welcher Treiber als "tiefster" gespiegelt wird.
const DRIVER_INTERPRETATIONS: Record<number, { de: { title: string; description: string }; en: { title: string; description: string }; icon: string }> = {
  0: {
    de: { title: 'Sicherheit', description: 'Im Kern suchst du festen Boden – Stabilität, auf die du dich verlassen kannst, egal was im Aussen passiert.' },
    en: { title: 'Security', description: 'At your core you seek solid ground – stability you can rely on, no matter what happens around you.' },
    icon: '🛡️',
  },
  1: {
    de: { title: 'Freiheit', description: 'Dich treibt Unabhängigkeit – du willst nicht länger von Müdigkeit, Schmerz oder alten Mustern ausgebremst werden.' },
    en: { title: 'Freedom', description: "You're driven by independence – you no longer want to be held back by fatigue, pain or old patterns." },
    icon: '🕊️',
  },
  2: {
    de: { title: 'Anerkennung', description: 'Du willst gesehen werden – für das, was du leistest, und für den Mann, der du bist.' },
    en: { title: 'Recognition', description: 'You want to be seen – for what you achieve and for who you are.' },
    icon: '🌟',
  },
  3: {
    de: { title: 'Selbstrespekt', description: 'Es geht im Tiefsten um dich selbst – wieder stolz auf den zu sein, der dir morgens im Spiegel begegnet.' },
    en: { title: 'Self-Respect', description: 'Deep down this is about you – being proud again of the person who meets you in the mirror each morning.' },
    icon: '🪞',
  },
  4: {
    de: { title: 'Ruhe & Gelassenheit', description: 'Du sehnst dich nach innerer Ruhe – weniger Lärm im Kopf, mehr Klarheit im Alltag.' },
    en: { title: 'Peace & Calm', description: 'You long for inner calm – less noise in your head, more clarity in everyday life.' },
    icon: '🌊',
  },
};
// Reihenfolge der "Tiefe": intrinsische Treiber zuerst
const DRIVER_PRIORITY = [3, 1, 4, 0, 2];

// Q8-Optionen pro Sprache – damit der Treiber auch ohne Fragen-Array (z.B. auf /ergebnis) ableitbar ist
const DRIVER_Q8_OPTIONS: Record<Language, string[]> = {
  de: ['Sicherheit', 'Freiheit', 'Anerkennung', 'Selbstrespekt', 'Ruhe und Gelassenheit'],
  en: ['Security', 'Freedom', 'Recognition', 'Self-respect', 'Peace and calmness'],
};

/**
 * Tieferen Treiber ("Warum unterm Warum") aus den gespeicherten Antworten ableiten.
 * Nutzt die sprachspezifischen Q8-Optionen, funktioniert daher auch auf der /ergebnis-Seite,
 * wo nur die rohen Antworten + die Sprache vorliegen.
 */
export function getDeepDriver(
  answers: Record<number, string | string[]>,
  lang: Language
): { title: string; description: string; icon: string } | null {
  const sel = selectedIndices(answers[8], DRIVER_Q8_OPTIONS[lang]);
  const idx = DRIVER_PRIORITY.find((i) => sel.includes(i));
  if (idx === undefined) return null;
  const src = DRIVER_INTERPRETATIONS[idx]!;
  return { title: src[lang].title, description: src[lang].description, icon: src.icon };
}

// "Wo wir ansetzen" — abgeleitet aus dem #1-Blocker (Frage 1: "Was hindert dich?")
// Index = Options-Index in Frage 1.
const BLOCKER_FOCUS: Record<number, { de: { title: string; description: string }; en: { title: string; description: string }; icon: string }> = {
  0: {
    de: { title: 'Energie zuerst', description: 'Energie ist dein Engpass – genau hier setzen wir zuerst an, weil Training, Ernährung und Fokus darauf aufbauen.' },
    en: { title: 'Energy First', description: 'Energy is your bottleneck – that\'s where we start, because training, nutrition and focus all build on it.' },
    icon: '🔋',
  },
  1: {
    de: { title: 'Struktur & System', description: 'Dir fehlt das System, nicht der Wille – ein klarer, persönlicher Plan ist dein erster Hebel.' },
    en: { title: 'Structure & System', description: 'You lack the system, not the will – a clear, personal plan is your first lever.' },
    icon: '📋',
  },
  2: {
    de: { title: 'Kopf & Dranbleiben', description: 'Der Kopf bremst, nicht der Körper – wir bauen zuerst Vertrauen und ein System, das auch ohne Tagesform-Motivation trägt.' },
    en: { title: 'Mind & Consistency', description: 'Your head brakes, not your body – we first build confidence and a system that holds even on low-motivation days.' },
    icon: '🧠',
  },
  3: {
    de: { title: 'Zeit & Prioritäten', description: 'Zeit ist eng – also bauen wir einen Plan, der in dein echtes Leben passt, nicht daneben.' },
    en: { title: 'Time & Priorities', description: 'Time is tight – so we build a plan that fits into your real life, not next to it.' },
    icon: '⏳',
  },
  4: {
    de: { title: 'Schmerzfrei & belastbar', description: 'Dein Körper sendet Warnsignale – wir starten schmerzfrei und belastbar, bevor wir Gas geben.' },
    en: { title: 'Pain-Free & Resilient', description: 'Your body is sending warning signs – we start pain-free and resilient before pushing the pace.' },
    icon: '🩹',
  },
};
// Reihenfolge: Sicherheit/Gesundheit zuerst, dann Fundament, dann Feinjustierung
const BLOCKER_PRIORITY = [4, 0, 2, 1, 3];

export function generateFeedback(
  name: string,
  score: number,
  answers: Record<number, string | string[]>,
  questions: { options: string[] }[],
  lang: Language
): FeedbackResult {
  // Stärken identifizieren
  const matchedStrengths: typeof STRENGTH_RULES = [];
  for (const rule of STRENGTH_RULES) {
    const answer = answers[rule.questionIndex];
    if (answer === undefined || Array.isArray(answer)) continue;

    const optionIndex = questions[rule.questionIndex]?.options.indexOf(answer);
    if (optionIndex !== undefined && rule.optionIndices.includes(optionIndex)) {
      matchedStrengths.push(rule);
    }
  }

  // Mindestens 2, maximal 3 Stärken
  const strengths = matchedStrengths.slice(0, 3);

  // Wenn weniger als 2 Stärken, Fallback hinzufügen
  const fallbackStrengths = [
    {
      questionIndex: -1,
      optionIndices: [],
      de: { title: 'Selbstreflexion', description: 'Allein die Tatsache, dass du diesen Check machst, zeigt: Du bist bereit, dich ehrlich zu hinterfragen.' },
      en: { title: 'Self-Reflection', description: 'The fact alone that you took this check shows: you\'re ready to honestly question yourself.' },
      icon: '🪞',
    },
    {
      questionIndex: -1,
      optionIndices: [],
      de: { title: 'Handlungsbereitschaft', description: 'Du wartest nicht auf den perfekten Moment – du machst den ersten Schritt. Das ist mehr als die meisten tun.' },
      en: { title: 'Readiness to Act', description: "You're not waiting for the perfect moment – you're taking the first step. That's more than most do." },
      icon: '👣',
    },
  ];

  while (strengths.length < 2) {
    strengths.push(fallbackStrengths[strengths.length]!);
  }

  // Tieferen Treiber (Frage 8) ermitteln – das "Warum unterm Warum"
  const deepDriver = getDeepDriver(answers, lang);

  // Fokus-Bereich ("Wo wir ansetzen") – primär aus dem #1-Blocker (Frage 1)
  type FocusSource = { de: { title: string; description: string }; en: { title: string; description: string }; icon: string };
  let focusSrc: FocusSource | null = null;

  const blockerSel = selectedIndices(answers[1], questions[1]?.options ?? []);
  const blockerIdx = BLOCKER_PRIORITY.find((i) => blockerSel.includes(i));
  if (blockerIdx !== undefined) {
    focusSrc = BLOCKER_FOCUS[blockerIdx]!;
  }

  // Sonst aus den bestehenden Fokus-Regeln (Frage 5/9/10)
  if (!focusSrc) {
    for (const rule of FOCUS_RULES.sort((a, b) => a.priority - b.priority)) {
      const answer = answers[rule.questionIndex];
      if (answer === undefined || Array.isArray(answer)) continue;

      const optionIndex = questions[rule.questionIndex]?.options.indexOf(answer);
      if (optionIndex !== undefined && optionIndex >= 0 && rule.optionIndices.includes(optionIndex)) {
        focusSrc = rule;
        break;
      }
    }
  }

  // Generischer Fallback
  if (!focusSrc) {
    focusSrc = {
      de: { title: 'Individuelles System', description: 'Mit einem massgeschneiderten Plan holst du das Maximum aus deiner Zeit und Energie.' },
      en: { title: 'Individual System', description: 'With a tailored plan, you\'ll get the maximum out of your time and energy.' },
      icon: '🎯',
    };
  }

  // Headline generieren
  const headlines = {
    de: [
      `Hey ${name}! Du bist gar nicht so weit von deinem 2.0 entfernt!`,
      `${name}, dein Ich 2.0 ist näher als du denkst!`,
      `Stark, ${name}! Die Basis steht – jetzt geht's ans Feintuning.`,
    ],
    en: [
      `Hey ${name}! You're not as far from your 2.0 as you think!`,
      `${name}, your Me 2.0 is closer than you think!`,
      `Strong, ${name}! The foundation is set – now let's fine-tune.`,
    ],
  };

  const headlineIndex = score >= 71 ? 2 : score >= 56 ? 1 : 0;

  return {
    headline: headlines[lang][headlineIndex],
    strengths: strengths.map(s => ({
      title: s[lang].title,
      description: s[lang].description,
      icon: s.icon,
    })),
    deepDriver,
    focusArea: {
      title: focusSrc[lang].title,
      description: focusSrc[lang].description,
      icon: focusSrc.icon,
    },
    congratsText: lang === 'de'
      ? 'Glückwunsch, dass du den Check gemacht hast! Die meisten reden nur – du handelst.'
      : "Congrats on completing the check! Most people just talk – you take action.",
    ctaText: lang === 'de'
      ? 'Dani schaut sich deine Antworten persönlich an und meldet sich bei dir.'
      : 'Dani will personally review your answers and get back to you.',
  };
}
