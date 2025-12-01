import { supabase } from '@/lib/supabaseClient';

export default async function Home() {
  // semplice ping: chiede l'ora al DB
  const { data, error } = await supabase.rpc('now'); // in Postgres la function "now" esiste

  return (
    <main style={{ padding: 40 }}>
      <h1>Petmark Inventory – MVP</h1>
      {error ? (
        <p>Errore Supabase: {error.message}</p>
      ) : (
        <p>Supabase è collegato. Ora del server: {String(data)}</p>
      )}
    </main>
  );
}
