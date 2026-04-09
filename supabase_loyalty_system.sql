-- Le Bon Petit - Loyalty System & User Role Migration
-- Run this in Supabase SQL Editor

-- 1. Add 'user' role to users table constraint
-- First drop the existing constraint, then re-create with 'user' included
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Ensure existing rows have a valid role before adding the constraint
UPDATE public.users SET role = 'user' WHERE role IS NULL OR role NOT IN ('tenant', 'landlord', 'admin', 'user');

ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('tenant', 'landlord', 'admin', 'user'));

-- 2. Add loyalty columns to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_available BOOLEAN NOT NULL DEFAULT false;

-- 3. Add user_id column to requests table (nullable, for logged-in users)
ALTER TABLE public.requests 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. Update requests status constraint to include 'cancelled'
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;

-- Clean up invalid statuses
UPDATE public.requests SET status = 'new' WHERE status IS NULL OR status NOT IN ('new', 'processed', 'cancelled');

ALTER TABLE public.requests ADD CONSTRAINT requests_status_check 
  CHECK (status IN ('new', 'processed', 'cancelled'));

-- 5. Add service_type values for demenagement
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_service_type_check;

-- Clean up invalid service types
UPDATE public.requests SET service_type = 'colis' WHERE service_type IS NULL OR service_type NOT IN ('colis', 'gaz', 'lessive', 'poubelles', 'nettoyage', 'demenagement', 'personnel');

ALTER TABLE public.requests ADD CONSTRAINT requests_service_type_check 
  CHECK (service_type IN ('colis', 'gaz', 'lessive', 'poubelles', 'nettoyage', 'demenagement', 'personnel'));

-- 6. Create index on requests.user_id
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);

-- 7. RLS: Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON public.requests FOR SELECT
  USING (user_id = auth.uid());

-- 8. RLS: Users can update their own requests (for cancellation)
CREATE POLICY "Users can update their own requests"
  ON public.requests FOR UPDATE
  USING (user_id = auth.uid());

-- 9. Function to award loyalty point when request is processed
CREATE OR REPLACE FUNCTION award_loyalty_point()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'processed' and request has a user_id
  IF NEW.status = 'processed' AND OLD.status != 'processed' AND NEW.user_id IS NOT NULL THEN
    UPDATE public.users
    SET 
      loyalty_points = loyalty_points + 1,
      discount_available = CASE WHEN loyalty_points + 1 >= 10 THEN true ELSE false END
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger on requests table
DROP TRIGGER IF EXISTS trigger_award_loyalty ON public.requests;
CREATE TRIGGER trigger_award_loyalty
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION award_loyalty_point();

-- 11. Function to redeem discount (reset points)
CREATE OR REPLACE FUNCTION redeem_loyalty_discount(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_discount BOOLEAN;
BEGIN
  SELECT discount_available INTO v_discount
  FROM public.users
  WHERE id = p_user_id;

  IF v_discount THEN
    UPDATE public.users
    SET loyalty_points = loyalty_points - 10,
        discount_available = CASE WHEN loyalty_points - 10 >= 10 THEN true ELSE false END
    WHERE id = p_user_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
