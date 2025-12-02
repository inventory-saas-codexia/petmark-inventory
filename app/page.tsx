export default function Home() {
  return (
    <main className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 840, padding: '1.8rem 2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Testo principale */}
          <div style={{ flex: '1 1 260px' }}>
            <div
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#b91c1c',
                fontWeight: 600,
              }}
            >
              Progetto pilota · interno PetMark
            </div>
            <h1
              style={{
                marginTop: '0.4rem',
                fontSize: '1.6rem',
                lineHeight: 1.25,
                fontWeight: 650,
              }}
            >
              Scadenziario prodotti per tutta la rete PetMark, in un&apos;unica
              vista.
            </h1>
            <p
              style={{
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                color: '#6b7280',
              }}
            >
              Lotti, date di scadenza e quantità per ogni negozio. Uno strumento
              pensato per evitare prodotti scaduti sugli scaffali e supportare
              gli area manager nelle visite in store.
            </p>

            <div
              style={{
                marginTop: '0.9rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <a href="/login" className="btn-primary">
                Entra nella demo
              </a>
              <a
                href="/inventory"
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textDecoration: 'underline',
                }}
              >
                Vai direttamente allo scadenziario →
              </a>
            </div>
          </div>

          {/* Box riassuntivo pilot */}
          <div
            style={{
              flex: '1 1 220px',
              borderRadius: 14,
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              padding: '0.9rem 1rem',
              fontSize: '0.78rem',
              color: '#4b5563',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
              Cosa vede il management PetMark
            </div>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, listStyle: 'disc' }}>
              <li>Lista lotti ordinata per data di scadenza.</li>
              <li>Dettaglio per negozio, prodotto, lotto e quantità.</li>
              <li>Coding colori per priorità di intervento.</li>
              <li>
                Dati centralizzati: visione unica per HQ e area manager
                (nessun Excel per negozio).
              </li>
            </ul>
            <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
              Questo MVP è pensato come base per un roll-out graduale sui 108
              punti vendita.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
