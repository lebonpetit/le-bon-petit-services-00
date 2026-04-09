-- ============================================================
-- Migration: Service Request Tracking System
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Update status constraint to include new statuses
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;

ALTER TABLE public.requests 
ADD CONSTRAINT requests_status_check 
CHECK (status IN ('new', 'approved', 'rejected', 'in_progress', 'completed', 'processed', 'cancelled'));

-- 2. Add tracking columns
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS assigned_agent_name TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS progress_note TEXT;

-- 3. Migrate existing 'processed' status to 'completed'
UPDATE public.requests 
SET status = 'completed', completed_at = NOW() 
WHERE status = 'processed';

-- 4. Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_requests_assigned_agent ON public.requests(assigned_agent_name);
CREATE INDEX IF NOT EXISTS idx_requests_approved_at ON public.requests(approved_at);
CREATE INDEX IF NOT EXISTS idx_requests_completed_at ON public.requests(completed_at);

-- 5. Allow users to view their own requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
CREATE POLICY "Users can view their own requests"
  ON public.requests FOR SELECT
  USING (user_id = auth.uid());
