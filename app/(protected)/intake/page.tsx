// app/(protected)/intake/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  store_id: string | null;
  role: string;
};

type Store = {
  id: string;
  name: string;
  code: string | null;
};

type Product = {
  id: string;
  name: string;
  sku: string;
};

type RecentBatch = {
  id: string;
  created_at: string;
  expiry_date: string;
  quantity: number;
  batch_code: string | null;
  product: {
    name: string;
    sku: string;
  } | null;
};

export default function IntakePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // campi form
  const [productId, setProductId] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [note, setNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // storico ultimi lotti
  const [recentBatches, setRecentBatches] = useState<RecentBatch[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // profilo
      const { data: profileData, error: profErr } = await supabase
        .from('profiles')
        .select('store_id, role')
        .eq('id', user.id)
        .single();

      if (profErr) {
        setError('Errore nel caricamento del profilo.');
        setLoading(false);
        return;
      }

      const prof = profileData as Profile;
      setProfile(prof);

      if (!prof.store_id) {
        setError(
          'Questo account non è collegato a nessun negozio. Contatta l’amministratore.'
        );
        setLoading(false);
        return;
      }

      // negozio
      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .select('id, name, code')
        .eq('id', prof.store_id)
        .single();

      if (storeErr) {
        setError('Errore nel caricamento del negozio.');
        setLoading(false);
        return;
      }
      const st = storeData as Store;
      setStore(st);

      // prodotti (tutti per ora)
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('id, name, sku')
        .order('name', { ascending: true });

      if (prodErr) {
        setError('Errore nel caricamento dei prodotti.');
        setLoading(false);
        return;
      }

      setProducts((productsData || []) as Product[]);

      // carica storico ultimi lotti per questo store
      await loadRecentBatches(st.id);

      setLoading(false);
    }

    async function loadRecentBatches(storeId: string) {
      setLoadingRecent(true);

      const { data, error } = await supabase
        .from('inventory_batches')
        .select(
          `
          id,
          created_at,
          expiry_date,
          quantity,
          batch_code,
          product:products (
            name,
            sku
          )
        `
        )
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Errore caricamento ultimi lotti', error);
        setRecentBatches([]);
      } else {
        setRecentBatches((data || []) as unknown as RecentBatch[]);
      }

      setLoadingRecent(false);
    }

    load();
  }, [router]);

  async function reloadRecentForCurrentStore(currentStore: Store | null) {
    if (!currentStore) return;
    const { id } = currentStore;

    setLoadingRecent(true);

    const { data, error } = await supabase
      .from('inventory_batches')
      .select(
        `
        id,
        created_at,
        expiry_date,
        quantity,
        batch_code,
        product:products (
          name,
          sku
        )
      `
      )
      .eq('store_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Errore caricamento ultimi lotti (reload)', error);
      setRecentBatches([]);
    } else {
      setRecentBatches((data || []) as unknown as RecentBatch[]);
    }

    setLoadingRecent(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!store?.id) {
      setError('Nessun negozio selezionato.');
      return;
    }
    if (!productId || !batchCode || !expiryDate || !quantity) {
      setError('Compila tutti i campi obbligatori.');
      return;
    }

    // validazione semplice: scadenza non nel passato
    const todayStr = new Date().toISOString().slice(0, 10);
    if (expiryDate < todayStr) {
      setError('La data di scadenza non può essere nel passato.');
      return;
    }

    if (Number(quantity) <= 0) {
      setError('La quantità deve essere maggiore di zero.');
      return;
    }

    setSaving(true);

    const { error: insertErr } = await supabase.from('inventory_batches').insert({
      store_id: store.id,
      product_id: productId,
      batch_code: batchCode,
      expiry_date: expiryDate,
      quantity: Number(quantity),
      note: note || null, // opzionale se la colonna esiste
    });

    setSaving(false);

    if (insertErr) {
      console.error(insertErr);
      setError('Errore durante il salvataggio del lotto.');
      return;
    }

    setMessage('Lotto inserito correttamente.');

    // reset campi (tranne prodotto, comodo per più lotti dello stesso)
    setBatchCode('');
    setExpiryDate('');
    setQuantity('');
    setNote('');

    // ricarica storico ultimi lotti
    await reloadRecentForCurrentStore(store);
  }

  if (loading) {
    return <main>Caricamento interfaccia negozio…</main>;
  }

  if (error) {
    return <main>Errore: {error}</main>;
  }

  return (
    <main>
      <section className="page-title-card">
        <div className="page-title-main">Inserimento lotti da negozio</div>
        <div className="page-title-sub">
          Interfaccia dedicata al personale di punto vendita per registrare nuovi
          lotti nel sistema centrale.
        </div>
      </section>

      <section
        className="card"
        style={{ marginTop: '0.85rem', padding: '1rem 1.2rem' }}
      >
        <div className="text-xs" style={{ marginBottom: '0.6rem' }}>
          <strong>Negozio:</strong>{' '}
          {store?.name}{' '}
          {store?.code && <span>({store.code})</span>}
          <br />
          <strong>Ruolo:</strong> {profile?.role}
        </div>

        {message && (
          <div
            className="form-error"
            style={{
              backgroundColor: '#dcfce7',
              borderColor: '#bbf7d0',
              color: '#166534',
              marginBottom: '0.7rem',
            }}
          >
            {message}
          </div>
        )}
        {error && (
          <div className="form-error" style={{ marginBottom: '0.7rem' }}>
            {error}
          </div>
        )}

        {/* FORM INSERIMENTO LOTTO */}
        <form onSubmit={handleSubmit} className="form">
          {/* Prodotto */}
          <div className="form-field">
            <label className="form-label">Prodotto*</label>
            <select
              className="form-input"
              style={{ height: '2.4rem' }}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Seleziona un prodotto…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Lotto */}
          <div className="form-field">
            <label className="form-label">Codice lotto*</label>
            <input
              type="text"
              className="form-input"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              required
            />
          </div>

          {/* Data scadenza e quantità */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div className="form-field" style={{ flex: '1 1 150px' }}>
              <label className="form-label">Data di scadenza*</label>
              <input
                type="date"
                className="form-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field" style={{ width: '140px' }}>
              <label className="form-label">Quantità*</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                required
              />
            </div>
          </div>

          {/* Note opzionali */}
          <div className="form-field">
            <label className="form-label">
              Note interne (facoltativo, es. scaffale, promozione, ecc.)
            </label>
            <textarea
              className="form-input"
              style={{ minHeight: '3.2rem', paddingTop: '0.45rem' }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={saving}>
            {saving ? 'Salvataggio in corso…' : 'Registra lotto'}
          </button>
        </form>

        {/* STORICO ULTIMI LOTTI */}
        <div
          style={{
            marginTop: '1.1rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <div className="stat-card-title">Ultimi lotti inseriti in questo negozio</div>
          <div className="text-xs" style={{ marginTop: '0.25rem' }}>
            Vengono mostrati gli ultimi 10 lotti registrati da questo punto vendita.
          </div>

          {loadingRecent ? (
            <div className="text-xs" style={{ marginTop: '0.5rem' }}>
              Caricamento storico lotti…
            </div>
          ) : recentBatches.length === 0 ? (
            <div className="text-xs" style={{ marginTop: '0.5rem' }}>
              Nessun lotto inserito finora per questo negozio.
            </div>
          ) : (
            <div className="table-scroll" style={{ marginTop: '0.5rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Prodotto</th>
                    <th>SKU</th>
                    <th>Lotto</th>
                    <th>Scadenza</th>
                    <th>Qty</th>
                    <th>Inserito il</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((b) => (
                    <tr key={b.id}>
                      <td>{b.product?.name}</td>
                      <td>{b.product?.sku}</td>
                      <td>{b.batch_code}</td>
                      <td>{b.expiry_date}</td>
                      <td>{b.quantity}</td>
                      <td>
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString('it-IT', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
