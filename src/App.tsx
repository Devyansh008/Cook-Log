import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthService } from './services/auth';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // wait for session check

  useEffect(() => {
    // 1. Resolve any existing session immediately
    AuthService.getSession().then(session => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Keep in sync (e.g. token refresh, tab focus, sign-out)
    const { subscription } = AuthService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // While resolving the initial session, show a minimal dark splash
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0f14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 tracking-wide">Loading CookLog…</p>
        </div>
      </div>
    );
  }

  // Not signed in → show auth modal (full-screen, no dashboard behind it)
  if (!user) {
    return <AuthModal onSuccess={() => { /* auth state change listener handles re-render */ }} />;
  }

  // Signed in → render the dashboard, passing the user down
  return <Dashboard user={user} />;
}

export default App;
