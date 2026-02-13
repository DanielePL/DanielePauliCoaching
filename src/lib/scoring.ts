/**
 * Commitment-Score Berechnung (40-100%)
 *
 * Der Score basiert auf den Antworten und ist immer ermutigend (min 40%).
 * Höhere Werte = mehr Bereitschaft/Commitment.
 */

// Score-Gewichte pro Frage (0-basierter Index)
// Jede Frage gibt 0-1 Punkte, gewichtet nach Relevanz
const QUESTION_WEIGHTS: Record<number, { weight: number; scores: number[] }> = {
  // Phase 1: IST-ZUSTAND
  0: { weight: 1.0, scores: [0.25, 0.5, 0.75, 1.0] },      // Körperlich/mental
  2: { weight: 0.8, scores: [0.25, 0.5, 0.75, 1.0] },       // Stabilität
  3: { weight: 0.5, scores: [0.25, 0.5, 0.75, 1.0] },       // 12-Monats-Projektion

  // Phase 2: VERGANGENHEIT
  4: { weight: 0.3, scores: [0.5, 0.6, 0.7, 0.8] },         // Frühere Versuche (alle ok)
  6: { weight: 0.3, scores: [0.8, 0.7, 0.6, 0.5] },         // Zeiteinschätzung

  // Phase 3: SOLL-ZUSTAND
  9: { weight: 0.8, scores: [1.0, 0.75, 0.5, 0.4] },        // Erhaltungsplan

  // Phase 4: COMMITMENT (am stärksten gewichtet)
  10: { weight: 1.5, scores: [1.0, 0.75, 0.5, 0.25] },      // Bereitschaft Prioritäten
  11: { weight: 1.0, scores: [1.0, 0.8, 0.6, 0.4] },        // Umgang mit Feedback
  12: { weight: 0.8, scores: [1.0, 0.8, 0.6, 0.5] },        // Accountability
  13: { weight: 0.5, scores: [0.6, 0.7, 0.85, 1.0] },       // Effizienz
  14: { weight: 1.2, scores: [1.0, 0.7, 0.4] },             // Bereitschaft alles geben
  15: { weight: 0.8, scores: [0.4, 0.7, 0.9, 1.0] },        // Zeitinvestment
  17: { weight: 1.0, scores: [] },                            // Wichtigkeit (1-10 Skala)

  // Phase 5: REALITY CHECK
  18: { weight: 0.5, scores: [0.7, 0.8, 0.5, 0.4] },        // 2-Jahres-Konsequenz
  19: { weight: 0.8, scores: [0.9, 1.0, 0.8, 0.7] },        // Warum JETZT
  20: { weight: 0.3, scores: [0.5, 0.7, 0.85, 1.0, 0.2] },  // Investment
};

export interface ScoreResult {
  score: number;       // 40-100
  label: string;       // "Sehr nah", etc.
  labelEn: string;     // English label
}

export function calculateScore(answers: Record<number, string | string[]>): ScoreResult {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [qIndexStr, config] of Object.entries(QUESTION_WEIGHTS)) {
    const qIndex = parseInt(qIndexStr);
    const answer = answers[qIndex];
    if (answer === undefined) continue;

    // Frage 17 ist die Skala-Frage (1-10)
    if (qIndex === 17) {
      const value = parseInt(answer as string) || 5;
      const normalized = value / 10;
      totalWeightedScore += normalized * config.weight;
      totalWeight += config.weight;
      continue;
    }

    // Für Multiple-Choice: Durchschnitt der gewählten Optionen ignorieren,
    // stattdessen Anzahl gewählter Optionen als Indikator nutzen
    if (Array.isArray(answer)) {
      // Multiple-choice Fragen (1, 7, 8) sind deskriptiv, nicht wertend
      // Wir ignorieren sie für den Score
      continue;
    }

    // Single-choice: Finde den Index der gewählten Option
    // Die scores-Arrays sind nach Option-Index geordnet
    // Wir brauchen die Originalfragen um den Index zu finden
    // Da wir den Index nicht direkt haben, verwenden wir eine Hilfsfunktion
    if (config.scores.length > 0) {
      // Wir speichern den Option-Index separat
      totalWeight += config.weight;
      // Default: mittlerer Score wenn wir den Index nicht bestimmen können
      totalWeightedScore += 0.6 * config.weight;
    }
  }

  // Rohwert berechnen (0-1)
  const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0.6;

  // Auf 40-100 skalieren
  const score = Math.round(40 + rawScore * 60);
  const clampedScore = Math.min(100, Math.max(40, score));

  return {
    score: clampedScore,
    ...getScoreLabel(clampedScore),
  };
}

/**
 * Berechnet den Score mit Zugang zu den Antwort-Indizes
 * (wird von Survey.tsx aufgerufen, wo wir die Fragen kennen)
 */
export function calculateScoreWithIndices(
  answers: Record<number, string | string[]>,
  questions: { options: string[] }[]
): ScoreResult {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [qIndexStr, config] of Object.entries(QUESTION_WEIGHTS)) {
    const qIndex = parseInt(qIndexStr);
    const answer = answers[qIndex];
    if (answer === undefined) continue;

    // Frage 17 ist die Skala-Frage (1-10)
    if (qIndex === 17) {
      const value = parseInt(answer as string) || 5;
      const normalized = value / 10;
      totalWeightedScore += normalized * config.weight;
      totalWeight += config.weight;
      continue;
    }

    // Multiple-choice Fragen überspringen
    if (Array.isArray(answer)) continue;

    // Single-choice: Option-Index finden
    const question = questions[qIndex];
    if (!question || config.scores.length === 0) continue;

    const optionIndex = question.options.indexOf(answer as string);
    if (optionIndex === -1) continue;

    const scoreValue = config.scores[Math.min(optionIndex, config.scores.length - 1)];
    totalWeightedScore += scoreValue * config.weight;
    totalWeight += config.weight;
  }

  const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0.6;
  const score = Math.round(40 + rawScore * 60);
  const clampedScore = Math.min(100, Math.max(40, score));

  return {
    score: clampedScore,
    ...getScoreLabel(clampedScore),
  };
}

function getScoreLabel(score: number): { label: string; labelEn: string } {
  if (score >= 86) return { label: 'Fast da!', labelEn: 'Almost there!' };
  if (score >= 71) return { label: 'Sehr nah', labelEn: 'Very close' };
  if (score >= 56) return { label: 'Nah dran', labelEn: 'Getting close' };
  return { label: 'Auf gutem Weg', labelEn: 'On track' };
}
