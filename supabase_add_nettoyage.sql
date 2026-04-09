-- Migration: Ajouter le service 'nettoyage' à la table requests
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Supprimer l'ancienne contrainte CHECK
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_service_type_check;

-- Ajouter la nouvelle contrainte avec 'nettoyage'
ALTER TABLE public.requests 
ADD CONSTRAINT requests_service_type_check 
CHECK (service_type IN ('colis', 'gaz', 'lessive', 'poubelles', 'nettoyage'));

-- Note: La politique RLS "Anyone can create requests" devrait déjà exister.
-- Si vous obtenez une erreur sur cette politique, c'est normal - elle est déjà configurée.
