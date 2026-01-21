import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file or Vercel settings.');
}

// Create client with fallback to provided keys to ensure it works on Vercel
// even if environment variables are not set in the dashboard.
export const supabase = createClient(
  supabaseUrl || 'https://lwbwkhscqsdbcyqziqdm.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YndraHNjcXNkYmN5cXppcWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTg2NTMsImV4cCI6MjA4MDkzNDY1M30.Ko6TLh8b29bZ4nB-5kMLZG_ghH3NUqqHfyEUtDsKgjA'
);

// Types for database
export type UserRole = 'tenant' | 'landlord' | 'admin';
export type UserStatus = 'pending' | 'active' | 'blocked';
export type ServiceType = 'colis' | 'gaz' | 'lessive' | 'poubelles' | 'nettoyage' | 'logement';
export type SubscriptionStatus = 'pending' | 'active' | 'expired';
export type RequestStatus = 'new' | 'processed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  quartier: string;
  rue: string | null;
  city: string;
  type_logement: string;
  photos: string[];
  views: number;
  available: boolean;
  furnished: boolean;
  surface: number | null;
  rooms: number;
  has_water: boolean;
  has_electricity: boolean;
  has_parking: boolean;
  created_at: string;
  owner?: User;
}

export interface Message {
  id: string;
  from_user: string;
  to_user: string;
  listing_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ServiceRequest {
  id: string;
  service_type: ServiceType;
  payload: Record<string, unknown>;
  contact_name: string;
  contact_phone: string;
  status: RequestStatus;
  created_at: string;
  landlord_id?: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  payment_ref: string | null;
  user?: User;
}

export interface Payment {
  id: string;
  user_id: string | null;
  request_id: string | null;
  amount: number;
  provider_ref: string | null;
  status: string;
  created_at: string;
}
