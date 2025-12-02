'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Store = {
  id: string;
  name: string;
  code: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
  role: string | null;
  store_id: string | null;
  store_name: string | null;
  store_code: string | null;
};

export default function AccountsPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'store'>('store');
  const [newStoreId, setNewStoreId] = useState<string>('none');
  const [creating, setCreating] = useState(false);

  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profErr) {
        console.error(profErr);
        setError('Errore nel caricamento del profilo utente.');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (profile?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      const { data: storesData, error: storesErr } = await supabase
        .from('stores')
        .select('id, name, code')
        .order('name', { ascending: true });

      if (storesErr) {
        console.error(storesErr);
        setError('Errore nel caricamento dei negozi.');
        setLoading(false);
        return;
      }

      setStores((storesData || []) as Store[]);

      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Errore nel caricamento utenti.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(data.users as UserRow[]);

      setLoading(false);
    }

    init();
  }, [router]);

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!newEmail || !newPassword) {
      setError('Email e password sono obbligatorie.');
      return;
    }

    setCreating(true);

    const body = {
      email: newEmail,
      password: newPassword,
      role: newRole,
      store_id: newStoreId === 'none' ? null : newStoreId,
    };

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Errore nella creazione utente.');
      return;
    }

    setNewEmail('');
    setNewPassword('');
    setNewRole('store');
    setNewStoreId('none');

    const reload = await fetch('/api/admin/users');
    const reloadData = await reload.json();
    setUsers(reloadData.users as UserRow[]);
  }

  async function handleSaveUser(u: UserRow) {
    setError(null);
    setSavingUserId(u.id);

    const roleToSend = u.role ?? 'store';

    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: u.id,
        role: roleToSend,
        store_id: u.store_id,
      }),
    });

    setSavingUserId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Errore nel salvataggio utente.');
      return;
    }

    setUsers((prev) =>
      prev.map((row) =>
        row.id === u.id ? { ...row, role: roleToSend } : row
      )
    );
  }

  if (loading) {
    return <main>Caricamento gestione account…</main>;
  }

  if (isAdmin === false) {
    return (
      <main>
        <section className="page-title-card">
          <div className="page-title-main">Gestione account</div>
          <div className="page-title-sub">
            Accesso riservato agli amministratori PetMark.
          </div>
        </section>
        <section style={{ marginTop: '0.8rem' }}>
          Non hai i permessi per visualizzare questa pagina.
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Gestione account PetMark</div>
        <div className="page-title-sub">
          Crea nuovi account per i negozi e associa a ciascun utente il proprio
          punto vendita e ruolo.
        </div>
      </section>

      <section
        className="card"
        style={{ marginTop: '0.9rem', padding: '0.9rem 1.1rem' }}
      >
        <div className="stat-card-title">Nuovo utente</div>
        <form
          onSubmit={handleCreateUser}
          className="form"
          style={{ marginTop: '0.8rem' }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div className="form-field" style={{ minWidth: 220, flex: '1 1 220px' }}>
              <label className="form-label">Email*</label>
              <input
                type="email"
                className="form-input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field" style={{ minWidth: 160, flex: '1 1 160px' }}>
              <label className="form-label">Password iniziale*</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-field" style={{ width: 140 }}>
              <label className="form-label">Ruolo</label>
              <select
                className="form-input"
                value={newRole}
                onChange={(e) =>
                  setNewRole(e.target.value as 'admin' | 'store')
                }
              >
                <option value="store">Store</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-field" style={{ minWidth: 200, flex: '1 1 200px' }}>
              <label className="form-label">Negozio (opzionale)</label>
              <select
                className="form-input"
                value={newStoreId}
                onChange={(e) => setNewStoreId(e.target.value)}
              >
                <option value="none">Nessun negozio / HQ</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={creating}
          >
            {creating ? 'Creazione in corso…' : 'Crea utente'}
          </button>
        </form>
      </section>

      <section className="table-card">
        <div className="table-header">
          <div>
            <div className="table-header-title">Utenti registrati</div>
            <div className="table-header-sub">
              Gestisci ruoli e assegnazione negozi. Gli utenti vengono creati
              nella console come account Supabase e collegati alla tabella
              profili.
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: '0.6rem' }}>
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="table-header-sub">
            Nessun utente presente. Crea il primo account con il form qui sopra.
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Negozio</th>
                  <th style={{ textAlign: 'right' }}>Azione</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email ?? '—'}</td>
                    <td>
                      <select
                        className="form-input"
                        style={{ height: '2.1rem', fontSize: '0.72rem' }}
                        value={u.role ?? 'store'}
                        onChange={(e) =>
                          setUsers((prev) =>
                            prev.map((row) =>
                              row.id === u.id
                                ? { ...row, role: e.target.value }
                                : row
                            )
                          )
                        }
                      >
                        <option value="store">Store</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-input"
                        style={{ height: '2.1rem', fontSize: '0.72rem' }}
                        value={u.store_id ?? 'none'}
                        onChange={(e) => {
                          const value =
                            e.target.value === 'none' ? null : e.target.value;
                          setUsers((prev) =>
                            prev.map((row) =>
                              row.id === u.id ? { ...row, store_id: value } : row
                            )
                          );
                        }}
                      >
                        <option value="none">Nessun negozio / HQ</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.code ? `(${s.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          handleSaveUser(
                            users.find((row) => row.id === u.id)!
                          )
                        }
                        disabled={savingUserId === u.id}
                      >
                        {savingUserId === u.id ? 'Salvataggio…' : 'Salva'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
