-- Fix for housing reservation error
-- Add 'logement' to the allowed service types in the requests table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.requests 
DROP CONSTRAINT IF EXISTS requests_service_type_check;

ALTER TABLE public.requests 
ADD CONSTRAINT requests_service_type_check 
CHECK (service_type IN ('colis', 'gaz', 'lessive', 'poubelles', 'nettoyage', 'logement'));
