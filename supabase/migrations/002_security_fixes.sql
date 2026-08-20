-- Luna Migration 002 — Security Fixes & Hardening
-- Run this after 001_initial_schema.sql

--------------------------------------------------------------------------------
-- FIX M-2: Add DELETE policy on user_profiles
-- Previously missing — without this, deleteAccountAction's profile cleanup
-- fails silently under RLS (the admin client deletion of auth.users
-- still cascades, but belt-and-suspenders is better).
--------------------------------------------------------------------------------
CREATE POLICY "Users can delete their own profile"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = id);

--------------------------------------------------------------------------------
-- FIX C-8: Canonical UUID ordering for connections table
-- Prevents (A,B) and (B,A) duplicate connection pairs.
-- The CHECK constraint enforces cat_a_id < cat_b_id (lexicographic UUID order).
-- The application layer (acceptConnectionRequestAction) must normalize the order
-- when inserting: always assign the lexicographically smaller UUID to cat_a_id.
--------------------------------------------------------------------------------

-- Add canonical ordering check (prevents reverse duplicates)
ALTER TABLE public.connections
  ADD CONSTRAINT connections_canonical_order
  CHECK (cat_a_id < cat_b_id);

-- Drop the old partial unique constraint and replace with canonical one
-- (The old UNIQUE(cat_a_id, cat_b_id) only covers one direction)
-- Note: The original UNIQUE constraint is already present from migration 001.
-- The CHECK above now ensures only one canonical ordering can exist.

--------------------------------------------------------------------------------
-- FIX: Add INSERT policy for connections (acceptConnectionRequestAction needs it)
--------------------------------------------------------------------------------
CREATE POLICY "Cat owners can insert connections" ON public.connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cats
      WHERE (id = cat_a_id OR id = cat_b_id) AND owner_id = auth.uid()
    )
  );

--------------------------------------------------------------------------------
-- FIX: Add UPDATE policy for conversations (sendMessageAction updates last_message_at)
--------------------------------------------------------------------------------
CREATE POLICY "Connection participants can update conversation" ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.connections conn
      JOIN public.cats c1 ON conn.cat_a_id = c1.id
      JOIN public.cats c2 ON conn.cat_b_id = c2.id
      WHERE conn.id = connection_id AND (c1.owner_id = auth.uid() OR c2.owner_id = auth.uid())
    )
  );

--------------------------------------------------------------------------------
-- FIX: Add INSERT policy for conversations (acceptConnectionRequestAction creates them)
--------------------------------------------------------------------------------
CREATE POLICY "Cat owners can insert conversations" ON public.conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.connections conn
      JOIN public.cats c1 ON conn.cat_a_id = c1.id
      JOIN public.cats c2 ON conn.cat_b_id = c2.id
      WHERE conn.id = connection_id AND (c1.owner_id = auth.uid() OR c2.owner_id = auth.uid())
    )
  );
