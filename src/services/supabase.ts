import { createClient } from '@supabase/supabase-js';

// ─── Supabase Client Singleton ────────────────────────────────────────────────
// Vite exposes env vars via import.meta.env. Both variables must be set in .env.

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[CookLog] Missing Supabase env vars.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
