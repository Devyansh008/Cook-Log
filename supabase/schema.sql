-- ═══════════════════════════════════════════════════════════════════════════════
-- CookLog — Supabase Schema
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── 1. book_categories ───────────────────────────────────────────────────────
--
-- Stores the "books" (category containers) that questions belong to.
-- Users can create personal books; the seed books live only in the frontend.

CREATE TABLE IF NOT EXISTS public.book_categories (
  id     TEXT        PRIMARY KEY,          -- matches the 'book-dsa' style IDs from the app
  title  TEXT        NOT NULL,
  topic  TEXT        NOT NULL              -- 'coding' | 'math' | 'algorithms'
);

-- Enable Row-Level Security
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies for book_categories ─────────────────────────────────────────

-- Any authenticated user can read all books (seed books are shared)
CREATE POLICY "books: authenticated users can read"
  ON public.book_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- NOTE: The three seed books live only in the frontend. If you want per-user
-- custom books later, add user_id and uncomment the policies below.
--
-- ALTER TABLE public.book_categories ADD COLUMN user_id UUID REFERENCES auth.users(id);
--
-- CREATE POLICY "books: owner can insert"
--   ON public.book_categories FOR INSERT TO authenticated
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "books: owner can update"
--   ON public.book_categories FOR UPDATE TO authenticated
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "books: owner can delete"
--   ON public.book_categories FOR DELETE TO authenticated
--   USING (auth.uid() = user_id);


-- ─── 2. question_entries ──────────────────────────────────────────────────────
--
-- Each row is one problem + solution logged by a user.

CREATE TABLE IF NOT EXISTS public.question_entries (
  id                   TEXT        PRIMARY KEY,
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id              TEXT        NOT NULL REFERENCES public.book_categories(id) ON DELETE SET NULL,
  title                TEXT        NOT NULL,
  problem_statement    TEXT        NOT NULL DEFAULT '',
  solution_code        TEXT        NOT NULL DEFAULT '',
  solution_explanation TEXT        NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-user lookups (used by every SELECT in StorageService)
CREATE INDEX IF NOT EXISTS idx_question_entries_user_id
  ON public.question_entries (user_id);

-- Enable Row-Level Security
ALTER TABLE public.question_entries ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies for question_entries ────────────────────────────────────────

-- SELECT: users can only read their own questions
CREATE POLICY "questions: owner can read"
  ON public.question_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: users can only insert rows where they are the owner
CREATE POLICY "questions: owner can insert"
  ON public.question_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: users can only update their own questions
CREATE POLICY "questions: owner can update"
  ON public.question_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can only delete their own questions
CREATE POLICY "questions: owner can delete"
  ON public.question_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ─── 3. Seed Data ─────────────────────────────────────────────────────────────
--
-- Insert the three default book categories that the frontend uses as seed books.
-- IDs match exactly the SEED_BOOKS constant in Dashboard.tsx.
-- ON CONFLICT ensures this is safe to re-run on an existing database.

INSERT INTO public.book_categories (id, title, topic)
VALUES
  ('book-dsa',    'Data Structures & Algorithms', 'algorithms'),
  ('book-coding', 'Coding Patterns',              'coding'),
  ('book-math',   'Mathematics',                  'math')
ON CONFLICT (id) DO NOTHING;
