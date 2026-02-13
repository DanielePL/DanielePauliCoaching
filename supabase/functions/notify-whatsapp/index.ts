// Supabase Edge Function: WhatsApp-Benachrichtigung via Twilio
//
// Wird als Datenbank-Webhook aufgerufen wenn ein neuer Eintrag
// in survey_submissions erstellt wird.
//
// Benötigte Umgebungsvariablen (in Supabase Dashboard → Edge Functions → Secrets):
// - TWILIO_ACCOUNT_SID
// - TWILIO_AUTH_TOKEN
// - TWILIO_WHATSAPP_FROM  (z.B. "whatsapp:+14155238886" für Sandbox)
// - DANI_WHATSAPP_TO      (z.B. "whatsapp:+41798675705")
// - SITE_URL              (z.B. "https://danielepauli.com")

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    name: string;
    phone: string;
    score: number;
    score_label: string;
    token: string;
    answers: Record<string, unknown>;
  };
}

serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT') {
      return new Response('Not an insert', { status: 200 });
    }

    const { name, phone, score, score_label, token, answers } = payload.record;
    const importance = answers?.['17'] || '?';

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM');
    const DANI_WHATSAPP_TO = Deno.env.get('DANI_WHATSAPP_TO');
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://danielepauli.com';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !DANI_WHATSAPP_TO) {
      console.error('Missing Twilio environment variables');
      return new Response('Missing config', { status: 500 });
    }

    const adminLink = `${SITE_URL}/admin/`;
    const message = [
      `🚀 *Neuer Survey!*`,
      ``,
      `👤 Name: ${name}`,
      `📱 Tel: ${phone}`,
      `📊 Score: ${score}% (${score_label})`,
      `⭐ Wichtigkeit: ${importance}/10`,
      ``,
      `🔗 Admin: ${adminLink}`,
    ].join('\n');

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
      From: TWILIO_WHATSAPP_FROM,
      To: DANI_WHATSAPP_TO,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return new Response(JSON.stringify(result), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
