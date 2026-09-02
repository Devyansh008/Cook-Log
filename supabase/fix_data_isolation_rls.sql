-- ═══════════════════════════════════════════════════════════════════════════════
-- CookLog — Fix User Data Isolation & Strict RLS on question_entries
-- Paste into: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Ensure Row-Level Security is enabled on question_entries
ALTER TABLE public.question_entries ENABLE ROW LEVEL SECURITY;

-- 2. Drop any overly permissive or existing policies on question_entries
DROP POLICY IF EXISTS "questions: public read" ON public.question_entries;
DROP POLICY IF EXISTS "questions: owner can read" ON public.question_entries;
DROP POLICY IF EXISTS "questions: owner can insert" ON public.question_entries;
DROP POLICY IF EXISTS "questions: owner can update" ON public.question_entries;
DROP POLICY IF EXISTS "questions: owner can delete" ON public.question_entries;
DROP POLICY IF EXISTS "Allow all for question_entries" ON public.question_entries;

-- 3. Create strict RLS policies restricted to auth.uid() = user_id

-- SELECT: Authenticated users can ONLY query and view their own questions
CREATE POLICY "questions: owner can read"
  ON public.question_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Authenticated users can ONLY insert rows assigned to their own user_id
CREATE POLICY "questions: owner can insert"
  ON public.question_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Authenticated users can ONLY update their own question entries
CREATE POLICY "questions: owner can update"
  ON public.question_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Authenticated users can ONLY delete their own question entries
CREATE POLICY "questions: owner can delete"
  ON public.question_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Ensure index exists for performant user_id lookups
CREATE INDEX IF NOT EXISTS idx_question_entries_user_id
  ON public.question_entries (user_id);
