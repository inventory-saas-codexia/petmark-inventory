'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function HeaderAuthButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setLoggedIn(!!data.user);
    }
    checkUser();
  }, []);

  // Evita flicker finché non sappiamo se c'è una sessione
  if (loggedIn === null) return null;

  if (!loggedIn) {
    return (
      <a href="/login" className="btn-primary">
        Accedi
      </a>
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button type="button" className="btn-primary" onClick={handleLogout}>
      Logout
    </button>
  );
}
