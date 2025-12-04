'use client';

import { useState } from 'react';
import { useCurrentProfile } from '@/lib/hooks/useCurrentProfile';

type ImportErrorRow = {
  line: number;
  message: string;
  row: Record<string, string | number | boolean | null | undefined>;
};

type ImportResult = {
  ok?: boolean;
  processed?: number;
  skipped?: number;
  errors?: ImportErrorRow[];
  error?: string;
  details?: string;
};

export default function ImportProductsPage() {
  const { profile, loading: profileLoading, error: profileError } =
    useCurrentProfile();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (!profile?.organization_id) {
      setResult({
        error:
          'Nessuna organizzazione associata al profilo. Impossibile importare.',
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organization_id', profile.organization_id as string);

      const res = await fetch('/api/import-products', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as ImportResult;
      setResult(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        error: 'Client error',
        details: message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // stati profilo
  if (profileLoading) {
    return (
      <div className="import-page">
        <div className="import-container import-center">
          <div className="import-chip import-chip-muted">
            Caricamento profilo…
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="import-page">
        <div className="import-container import-center">
          <div className="import-alert import-alert-error">
            Errore nel recupero del profilo: {profileError}
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.organization_id) {
    return (
      <div className="import-page">
        <div className="import-container import-center">
          <div className="import-alert import-alert-warning">
            Nessuna organizzazione associata a questo account. Contatta
            l&apos;amministratore PetMark.
          </div>
        </div>
      </div>
    );
  }

  // layout principale
  return (
    <div className="import-page">
      <div className="import-container">
        {/* Header */}
        <header className="import-header">
          <div className="import-breadcrumb">
            Console PetMark · Import listino prodotti
          </div>
          <div className="import-header-top">
            <h1 className="import-title">Importa il listino prodotti</h1>
          <span className="import-org-pill">
            {profile?.organization_name ?? 'Organizzazione'}
          </span>

          </div>
          <p className="import-subtitle">
            Carica un file CSV con il catalogo prodotti della rete. Gli SKU
            esistenti verranno aggiornati, gli altri creati da zero.
          </p>
        </header>

        {/* Cards guida */}
        <section className="import-steps">
          {[
            {
              step: 1,
              title: 'Prepara il CSV',
              text: 'Assicurati che il file contenga almeno le colonne sku e name.',
            },
            {
              step: 2,
              title: 'Carica il file',
              text: 'Se carichi lo stesso SKU più volte, il prodotto viene aggiornato, non duplicato.',
            },
            {
              step: 3,
              title: 'Controlla il risultato',
              text: 'Vedi quante righe sono state importate e se ci sono state righe scartate.',
            },
          ].map((card) => (
            <article key={card.step} className="import-card">
              <div className="import-step-pill">
                <span className="import-step-number">{card.step}</span>
                <span>Step {card.step}</span>
              </div>
              <h2 className="import-card-title">{card.title}</h2>
              <p className="import-card-text">{card.text}</p>
            </article>
          ))}
        </section>

        {/* Main: info + form */}
        <main className="import-main">
          {/* Sinistra: info formato */}
          <section className="import-column">
            <article className="import-card">
              <h3 className="import-card-title">Struttura minima del CSV</h3>
              <p className="import-card-text">
                Puoi aggiungere colonne extra, ma queste sono quelle utilizzate
                dal sistema:
              </p>
              <ul className="import-list">
                <li>
                  <span className="import-list-label">sku</span> – codice
                  univoco prodotto
                </li>
                <li>
                  <span className="import-list-label">name</span> – nome
                  prodotto
                </li>
                <li>
                  <span className="import-list-label">category</span> – categoria
                  (facoltativa)
                </li>
                <li>
                  <span className="import-list-label">brand</span> – marca
                  (facoltativa)
                </li>
                <li>
                  <span className="import-list-label">is_active</span> –{' '}
                  <code>true/false</code>, <code>1/0</code>,{' '}
                  <code>yes/no</code> (facoltativa, default true)
                </li>
              </ul>

              <pre className="import-code">
{`sku,name,category,brand,is_active
DOG-FOOD-2KG,Cibo secco cane 2kg,Food,PetMark,true
CAT-TOY-BALL,Pallina gioco gatto,Toys,PawFun,1`}
              </pre>
            </article>

            <article className="import-card import-card-muted">
              <h3 className="import-card-title">Regole di import</h3>
              <ul className="import-list">
                <li>Gli SKU vuoti o senza nome vengono scartati.</li>
                <li>
                  La coppia <code>organization_id + sku</code> è univoca:
                  niente duplicati.
                </li>
                <li>
                  Puoi ricaricare il listino per aggiornare descrizioni,
                  categorie e brand.
                </li>
              </ul>
            </article>
          </section>

          {/* Destra: form upload + risultato */}
          <section className="import-column">
            <article className="import-card">
              <div className="import-card-header">
                <div>
                  <h3 className="import-card-title">Import da file CSV</h3>
                  <p className="import-card-text">
                    Seleziona il file del listino prodotti dal tuo computer.
                  </p>
                </div>
                {isUploading && (
                  <span className="import-chip import-chip-dark">
                    <span className="import-dot" />
                    Import in corso…
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="import-form">
                <label className="import-dropzone">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="import-file-input"
                  />
                  <div className="import-dropzone-label">
                    Clicca per scegliere il CSV
                  </div>
                  {file ? (
                    <p className="import-dropzone-text">
                      File selezionato:{' '}
                      <span className="import-strong">{file.name}</span>
                    </p>
                  ) : (
                    <p className="import-dropzone-text">
                      Trascina qui il file oppure clicca per selezionarlo.
                    </p>
                  )}
                </label>

                <div className="import-form-footer">
                  <p className="import-hint">
                    I prodotti verranno associati alla tua organizzazione
                    corrente.
                  </p>
                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="import-button-primary"
                  >
                    {isUploading ? 'Importo…' : 'Importa prodotti'}
                  </button>
                </div>
              </form>
            </article>

            {result && (
              <article className="import-card">
                {result.error ? (
                  <>
                    <p className="import-result-title import-result-title-error">
                      Errore durante l&apos;import
                    </p>
                    <p className="import-result-text import-result-text-error">
                      {result.error}
                      {result.details ? ` – ${result.details}` : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="import-result-title">
                      Import completato con successo
                    </p>
                    <div className="import-result-grid">
                      <div className="import-result-box import-result-box-ok">
                        <div className="import-result-label">
                          Righe processate
                        </div>
                        <div className="import-result-value">
                          {result.processed ?? 0}
                        </div>
                      </div>
                      <div className="import-result-box">
                        <div className="import-result-label">
                          Righe scartate
                        </div>
                        <div className="import-result-value">
                          {result.skipped ?? 0}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {result.errors && result.errors.length > 0 && (
                  <details className="import-errors-details">
                    <summary className="import-errors-summary">
                      Dettaglio righe scartate ({result.errors.length})
                    </summary>
                    <div className="import-errors-table-wrapper">
                      <table className="import-errors-table">
                        <thead>
                          <tr>
                            <th>Linea</th>
                            <th>Errore</th>
                            <th>Riga</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.slice(0, 100).map((errRow, idx) => (
                            <tr key={idx}>
                              <td>{errRow.line}</td>
                              <td>{errRow.message}</td>
                              <td>
                                <pre className="import-errors-row-json">
                                  {JSON.stringify(errRow.row)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.errors.length > 100 && (
                        <p className="import-errors-note">
                          Mostrate solo le prime 100 righe scartate.
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </article>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
