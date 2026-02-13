export interface SurveySubmission {
  id?: string;
  created_at?: string;
  name: string;
  phone: string;
  language: 'de' | 'en';
  answers: Record<number, string | string[]>;
  score: number;
  score_label: string;
  token: string;
  status: 'neu' | 'angeschaut' | 'kontaktiert';
  coach_note: string | null;
  strengths: string[];
  focus_area: string;
}
