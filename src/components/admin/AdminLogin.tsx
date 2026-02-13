import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.');
      setLoading(false);
      return;
    }

    onLogin();
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

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}
