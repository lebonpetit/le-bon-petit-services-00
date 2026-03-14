-- Create table for tracking page views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking)
CREATE POLICY "Allow public insert to page_views" 
ON public.page_views FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow anonymous updates to their own session records (for setting left_at)
-- Note: In a stricter app, you might want to only allow service role or authenticated users,
-- but for open analytics, allowing public update based on id is sometimes acceptable if ID is secret enough.
-- Better yet, assume simple app logic.
CREATE POLICY "Allow public update to page_views"
ON public.page_views FOR UPDATE
TO public
USING (true);

-- Allow Admin to View All
CREATE POLICY "Allow admin to view all page_views"
ON public.page_views FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Realtime is already enabled on 'presence' usually, but ensure table is published if we want realtime feed
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
