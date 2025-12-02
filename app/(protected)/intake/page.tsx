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
      setStore(storeData as Store);

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
      setLoading(false);
    }

    load();
  }, [router]);

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

    setSaving(true);

    const { error: insertErr } = await supabase.from('inventory_batches').insert({
      store_id: store.id,
      product_id: productId,
      batch_code: batchCode,
      expiry_date: expiryDate,
      quantity: Number(quantity),
      note: note || null, // opzionale se esiste la colonna
    });

    setSaving(false);

    if (insertErr) {
      setError('Errore durante il salvataggio del lotto.');
      console.error(insertErr);
      return;
    }

    setMessage('Lotto inserito correttamente.');
    // reset campi (tranne prodotto, comodo per inserire più lotti dello stesso)
    setBatchCode('');
    setExpiryDate('');
    setQuantity('');
    setNote('');
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
          <div className="form-error" style={{ backgroundColor: '#dcfce7', borderColor: '#bbf7d0', color: '#166534', marginBottom: '0.7rem' }}>
            {message}
          </div>
        )}
        {error && (
          <div className="form-error" style={{ marginBottom: '0.7rem' }}>
            {error}
          </div>
        )}

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

          {/* Data scadenza e quantità nella stessa riga se c'è spazio */}
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
                  setQuantity(e.target.value === '' ? '' : Number(e.target.value))
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
      </section>
    </main>
  );
}
