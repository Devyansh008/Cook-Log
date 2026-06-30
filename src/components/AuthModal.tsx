import { useState } from 'react';
import { AuthService } from '../services/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthModalProps {
  /** Called after successful sign-in or sign-up */
  onSuccess: () => void;
}

type Mode = 'signin' | 'signup';

// ─── Icons (inline SVG to avoid extra deps) ───────────────────────────────────

function IconMail() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function IconEye({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onChange: (v: string) => void;
  rightSlot?: React.ReactNode;
  autoComplete?: string;
}

function InputField({ id, label, type, value, placeholder, icon, onChange, rightSlot, autoComplete }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600
                     focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50
                     transition-all duration-200"
        />
        {rightSlot && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── AuthModal ────────────────────────────────────────────────────────────────

export default function AuthModal({ onSuccess }: AuthModalProps) {
  const [mode, setMode]           = useState<Mode>('signin');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [notice, setNotice]       = useState<string | null>(null);

  function resetState() {
    setError(null);
    setNotice(null);
    setLoading(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setEmail('');
    setPassword('');
    resetState();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    if (mode === 'signin') {
      const { error: err } = await AuthService.signIn(email, password);
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        onSuccess();
      }
    } else {
      const { error: err } = await AuthService.signUp(email, password);
      if (err) {
        setError(err.message);
        setLoading(false);
      } else {
        setNotice('Account created! Check your email to confirm, then sign in.');
        setLoading(false);
        // Switch to sign-in tab after a short delay
        setTimeout(() => switchMode('signin'), 3000);
      }
    }
  }

  const isSignUp = mode === 'signup';

  return (
    /* Full-screen backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0f14]">

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">

        {/* Subtle card glow border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-500/10 pointer-events-none" />

        <div className="relative bg-[#111318] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

          {/* Top gradient strip */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="p-8">

            {/* Logo + wordmark */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">CookLog</h1>
              <p className="text-xs text-gray-500 mt-0.5">Your personal problem-solving journal</p>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-7">
              {(['signin', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  id={`auth-tab-${m}`}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === m
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-900'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">

              <InputField
                id="auth-email"
                label="Email address"
                type="email"
                value={email}
                placeholder="you@example.com"
                icon={<IconMail />}
                onChange={setEmail}
                autoComplete={isSignUp ? 'email' : 'username'}
              />

              <InputField
                id="auth-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
                icon={<IconLock />}
                onChange={setPassword}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                rightSlot={
                  <button
                    type="button"
                    id="btn-toggle-password"
                    onClick={() => setShowPw(v => !v)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <IconEye visible={showPw} />
                  </button>
                }
              />

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse-once">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Success notice */}
              {notice && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-emerald-300 leading-relaxed">{notice}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 mt-2
                           bg-gradient-to-r from-violet-600 to-violet-500
                           hover:from-violet-500 hover:to-violet-400
                           disabled:opacity-40 disabled:cursor-not-allowed
                           text-white text-sm font-semibold rounded-xl
                           shadow-lg shadow-violet-500/25
                           transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <><IconSpinner /> {isSignUp ? 'Creating account…' : 'Signing in…'}</>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Switch mode helper */}
            <p className="text-center text-xs text-gray-600 mt-6">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                id={`auth-switch-${isSignUp ? 'signin' : 'signup'}`}
                onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </p>

          </div>

          {/* Bottom gradient strip */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>
    </div>
  );
}
