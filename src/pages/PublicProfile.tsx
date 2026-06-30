import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import type { UserProfile, QuestionEntry, BookCategory } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const TOPIC_BADGE: Record<string, string> = {
  algorithms: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  coding:     'bg-cyan-500/20   text-cyan-300   border-cyan-500/30',
  math:       'bg-amber-500/20  text-amber-300  border-amber-500/30',
};

const TOPIC_DOT: Record<string, string> = {
  algorithms: 'bg-violet-400',
  coding:     'bg-cyan-400',
  math:       'bg-amber-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotFound({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0f14] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Profile not found</h1>
      <p className="text-sm text-gray-500 mb-6">
        No user with the username <span className="text-gray-300 font-mono">@{username}</span> exists.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                   text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/25"
      >
        ← Back to CookLog
      </Link>
    </div>
  );
}

interface ProblemCardProps {
  question: QuestionEntry;
  book: BookCategory | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

function ProblemCard({ question, book, isOpen, onToggle }: ProblemCardProps) {
  const topicKey = book?.topic ?? '';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden
        ${isOpen
          ? 'border-violet-500/30 bg-violet-500/5'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
        }`}
    >
      {/* Card header — always visible */}
      <button
        id={`problem-card-${question.id}`}
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        {/* Topic colour dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${TOPIC_DOT[topicKey] ?? 'bg-gray-600'}`} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{question.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {book && (
              <span className={`inline-block text-[9px] font-medium px-2 py-0.5 rounded border ${TOPIC_BADGE[topicKey] ?? 'bg-white/10 text-gray-400 border-white/10'}`}>
                {book.title}
              </span>
            )}
            <span className="text-[10px] text-gray-600">{formatDate(question.createdAt)}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/[0.06] space-y-5 pt-4">

          {question.problemStatement && (
            <section>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">🧩 Problem</p>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed bg-black/20 rounded-xl px-4 py-3 border border-white/5 overflow-x-auto">
                {question.problemStatement}
              </pre>
            </section>
          )}

          {question.solutionCode && (
            <section>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">💻 Solution</p>
              <pre className="whitespace-pre-wrap text-sm text-emerald-300 font-mono leading-relaxed bg-[#0a0c10] rounded-xl px-4 py-3 border border-white/5 overflow-x-auto">
                {question.solutionCode}
              </pre>
            </section>
          )}

          {question.solutionExplanation && (
            <section>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">📝 Explanation</p>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed bg-black/20 rounded-xl px-4 py-3 border border-white/5 overflow-x-auto">
                {question.solutionExplanation}
              </pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PublicProfile ────────────────────────────────────────────────────────────

type PageState = 'loading' | 'not_found' | 'loaded';

export default function PublicProfile() {
  const { username = '' } = useParams<{ username: string }>();

  const [pageState, setPageState]   = useState<PageState>('loading');
  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [questions, setQuestions]   = useState<QuestionEntry[]>([]);
  const [books, setBooks]           = useState<BookCategory[]>([]);
  const [search, setSearch]         = useState('');
  const [openId, setOpenId]         = useState<string | null>(null);
  const [activeFilter, setFilter]   = useState<string>('all');

  useEffect(() => {
    if (!username) { setPageState('not_found'); return; }

    async function load() {
      setPageState('loading');
      const [prof, bks] = await Promise.all([
        StorageService.getPublicProfile(username),
        StorageService.getBooks(),
      ]);

      if (!prof) { setPageState('not_found'); return; }

      const qs = await StorageService.getPublicQuestions(prof.id);
      setProfile(prof);
      setBooks(bks);
      setQuestions(qs);
      setPageState('loaded');
    }

    load();
  }, [username]);

  if (pageState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0f14]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-xs text-gray-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (pageState === 'not_found') return <NotFound username={username} />;

  // ── Loaded ────────────────────────────────────────────────────────────────

  const bookMap = new Map(books.map(b => [b.id, b]));

  // Unique topics present in this user's questions
  const topicsPresent = [...new Set(
    questions.map(q => bookMap.get(q.bookId)?.topic).filter(Boolean) as string[]
  )];

  const filtered = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesTopic  = activeFilter === 'all' || bookMap.get(q.bookId)?.topic === activeFilter;
    return matchesSearch && matchesTopic;
  });

  const initial = profile!.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-100">

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-72 bg-violet-600/8 blur-[120px] pointer-events-none" />

      {/* Nav bar */}
      <nav className="sticky top-0 z-10 border-b border-white/5 bg-[#0d0f14]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow shadow-violet-500/30">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">CookLog</span>
          </Link>
          <span className="text-xs text-gray-600 font-mono">@{username}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Profile hero */}
        <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden p-7">
          {/* Subtle top gradient strip */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 text-2xl font-bold text-white shadow-lg shadow-violet-500/30">
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{profile!.displayName}</h1>
              <p className="text-sm text-gray-500 font-mono mt-0.5">@{profile!.username}</p>

              {profile!.bio && (
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">{profile!.bio}</p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-white">{questions.length}</span>
                  <span className="text-xs text-gray-500">{questions.length === 1 ? 'problem' : 'problems'} solved</span>
                </div>
                {topicsPresent.map(topic => (
                  <span
                    key={topic}
                    className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded border ${TOPIC_BADGE[topic] ?? 'bg-white/10 text-gray-400 border-white/10'}`}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters + search */}
        {questions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Topic filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', ...topicsPresent] as string[]).map(f => (
                <button
                  key={f}
                  id={`filter-${f}`}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                    activeFilter === f
                      ? 'bg-violet-600 text-white shadow shadow-violet-900'
                      : 'bg-white/5 text-gray-500 hover:text-gray-300 border border-white/[0.06]'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="profile-search"
                type="text"
                placeholder="Search problems…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-52 pl-9 pr-3 py-2 bg-white/5 border border-white/[0.08] rounded-lg
                           text-xs text-gray-300 placeholder-gray-600
                           focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50
                           transition-all"
              />
            </div>
          </div>
        )}

        {/* Problem list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              {search || activeFilter !== 'all' ? 'No problems match your filters.' : 'No problems logged yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(q => (
              <ProblemCard
                key={q.id}
                question={q}
                book={bookMap.get(q.bookId)}
                isOpen={openId === q.id}
                onToggle={() => setOpenId(prev => prev === q.id ? null : q.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-6">
        <p className="text-center text-[11px] text-gray-700">
          Built with <span className="text-violet-500">CookLog</span> — your problem-solving journal
        </p>
      </footer>
    </div>
  );
}
