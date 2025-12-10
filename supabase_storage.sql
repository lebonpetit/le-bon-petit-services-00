-- Supabase Storage Setup for Listings Photos
-- Run this in Supabase SQL Editor

-- Create the storage bucket for listings photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listings',
    'listings',
    true,  -- Public bucket so photos are accessible
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policies for the listings bucket

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Policy: Anyone can view listing photos (public bucket)
CREATE POLICY "Anyone can view listing photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listings');

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own listing photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own listing photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

SELECT 'Storage bucket and policies created!' as status;
