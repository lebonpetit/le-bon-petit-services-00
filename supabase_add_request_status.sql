-- Update status check constraint for requests table
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;

ALTER TABLE public.requests 
ADD CONSTRAINT requests_status_check 
CHECK (status IN ('new', 'processed', 'cancelled'));
