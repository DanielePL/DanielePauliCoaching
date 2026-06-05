// Supabase Edge Function: E-Mail-Benachrichtigung via Resend
//
// Wird als Datenbank-Webhook aufgerufen, wenn ein neuer Eintrag
// in survey_submissions erstellt wird → schickt Dani sofort eine E-Mail.
// Zuverlässigster Kanal, damit kein ausgefüllter Survey mehr untergeht.
//
// Benötigte Secrets (Supabase Dashboard → Edge Functions → Secrets,
// oder: supabase secrets set KEY=value):
// - RESEND_API_KEY     (von resend.com → API Keys)
// - NOTIFY_EMAIL_TO    (z.B. "danielepauli@gmail.com")
// - NOTIFY_EMAIL_FROM  (verifizierter Absender, z.B. "Survey <noreply@danielepauli.com>";
//                       zum Testen ohne Domain-Verifizierung: "onboarding@resend.dev")
// - SITE_URL           (z.B. "https://danielepauli.com")  [optional]

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    name: string;
    phone: string;
    score: number;
    score_label: string;
    token: string;
    language?: string;
    answers: Record<string, unknown>;
    created_at?: string;
  };
}

serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT') {
      return new Response('Not an insert', { status: 200 });
    }

    const { name, phone, score, score_label, token, answers } = payload.record;
    // Q17 = Wichtigkeit (1–10), Q20 = monatliches Investment (Preis-Indikator)
    const importance = answers?.['17'] ?? '?';
    const investment = answers?.['20'] ?? '–';

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFY_EMAIL_TO = Deno.env.get('NOTIFY_EMAIL_TO');
    const NOTIFY_EMAIL_FROM = Deno.env.get('NOTIFY_EMAIL_FROM') || 'onboarding@resend.dev';
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://danielepauli.com';

    if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) {
      console.error('Missing RESEND_API_KEY or NOTIFY_EMAIL_TO');
      return new Response('Missing config', { status: 500 });
    }

    const adminLink = `${SITE_URL}/admin/`;

    const subject = `🚀 Neuer Survey: ${name} (${score}% · ${score_label})`;

    const text = [
      `Neuer ausgefüllter Survey!`,
      ``,
      `Name:        ${name}`,
      `Telefon:     ${phone}`,
      `Score:       ${score}% (${score_label})`,
      `Wichtigkeit: ${importance}/10`,
      `Investment:  ${investment}`,
      ``,
      `Im Admin ansehen: ${adminLink}`,
    ].join('\n');

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 16px">🚀 Neuer Survey ausgefüllt</h2>
        <table style="border-collapse:collapse;font-size:15px">
          <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${name}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Telefon</td><td style="padding:4px 0"><a href="tel:${phone}">${phone}</a> · <a href="https://wa.me/${String(phone).replace(/[^0-9]/g, '')}">WhatsApp</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Score</td><td style="padding:4px 0">${score}% (${score_label})</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Wichtigkeit</td><td style="padding:4px 0">${importance}/10</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Investment</td><td style="padding:4px 0">${investment}</td></tr>
        </table>
        <p style="margin:20px 0">
          <a href="${adminLink}" style="background:#f97316;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Im Admin ansehen →</a>
        </p>
      </div>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_EMAIL_FROM,
        to: [NOTIFY_EMAIL_TO],
        subject,
        text,
        html,
        reply_to: NOTIFY_EMAIL_TO,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend error:', result);
      return new Response(JSON.stringify(result), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
