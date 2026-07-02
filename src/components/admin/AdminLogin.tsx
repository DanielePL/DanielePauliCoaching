import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Echten Grund anzeigen statt pauschaler Meldung.
      if (authError.message?.toLowerCase().includes('invalid login credentials')) {
        setError('E-Mail oder Passwort ist falsch.');
      } else if (authError.message?.toLowerCase().includes('email not confirmed')) {
        setError('Diese E-Mail ist noch nicht bestätigt. Bitte im Supabase-Dashboard bestätigen.');
      } else {
        setError(`Login fehlgeschlagen: ${authError.message}`);
      }
      setLoading(false);
      return;
    }

    onLogin();
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Bitte zuerst deine E-Mail-Adresse eingeben.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset/`,
    });
    setLoading(false);
    if (resetError) {
      setError(`Konnte Reset-Link nicht senden: ${resetError.message}`);
      return;
    }
    setInfo(`Falls ein Konto für ${email} existiert, wurde ein Link zum Zurücksetzen gesendet. Prüfe dein Postfach.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold text-2xl mx-auto mb-4">
            DP
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-text-secondary mt-2">Daniele Pauli Coaching</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              placeholder="dani@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          {info && (
            <p className="text-green-400 text-sm">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full text-text-secondary text-sm hover:text-orange transition-colors disabled:opacity-50"
          >
            Passwort vergessen?
          </button>
        </form>
      </div>
    </div>
  );
}
