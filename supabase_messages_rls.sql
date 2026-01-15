-- COMPLETE FIX: Messages RLS Policies
-- This fixes the issue where users can't see their conversations
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop ALL existing message policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages (mark as read)" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;

-- ============================================
-- STEP 2: Temporarily disable RLS
-- ============================================
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create new comprehensive policies
-- ============================================

-- SELECT: Users can view messages they sent OR received
CREATE POLICY "messages_select_policy"
  ON public.messages FOR SELECT
  USING (
    from_user = auth.uid() 
    OR to_user = auth.uid()
    OR public.is_admin()
  );

-- INSERT: Authenticated users can send messages (from themselves)
CREATE POLICY "messages_insert_policy"
  ON public.messages FOR INSERT
  WITH CHECK (from_user = auth.uid());

-- UPDATE: Recipients can update messages (mark as read) or self
CREATE POLICY "messages_update_policy"
  ON public.messages FOR UPDATE
  USING (
    to_user = auth.uid() 
    OR from_user = auth.uid()
    OR public.is_admin()
  );

-- DELETE: Only admin can delete messages
CREATE POLICY "messages_delete_policy"
  ON public.messages FOR DELETE
  USING (public.is_admin());

-- ============================================
-- STEP 4: Re-enable RLS
-- ============================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Verify the policies
-- ============================================
SELECT 
  policyname, 
  cmd, 
  qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'messages';

-- ============================================
-- STEP 6: Check message count for verification
-- ============================================
SELECT 
  'Total messages in database' as description,
  COUNT(*) as count 
FROM public.messages;

SELECT '✅ Messages RLS policies have been fixed!' as status;
