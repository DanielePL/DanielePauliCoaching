import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminReset() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Supabase liefert das Recovery-Token per URL-Hash. onAuthStateChange
  // feuert dann ein PASSWORD_RECOVERY-Event → dann dürfen wir das PW setzen.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(`Konnte Passwort nicht setzen: ${updateError.message}`);
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold text-2xl mx-auto mb-4">
            DP
          </div>
          <h1 className="text-2xl font-bold">Neues Passwort</h1>
          <p className="text-text-secondary mt-2">Daniele Pauli Coaching</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <p className="text-green-400">Passwort erfolgreich geändert.</p>
            <a href="/admin/" className="btn-primary w-full inline-block">Zum Login</a>
          </div>
        ) : !ready ? (
          <p className="text-text-secondary text-sm text-center">
            Kein gültiger Reset-Link erkannt. Bitte öffne den Link aus der E-Mail direkt,
            oder fordere über „Passwort vergessen?" einen neuen an.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">Neues Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2">Passwort bestätigen</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface border border-glass-border text-text-primary placeholder-text-muted focus:border-orange focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Speichern...' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
