'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError('Credenziali non valide. Verifica email e password.');
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <div className="page-center">
      <div className="card card-login">
        <h1 className="card-login-title">Accedi a Inventory Cloud</h1>
        <p className="card-login-subtitle">
          Demo riservata al personale PetMark. Le credenziali vengono fornite
          dal team progetto.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label className="form-label">Email aziendale</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
