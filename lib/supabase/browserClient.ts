// lib/supabase/browserClient.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Se hai i tipi generati, sostituisci `any` con `Database`.
type TypedClient = SupabaseClient<any>;

let client: TypedClient | null = null;

/**
 * Ritorna il client Supabase lato browser (singleton).
 * Uso consigliato nel nuovo codice: browserClient().from(...)
 */
export function browserClient(): TypedClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        'Supabase URL o ANON KEY mancanti. Controlla le variabili ambiente.'
      );
    }

    client = createClient(url, anonKey) as TypedClient;
  }

  return client;
}

/**
 * Alias compatibile con il codice esistente.
 * Qui esportiamo direttamente l'ISTANZA, così chiamate come
 *   supabaseBrowserClient.from(...)
 * continuano a funzionare.
 */
export const supabaseBrowserClient: TypedClient = browserClient();
