-- SOLUTION DEFINITIVE: Trigger pour créer automatiquement le profil utilisateur
-- Ce trigger s'exécute côté serveur et contourne les problèmes RLS
-- Exécutez ce script COMPLET dans Supabase SQL Editor

-- ============================================
-- ETAPE 1: Créer une fonction trigger pour créer le profil
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'landlord'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'landlord') = 'tenant' THEN 'pending'
      ELSE 'active'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone);
  
  -- Si c'est un locataire, créer aussi l'abonnement
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'landlord') = 'tenant' THEN
    INSERT INTO public.subscriptions (user_id, start_date, end_date, status)
    VALUES (
      NEW.id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '1 month',
      'pending'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ETAPE 2: Supprimer le trigger existant s'il existe
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- ETAPE 3: Créer le trigger sur la table auth.users
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ETAPE 4: Désactiver temporairement RLS pour effectuer des corrections
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ETAPE 5: Supprimer toutes les politiques existantes
-- ============================================
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_policy" ON public.subscriptions;

-- ============================================
-- ETAPE 6: Recréer la fonction is_admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.users 
  WHERE id = auth.uid();
  RETURN user_role = 'admin';
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- ============================================
-- ETAPE 7: Créer des politiques simples
-- ============================================

-- USERS: Tout le monde peut voir tous les utilisateurs si admin
CREATE POLICY "users_select_policy" ON public.users FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- USERS: Tout le monde peut modifier son profil
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- USERS: Autoriser TOUS les inserts (le trigger gère la création)
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT
  WITH CHECK (true);

-- SUBSCRIPTIONS: Voir ses propres abonnements ou admin voit tout
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- SUBSCRIPTIONS: Autoriser les inserts
CREATE POLICY "subscriptions_insert_policy" ON public.subscriptions FOR INSERT
  WITH CHECK (true);

-- SUBSCRIPTIONS: Admin peut modifier
CREATE POLICY "subscriptions_update_policy" ON public.subscriptions FOR UPDATE
  USING (public.is_admin() OR user_id = auth.uid());

-- ============================================
-- ETAPE 8: Réactiver RLS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ETAPE 9: Créer les profils manquants pour les utilisateurs existants
-- ============================================
INSERT INTO public.users (id, email, name, phone, role, status)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'phone', ''),
  COALESCE(raw_user_meta_data->>'role', 'landlord'),
  CASE 
    WHEN COALESCE(raw_user_meta_data->>'role', 'landlord') = 'tenant' THEN 'pending'
    ELSE 'active'
  END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'Utilisateurs dans auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Profils dans public.users', 
  COUNT(*) 
FROM public.users
UNION ALL
SELECT 
  'Locataires (tenants)', 
  COUNT(*) 
FROM public.users 
WHERE role = 'tenant'
UNION ALL
SELECT 
  'Bailleurs (landlords)', 
  COUNT(*) 
FROM public.users 
WHERE role = 'landlord';

SELECT '✅ TRIGGER CREE! Les nouveaux utilisateurs auront automatiquement un profil.' as message;
