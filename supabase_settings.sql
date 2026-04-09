-- Migration: Créer la table settings pour les paramètres de la plateforme
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- Note: Ce script est idempotent (peut être exécuté plusieurs fois sans erreur)

-- Créer la table settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id)
);

-- Activer RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;

-- Recréer les politiques
CREATE POLICY "Anyone can view settings"
    ON public.settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update settings"
    ON public.settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert settings"
    ON public.settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insérer les paramètres par défaut (ignore si déjà existants)
INSERT INTO public.settings (key, value) VALUES 
    ('platform', '{"company_name": "Le Bon Petit", "contact_phone": "+237 6XX XXX XXX", "contact_email": "contact@lebonpetit.cm", "whatsapp": "+237 6XX XXX XXX", "address": "Douala, Cameroun"}'),
    ('services', '{"colis": true, "gaz": true, "lessive": true, "poubelles": true, "nettoyage": true}'),
    ('subscription', '{"price": 2000, "duration_days": 30, "trial_days": 0}')
ON CONFLICT (key) DO NOTHING;
