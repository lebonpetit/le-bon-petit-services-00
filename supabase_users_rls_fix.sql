-- FIX: Allow users to see profiles of people they messaged with
-- Run this in Supabase SQL Editor

-- Drop existing users policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;

-- Create a new policy that allows:
-- 1. Users to see their own profile
-- 2. Admins to see all profiles
-- 3. Users to see profiles of people they've messaged with
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Own profile
    OR
    public.is_admin()  -- Admin sees all
    OR
    -- Can see profiles of users you've exchanged messages with
    id IN (
      SELECT DISTINCT from_user FROM public.messages WHERE to_user = auth.uid()
      UNION
      SELECT DISTINCT to_user FROM public.messages WHERE from_user = auth.uid()
    )
  );

-- Also allow landlords to be visible to all authenticated users (for listings)
-- This is important so tenants can see landlord names on listings
DROP POLICY IF EXISTS "landlords_visible" ON public.users;
CREATE POLICY "landlords_visible"
  ON public.users FOR SELECT
  USING (
    role = 'landlord'  -- All landlords are visible
  );

-- Verify
SELECT 'Users RLS policies updated! Landlords now visible to tenants.' as status;
