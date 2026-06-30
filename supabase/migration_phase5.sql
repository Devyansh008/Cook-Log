-- ═══════════════════════════════════════════════════════════════════════════════
-- CookLog — Phase 5 Migration
-- Paste into: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─── 1. profiles table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT        NOT NULL UNIQUE,
  display_name TEXT        NOT NULL DEFAULT '',
  bio          TEXT        NOT NULL DEFAULT '',
  avatar_url   TEXT        NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index on username for fast /user/:username lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── RLS for profiles ──────────────────────────────────────────────────────────

-- Anyone (including unauthenticated visitors) can read any profile
CREATE POLICY "profiles: public read"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Only the owner can insert their own profile row
CREATE POLICY "profiles: owner can insert"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Only the owner can update their own profile
CREATE POLICY "profiles: owner can update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─── 2. Auto-create profile on sign-up ───────────────────────────────────────
--
-- This trigger fires after every INSERT into auth.users and creates a profile
-- row. The default username is derived from the email prefix. A random suffix
-- is appended if that prefix is already taken.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  attempt       INT := 0;
BEGIN
  -- Derive base username from email (everything before '@'), lowercase, strip dots
  base_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;

  final_username := base_username;

  -- Resolve collisions by appending a numeric suffix
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    attempt := attempt + 1;
    final_username := base_username || attempt::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, final_username, final_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 3. Backfill profiles for existing users ─────────────────────────────────
--
-- Creates profile rows for any auth.users that don't have one yet.
-- Safe to re-run — ON CONFLICT (id) DO NOTHING skips existing rows.

INSERT INTO public.profiles (id, username, display_name)
SELECT
  u.id,
  lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9_]', '', 'g')),
  lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9_]', '', 'g'))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;


-- ─── 4. Make question_entries publicly readable ───────────────────────────────
--
-- The existing "questions: owner can read" policy only lets a user read their
-- own rows. For the public profile page to display another user's problems,
-- we need a permissive SELECT that works for unauthenticated visitors too.
--
-- Drop the restrictive owner-only read policy and replace with public read.

DROP POLICY IF EXISTS "questions: owner can read" ON public.question_entries;

CREATE POLICY "questions: public read"
  ON public.question_entries
  FOR SELECT
  USING (true);

-- Write policies (INSERT / UPDATE / DELETE) remain owner-only — unchanged.
