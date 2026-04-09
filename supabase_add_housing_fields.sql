-- Add furnished column to listings table
-- Run this in Supabase SQL Editor

-- Add the furnished column with default value true for existing listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT true;

-- Add city column for better filtering
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Douala';

-- Add surface column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS surface INTEGER;

-- Add number of rooms column (if not using type_logement)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS rooms INTEGER DEFAULT 1;

-- Add utilities info
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS has_water BOOLEAN DEFAULT true;

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS has_electricity BOOLEAN DEFAULT true;

ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT false;

-- Create index for furnished filter
CREATE INDEX IF NOT EXISTS idx_listings_furnished ON public.listings(furnished);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);

-- Update RLS policy for public access to available listings
DROP POLICY IF EXISTS "Anyone can view available listings" ON public.listings;

CREATE POLICY "Anyone can view available listings"
  ON public.listings FOR SELECT
  USING (available = true);

-- Comment: After running this migration, existing listings will have furnished=true
-- New unfurnished listings can be added with furnished=false
