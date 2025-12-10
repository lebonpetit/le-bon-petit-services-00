-- COMPLETE FIX: Admin visibility and tenant signup
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: Create the is_admin function if not exists
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- ============================================
-- STEP 2: Drop ALL existing policies on users table
-- ============================================
DROP POLICY IF EXISTS "select_own_profile" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "insert_on_signup" ON public.users;
DROP POLICY IF EXISTS "admin_view_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_update_all_users" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;

-- ============================================
-- STEP 3: Create proper policies for users table
-- ============================================

-- SELECT: Users can view their own profile OR admins can view all
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Users can view their own profile
    OR
    public.is_admin()  -- Admins can view all
  );

-- UPDATE: Users can update their own profile OR admins can update all
CREATE POLICY "users_update_policy"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- INSERT: Anyone authenticated can insert (for signup)
-- This is crucial - allow insert for new signups
CREATE POLICY "users_insert_policy"
  ON public.users FOR INSERT
  WITH CHECK (true);  -- Allow all inserts (will be controlled by app logic)

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Fix subscriptions table policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "admin_manage_subscriptions" ON public.subscriptions;

-- Allow users to view their own subscriptions
CREATE POLICY "subscriptions_select_policy"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    public.is_admin()
  );

-- Allow inserts during signup
CREATE POLICY "subscriptions_insert_policy"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);  -- Controlled by app logic

-- Allow updates by admin
CREATE POLICY "subscriptions_update_policy"
  ON public.subscriptions FOR UPDATE
  USING (public.is_admin());

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Check if table has correct columns
-- ============================================
-- Make sure the users table has all required columns with defaults
DO $$
BEGIN
  -- Add status column with default if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN status TEXT DEFAULT 'pending'
    CHECK (status IN ('active', 'pending', 'blocked'));
  END IF;
END $$;

-- ============================================
-- STEP 6: Verify everything is set up
-- ============================================
SELECT 
  'is_admin function exists' as check_name,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_admin') as result
UNION ALL
SELECT 
  'users table has RLS enabled',
  relrowsecurity FROM pg_class WHERE relname = 'users'
UNION ALL
SELECT 
  'subscriptions table has RLS enabled',
  relrowsecurity FROM pg_class WHERE relname = 'subscriptions';

SELECT 'All fixes applied! Please test again.' as message;
