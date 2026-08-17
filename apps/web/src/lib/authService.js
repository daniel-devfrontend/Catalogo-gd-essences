import { supabase, supabaseEnabled } from './supabaseClient';

export const isSupabaseEnabled = () => supabaseEnabled;

export const getCurrentUser = async () => {
  if (!supabaseEnabled) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
};

export const onAuthStateChange = (callback) => {
  if (!supabaseEnabled) {
    callback(null);
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => data.subscription?.unsubscribe();
};

export const signIn = async ({ email, password }) => {
  if (!supabaseEnabled) {
    return { error: new Error('Supabase no está configurado.') };
  }

  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  if (!supabaseEnabled) {
    return { error: null };
  }

  return supabase.auth.signOut();
};
