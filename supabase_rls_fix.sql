-- FINAL FIX: RLS Policies for ALL users
-- Run this in Supabase SQL Editor

-- Step 1: Drop all existing policies on users table
DROP POLICY IF EXISTS "select_own_profile" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "insert_on_signup" ON public.users;
DROP POLICY IF EXISTS "admin_view_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_update_all_users" ON public.users;

-- Step 2: Create ONE simple SELECT policy that covers all cases
-- Using OR conditions in a single policy
CREATE POLICY "users_select_policy"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Users can always view their own profile
    OR
    public.is_admin()  -- Admins can view all
  );

-- Step 3: Update policy - users can update themselves, admins can update anyone
CREATE POLICY "users_update_policy"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- Step 4: Insert policy - anyone can insert during signup
CREATE POLICY "users_insert_policy"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Also ensure listings work for tenants (they need to view listings)
DROP POLICY IF EXISTS "view_listings" ON public.listings;
DROP POLICY IF EXISTS "owner_manage_listings" ON public.listings;
DROP POLICY IF EXISTS "Landlords can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Landlords can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Landlords can delete their own listings" ON public.listings;

-- Anyone authenticated can view available listings
CREATE POLICY "listings_select_policy"
  ON public.listings FOR SELECT
  USING (
    available = true  -- Anyone can see available listings
    OR owner_id = auth.uid()  -- Owners see their own
    OR public.is_admin()  -- Admins see all
  );

-- Owners and admins can insert/update/delete
CREATE POLICY "listings_insert_policy"
  ON public.listings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "listings_update_policy"
  ON public.listings FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "listings_delete_policy"
  ON public.listings FOR DELETE
  USING (owner_id = auth.uid() OR public.is_admin());

-- Verify
SELECT 'All RLS policies have been fixed!' as status;
