-- Le Bon Petit - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  quartier TEXT NOT NULL,
  rue TEXT,
  type_logement TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create requests table (for services without account)
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL CHECK (service_type IN ('colis', 'gaz', 'lessive', 'poubelles')),
  payload JSONB NOT NULL DEFAULT '{}',
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  provider_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_quartier ON public.listings(quartier);
CREATE INDEX IF NOT EXISTS idx_listings_available ON public.listings(available);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON public.messages(from_user);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages(to_user);
CREATE INDEX IF NOT EXISTS idx_requests_service_type ON public.requests(service_type);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- Create function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings
  SET views = views + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user during signup"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Listings policies
CREATE POLICY "Anyone can view available listings"
  ON public.listings FOR SELECT
  USING (available = true OR owner_id = auth.uid());

CREATE POLICY "Landlords can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Landlords can update their own listings"
  ON public.listings FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Landlords can delete their own listings"
  ON public.listings FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (from_user = auth.uid() OR to_user = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (from_user = auth.uid());

CREATE POLICY "Users can update their received messages (mark as read)"
  ON public.messages FOR UPDATE
  USING (to_user = auth.uid());

-- Requests policies (public for insertion, admin for viewing)
CREATE POLICY "Anyone can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all requests"
  ON public.requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON public.requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create admin user (run this after creating an account via the UI)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@lebonpetit.cm';
