import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/auth';
import type { QuestionEntry, BookCategory } from '../types';

// ─── Default seed books ─────────────────────────────────────────────────────

const SEED_BOOKS: BookCategory[] = [
  { id: 'book-dsa',    title: 'Data Structures & Algorithms', topic: 'algorithms' },
  { id: 'book-coding', title: 'Coding Patterns',              topic: 'coding'     },
  { id: 'book-math',   title: 'Mathematics',                  topic: 'math'       },
];

function makeId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

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

interface FormState {
  id: string;
  title: string;
  bookId: string;
  problemStatement: string;
  solutionCode: string;
  solutionExplanation: string;
}

function emptyForm(defaultBookId: string): FormState {
  return {
    id: makeId(),
    title: '',
    bookId: defaultBookId,
    problemStatement: '',
    solutionCode: '',
    solutionExplanation: '',
  };
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [books, setBooks]         = useState<BookCategory[]>([]);
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [form, setForm]           = useState<FormState>(emptyForm(''));
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'explanation'>('problem');
  const [signingOut, setSigningOut] = useState(false);

  const reload = useCallback(async () => {
    const stored = await StorageService.getBooks();
    const merged = [
      ...SEED_BOOKS.filter(sb => !stored.some(b => b.id === sb.id)),
      ...stored,
    ];
    setBooks(merged);
    setQuestions(await StorageService.getQuestions());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (books.length && !form.bookId) {
      setForm(f => ({ ...f, bookId: books[0].id }));
    }
  }, [books]);

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()),
  );

  const activeBook = books.find(b => b.id === form.bookId);

  function handleNew() {
    setForm(emptyForm(books[0]?.id ?? ''));
    setActiveId(null);
    setSaved(false);
    setActiveTab('problem');
  }

  function handleSelect(q: QuestionEntry) {
    setForm({
      id: q.id,
      title: q.title,
      bookId: q.bookId,
      problemStatement: q.problemStatement,
      solutionCode: q.solutionCode,
      solutionExplanation: q.solutionExplanation,
    });
    setActiveId(q.id);
    setSaved(false);
    setActiveTab('problem');
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const entry: QuestionEntry = {
      id: form.id,
      userId: user.id,
      bookId: form.bookId,
      title: form.title.trim(),
      problemStatement: form.problemStatement,
      solutionCode: form.solutionCode,
      solutionExplanation: form.solutionExplanation,
      createdAt: new Date().toISOString(),
    };
    await StorageService.saveQuestion(entry);
    await reload();
    setActiveId(form.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex h-screen bg-[#0d0f14] text-gray-100 font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 min-w-[288px] flex flex-col border-r border-white/5 bg-[#111318]">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">CookLog</h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">Problem Editor</p>
            </div>
          </div>

          <button
            id="btn-new-entry"
            onClick={handleNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="sidebar-search"
              type="text"
              placeholder="Search problems…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/[0.08] rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">No problems yet.</p>
              <p className="text-[11px] text-gray-700 mt-1">Save your first entry →</p>
            </div>
          ) : (
            filteredQuestions.map(q => {
              const book = books.find(b => b.id === q.bookId);
              const isActive = q.id === activeId;
              return (
                <button
                  key={q.id}
                  id={`sidebar-item-${q.id}`}
                  onClick={() => handleSelect(q)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-violet-600/20 border border-violet-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-violet-200' : 'text-gray-300 group-hover:text-white'}`}>
                    {q.title}
                  </p>
                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    {book && (
                      <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded border ${TOPIC_BADGE[book.topic] ?? 'bg-white/10 text-gray-400 border-white/10'}`}>
                        {book.title}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 ml-auto shrink-0">{formatDate(q.createdAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer — user info + logout */}
        <div className="px-4 py-4 border-t border-white/5 space-y-3">
          {/* Stats */}
          <p className="text-[10px] text-gray-700 px-1">
            {questions.length} {questions.length === 1 ? 'problem' : 'problems'} saved
          </p>

          {/* User badge */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {/* Avatar circle with initials */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 text-[10px] font-bold text-white shadow shadow-violet-500/30">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-300 truncate">{user.email}</p>
              <p className="text-[9px] text-gray-600 mt-0.5">Authenticated</p>
            </div>
          </div>

          {/* Sign out button */}
          <button
            id="btn-sign-out"
            onClick={async () => {
              setSigningOut(true);
              await AuthService.signOut();
              // App's onAuthStateChange listener will unmount Dashboard automatically
            }}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
                       text-[11px] font-medium text-gray-500 hover:text-red-400
                       hover:bg-red-500/10 border border-transparent hover:border-red-500/20
                       disabled:opacity-40 transition-all duration-200"
          >
            {signingOut ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Editor Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0d0f14]/80 backdrop-blur-sm shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {activeId ? 'Edit Problem' : 'New Problem'}
            </h2>
            {activeBook && (
              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded border ${TOPIC_BADGE[activeBook.topic]}`}>
                {activeBook.title}
              </span>
            )}
          </div>

          <button
            id="btn-save"
            onClick={handleSave}
            disabled={!form.title.trim()}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
              saved
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25'
            }`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {activeId ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
          {/* Title + Book row */}
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="input-title" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Problem Title
              </label>
              <input
                id="input-title"
                type="text"
                placeholder="e.g. Two Sum, Binary Search…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="select-book" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Book / Category
              </label>
              <div className="relative">
                <select
                  id="select-book"
                  value={form.bookId}
                  onChange={e => setForm(f => ({ ...f, bookId: e.target.value }))}
                  className="w-full appearance-none px-4 py-3 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all cursor-pointer"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#1a1d24] text-gray-200">
                      {b.title}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
              {(['problem', 'solution', 'explanation'] as const).map(tab => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-900'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'problem' ? '🧩 Problem' : tab === 'solution' ? '💻 Solution' : '📝 Explanation'}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {activeTab === 'problem' && (
                <div>
                  <label htmlFor="textarea-problem" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Problem Statement <span className="normal-case font-normal text-gray-600 ml-1">(Markdown supported)</span>
                  </label>
                  <textarea
                    id="textarea-problem"
                    rows={16}
                    placeholder={`Describe the problem here...\n\n## Example\n**Input:** nums = [2,7,11,15], target = 9\n**Output:** [0,1]`}
                    value={form.problemStatement}
                    onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[#111318] border border-white/[0.08] rounded-xl text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all resize-none font-mono leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}

              {activeTab === 'solution' && (
                <div>
                  <label htmlFor="textarea-solution" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Solution Code <span className="normal-case font-normal text-gray-600 ml-1">(Paste your code here)</span>
                  </label>
                  <textarea
                    id="textarea-solution"
                    rows={16}
                    placeholder={`// Your solution\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement)!, i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`}
                    value={form.solutionCode}
                    onChange={e => setForm(f => ({ ...f, solutionCode: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[#0a0c10] border border-white/[0.08] rounded-xl text-sm text-emerald-300 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all resize-none font-mono leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}

              {activeTab === 'explanation' && (
                <div>
                  <label htmlFor="textarea-explanation" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Solution Explanation <span className="normal-case font-normal text-gray-600 ml-1">(Markdown supported)</span>
                  </label>
                  <textarea
                    id="textarea-explanation"
                    rows={16}
                    placeholder={`## Approach\nExplain your thinking...\n\n## Complexity\n- **Time:** O(n)\n- **Space:** O(n)`}
                    value={form.solutionExplanation}
                    onChange={e => setForm(f => ({ ...f, solutionExplanation: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-[#111318] border border-white/[0.08] rounded-xl text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all resize-none font-mono leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-gray-700">
              {activeTab === 'problem'     && `${form.problemStatement.length} chars`}
              {activeTab === 'solution'    && `${form.solutionCode.length} chars`}
              {activeTab === 'explanation' && `${form.solutionExplanation.length} chars`}
            </p>
            {!form.title.trim() && (
              <p className="text-[11px] text-amber-600/80">⚠ Add a title to enable saving</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
