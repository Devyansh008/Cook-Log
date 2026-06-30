import { supabase } from './supabase';
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const AuthService = {
  /**
   * Create a new account. Supabase sends a confirmation e-mail by default.
   * Check your Supabase dashboard → Authentication → Settings to toggle that.
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user, session: data.session, error };
  },

  /**
   * Sign in with email + password.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, session: data.session, error };
  },

  /**
   * Sign the current user out and invalidate the session.
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Returns the active Session, or null if the user is not signed in.
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, etc.).
   * Returns the Subscription so the caller can unsubscribe on unmount.
   *
   * @example
   * const { subscription } = AuthService.onAuthStateChange((event, session) => {
   *   setUser(session?.user ?? null);
   * });
   * return () => subscription.unsubscribe();
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ): { subscription: Subscription } {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { subscription: data.subscription };
  },
};
