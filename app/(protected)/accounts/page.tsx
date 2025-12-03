'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrentProfile } from '@/lib/hooks/useCurrentProfile';
import { useStoresForScope } from '@/lib/hooks/useStoresForScope';
import { supabaseBrowserClient } from '@/lib/supabase/browserClient';

type CreatableRole = 'area_manager' | 'store_manager' | 'staff';

interface AreaOption {
  id: string;
  name: string;
}

interface UserRow {
  id: string;
  email: string;
  role: string;
  store_id: string | null;
  store_name: string | null;
  store_code: string | null;
  area_name: string | null;
  disabled: boolean;
  created_at: string;
  roleDraft: string;
  storeIdDraft: string;
}

export default function AccountAdminPage() {
  const { profile, loading: profileLoading, error: profileError } =
    useCurrentProfile();

  // --- stato per form creazione ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CreatableRole>('staff');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // --- aree ---
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  // --- negozi ---
  const {
    stores,
    loading: storesLoading,
    error: storesError,
  } = useStoresForScope(profile?.organization_id ?? null, null);

  // --- elenco utenti ---
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // carica aree
  useEffect(() => {
    if (!profile?.organization_id) {
      setAreas([]);
      setAreasLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      setAreasLoading(true);
      const { data, error } = await supabaseBrowserClient
        .from('areas')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true });

      if (!mounted) return;

      if (error) {
        setAreas([]);
      } else {
        setAreas((data ?? []).map((a: any) => ({ id: a.id, name: a.name })));
      }

      setAreasLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [profile?.organization_id]);

  // ruoli possibili
  const allowedRoles: CreatableRole[] = useMemo(() => {
    if (!profile) return ['staff'];
    if (profile.role === 'hq') return ['staff', 'store_manager', 'area_manager'];
    if (profile.role === 'area_manager') return ['staff', 'store_manager'];
    if (profile.role === 'store_manager') return ['staff'];
    return ['staff'];
  }, [profile]);

  // --- fetch utenti ---
  async function fetchUsers() {
    if (!profile?.organization_id) return;

    setUsersLoading(true);
    setUsersError(null);

    try {
      const res = await fetch(
        `/api/admin/users?orgId=${encodeURIComponent(
          profile.organization_id
        )}`
      );

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setUsersError(
          `Risposta non valida dal server (status ${res.status}). Controlla la route /api/admin/users. Dettaglio: ${text.slice(
            0,
            120
          )}`
        );
        setUsers([]);
        setUsersLoading(false);
        return;
      }

      if (!res.ok) {
        setUsersError(data.error ?? 'Errore nel caricamento utenti.');
        setUsers([]);
      } else {
        const rows: UserRow[] = (data.users ?? []).map((u: any) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          store_id: u.store_id,
          store_name: u.store_name,
          store_code: u.store_code,
          area_name: u.area_name,
          disabled: !!u.disabled,
          created_at: u.created_at,
          roleDraft: u.role,
          storeIdDraft: u.store_id ?? '',
        }));
        setUsers(rows);
      }
    } catch (e: any) {
      setUsersError(e?.message ?? 'Errore sconosciuto.');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.organization_id) {
      fetchUsers();
    }
  }, [profile?.organization_id]);

  // filtro ricerca
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const inEmail = u.email.toLowerCase().includes(q);
      const inStore = (u.store_name ?? '').toLowerCase().includes(q);
      const inArea = (u.area_name ?? '').toLowerCase().includes(q);
      return inEmail || inStore || inArea;
    });
  }, [users, search]);

  // --- submit creazione utente ---
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!profile) {
      setCreateError('Profilo non caricato.');
      return;
    }

    if (!email || !password) {
      setCreateError('Email e password sono obbligatorie.');
      return;
    }

    const effectiveAreaId =
      profile.role === 'hq'
        ? selectedAreaId || null
        : profile.area_id || null;

    const effectiveStoreId =
      profile.role === 'store_manager'
        ? profile.store_id || null
        : selectedStoreId || null;

    if ((role === 'store_manager' || role === 'staff') && !effectiveStoreId) {
      setCreateError('Devi selezionare un negozio.');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/admin/create-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          organization_id: profile.organization_id,
          store_id: effectiveStoreId,
          area_id: effectiveAreaId,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        setCreateError(
          `Risposta non valida dalla API (status ${res.status}). Probabile problema di route /api/admin/create-users o errore server. Dettaglio: ${text.slice(
            0,
            120
          )}`
        );
        return;
      }

      if (!res.ok) {
        setCreateError(data.error ?? 'Errore nella creazione utente.');
        return;
      }

      setCreateSuccess(`Utente creato: ${data.email}`);
      setEmail('');
      setPassword('');
      setSelectedAreaId('');
      setSelectedStoreId('');

      fetchUsers();
    } catch (err: any) {
      setCreateError(err?.message ?? 'Errore sconosciuto.');
    } finally {
      setCreating(false);
    }
  }

  // azioni sugli utenti
  async function toggleDisabled(user: UserRow) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleActive',
          user_id: user.id,
          disabled: !user.disabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'Errore nel cambio stato utente.');
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, disabled: !user.disabled } : u
        )
      );
    } catch (e: any) {
      alert(e?.message ?? 'Errore sconosciuto.');
    }
  }

  async function saveProfileChanges(user: UserRow) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateProfile',
          user_id: user.id,
          role: user.roleDraft,
          store_id: user.storeIdDraft || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Errore nell'aggiornamento profilo.");
        return;
      }

      // ricarico da backend così area/negozio sono allineati
      fetchUsers();
    } catch (e: any) {
      alert(e?.message ?? 'Errore sconosciuto.');
    }
  }

  async function resetPassword(user: UserRow) {
    const newPw = window.prompt(
      `Nuova password per ${user.email} (verrà impostata immediatamente):`
    );
    if (!newPw) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetPassword',
          user_id: user.id,
          new_password: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'Errore nel reset password.');
        return;
      }

      alert('Password aggiornata. Comunica la nuova password all\'utente.');
    } catch (e: any) {
      alert(e?.message ?? 'Errore sconosciuto.');
    }
  }

  async function deleteUser(user: UserRow) {
    const ok = window.confirm(
      `Vuoi davvero eliminare l'utente ${user.email}? L'operazione è definitiva.`
    );
    if (!ok) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteUser',
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? 'Errore durante l\'eliminazione utente.');
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e: any) {
      alert(e?.message ?? 'Errore sconosciuto.');
    }
  }

  // render base
  if (profileLoading) {
    return <div className="p-6">Caricamento profilo...</div>;
  }

  if (profileError || !profile) {
    return (
      <div className="p-6 text-red-600">
        Errore nel recupero del profilo.
      </div>
    );
  }

  const canAccess =
    profile.role === 'hq' ||
    profile.role === 'area_manager' ||
    profile.role === 'store_manager';

  if (!canAccess) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Gestione utenti</h1>
        <p>Non hai i permessi per visualizzare questa pagina.</p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: 16,
    maxWidth: 960,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    padding: '6px 8px',
    fontSize: 14,
    width: '100%',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Gestione utenti</h1>
      <p className="text-sm text-gray-600">
        Crea nuovi account e gestisci utenti esistenti (disattiva, modifica ruolo/negozio, reset password, elimina).
      </p>

      {/* FORM CREAZIONE */}
      <div style={cardStyle}>
        <h2 className="text-lg font-semibold mb-3">Crea nuovo utente</h2>

        <form
          onSubmit={handleCreateSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Ruolo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CreatableRole)}
              style={inputStyle}
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Area</label>
            {profile.role === 'hq' ? (
              areasLoading ? (
                <div className="text-sm text-gray-500 mt-2">
                  Caricamento aree...
                </div>
              ) : (
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">(Nessuna / tutte)</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div className="mt-2 text-sm text-gray-700">
                {profile.area_id ? 'Area assegnata' : 'Nessuna area assegnata'}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Negozio</label>
            {profile.role === 'store_manager' ? (
              <div className="mt-2 text-sm text-gray-700">
                Puoi creare utenti solo per il tuo negozio.
              </div>
            ) : storesLoading ? (
              <div className="mt-2 text-sm text-gray-500">
                Caricamento negozi...
              </div>
            ) : storesError ? (
              <div className="mt-2 text-sm text-red-600">
                Errore negozi: {storesError}
              </div>
            ) : (
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                style={inputStyle}
                disabled={role === 'area_manager'}
              >
                <option value="">(Nessuno)</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="col-span-2 mt-2">
            <button
              type="submit"
              disabled={creating}
              style={{
                borderRadius: 999,
                padding: '8px 20px',
                border: 'none',
                background:
                  'linear-gradient(90deg, #F97373, #FB7185)',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                cursor: creating ? 'default' : 'pointer',
                opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? 'Creazione...' : 'Crea utente'}
            </button>

            {createError && (
              <div className="text-sm text-red-600 mt-2">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="text-sm text-green-700 mt-2">
                {createSuccess}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ELENCO UTENTI */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            gap: 8,
          }}
        >
          <h2 className="text-lg font-semibold">Elenco utenti</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="Cerca per email / negozio / area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={fetchUsers}
              style={{
                borderRadius: 999,
                padding: '6px 14px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#F9FAFB',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Aggiorna
            </button>
          </div>
        </div>

        {usersLoading ? (
          <p className="text-sm text-gray-600">Caricamento utenti...</p>
        ) : usersError ? (
          <p className="text-sm text-red-600">Errore: {usersError}</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-600">
            Nessun utente trovato per questi criteri.
          </p>
        ) : (
          <div
            style={{
              maxHeight: 420,
              overflowY: 'auto',
              overflowX: 'auto',
              marginTop: 4,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Email
                  </th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Ruolo
                  </th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Negozio
                  </th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Area
                  </th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Stato
                  </th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      backgroundColor:
                        idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    <td style={{ padding: '6px 8px' }}>{u.email}</td>

                    <td style={{ padding: '6px 8px' }}>
                      <select
                        value={u.roleDraft}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUsers((prev) =>
                            prev.map((row) =>
                              row.id === u.id
                                ? { ...row, roleDraft: value }
                                : row
                            )
                          );
                        }}
                        style={{
                          borderRadius: 6,
                          border: '1px solid #D1D5DB',
                          padding: '2px 6px',
                          fontSize: 12,
                        }}
                      >
                        {allowedRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <select
                        value={u.storeIdDraft}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUsers((prev) =>
                            prev.map((row) =>
                              row.id === u.id
                                ? { ...row, storeIdDraft: value }
                                : row
                            )
                          );
                        }}
                        style={{
                          borderRadius: 6,
                          border: '1px solid #D1D5DB',
                          padding: '2px 6px',
                          fontSize: 12,
                        }}
                      >
                        <option value="">(Nessuno)</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      {u.area_name ?? '—'}
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      {u.disabled ? (
                        <span
                          style={{
                            borderRadius: 999,
                            padding: '2px 8px',
                            fontSize: 11,
                            backgroundColor: '#FEE2E2',
                            color: '#B91C1C',
                          }}
                        >
                          Disattivo
                        </span>
                      ) : (
                        <span
                          style={{
                            borderRadius: 999,
                            padding: '2px 8px',
                            fontSize: 11,
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                          }}
                        >
                          Attivo
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 4,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleDisabled(u)}
                          style={{
                            fontSize: 11,
                            borderRadius: 999,
                            padding: '3px 8px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#F9FAFB',
                            cursor: 'pointer',
                          }}
                        >
                          {u.disabled ? 'Riattiva' : 'Disattiva'}
                        </button>

                        <button
                          type="button"
                          onClick={() => saveProfileChanges(u)}
                          style={{
                            fontSize: 11,
                            borderRadius: 999,
                            padding: '3px 8px',
                            border: '1px solid #DBEAFE',
                            backgroundColor: '#EFF6FF',
                            cursor: 'pointer',
                          }}
                        >
                          Salva
                        </button>

                        <button
                          type="button"
                          onClick={() => resetPassword(u)}
                          style={{
                            fontSize: 11,
                            borderRadius: 999,
                            padding: '3px 8px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            cursor: 'pointer',
                          }}
                        >
                          Reset pw
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteUser(u)}
                          style={{
                            fontSize: 11,
                            borderRadius: 999,
                            padding: '3px 8px',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEE2E2',
                            cursor: 'pointer',
                          }}
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
