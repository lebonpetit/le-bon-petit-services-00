-- Add 'personnel' to the allowed service_type values in the requests table
-- Run this SQL in Supabase SQL Editor before using the Personnel service forms

ALTER TABLE public.requests
DROP CONSTRAINT IF EXISTS requests_service_type_check;

ALTER TABLE public.requests
ADD CONSTRAINT requests_service_type_check 
CHECK (service_type IN ('colis', 'gaz', 'lessive', 'poubelles', 'nettoyage', 'logement', 'personnel'));
