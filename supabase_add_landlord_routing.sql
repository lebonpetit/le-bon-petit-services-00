-- Add landlord_id to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_requests_landlord_id ON public.requests(landlord_id);

-- Update RLS Policies for requests table

-- 1. Ensure admins can do everything (usually handled by service_role or broad policies, but let's be explicit)
-- Assuming there's already an admin policy, if not, we'd add it.
-- Based on schema, we have:
-- CREATE POLICY "Admins can view all requests" ON public.requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 2. Allow landlords to see requests assigned to them
CREATE POLICY "Landlords can view their own requests"
ON public.requests
FOR SELECT
TO authenticated
USING (
  landlord_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Allow landlords to update (process) requests assigned to them
CREATE POLICY "Landlords can update their own requests"
ON public.requests
FOR UPDATE
TO authenticated
USING (
  landlord_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  landlord_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
