import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseEnabled) {
  console.warn('Supabase environment variables are missing. Supabase access is required for admin and product storage.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
  },
});
