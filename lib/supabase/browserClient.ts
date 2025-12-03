'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Se vuoi potremo in futuro tipizzarlo con Database generato da Supabase
export const supabaseBrowserClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
