import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SEO } from "./components/SEO";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-xl overflow-hidden animate-pulse">
        <img src="/logo.jpg" alt="Le Bon Petit" className="w-full h-full object-cover" />
      </div>
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

// Lazy-loaded pages for better initial load time
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth Pages - lazy loaded
const Login = lazy(() => import("./pages/auth/Login"));
const RegisterTenant = lazy(() => import("./pages/auth/RegisterTenant"));
const RegisterLandlord = lazy(() => import("./pages/auth/RegisterLandlord"));
const PendingPayment = lazy(() => import("./pages/auth/PendingPayment"));
const AccountBlocked = lazy(() => import("./pages/auth/AccountBlocked"));

// Service Pages - lazy loaded (most visited after home)
const Colis = lazy(() => import("./pages/services/Colis"));
const Gaz = lazy(() => import("./pages/services/Gaz"));
const Lessive = lazy(() => import("./pages/services/Lessive"));
const Poubelles = lazy(() => import("./pages/services/Poubelles"));
const Nettoyage = lazy(() => import("./pages/services/Nettoyage"));
const Demenagement = lazy(() => import("./pages/services/Demenagement"));

// Tenant Pages - lazy loaded
const TenantDashboard = lazy(() => import("./pages/tenant/TenantDashboard"));
const TenantMessages = lazy(() => import("./pages/tenant/Messages"));

// Landlord Pages - lazy loaded
const LandlordDashboard = lazy(() => import("./pages/landlord/LandlordDashboard"));
const LandlordRequests = lazy(() => import("./pages/landlord/LandlordRequestsPage"));
const AddListing = lazy(() => import("./pages/landlord/AddListing"));
const EditListing = lazy(() => import("./pages/landlord/EditListing"));
const LandlordMessages = lazy(() => import("./pages/landlord/Messages"));

// Listing Pages - lazy loaded
const ListingDetail = lazy(() => import("./pages/listings/ListingDetail"));

// Apartment Pages - lazy loaded (public)
const Logements = lazy(() => import("./pages/Logements"));
const ApartmentDetail = lazy(() => import("./pages/apartments/ApartmentDetail"));

// Housing Pages - lazy loaded (public, unfurnished)
const Habitations = lazy(() => import("./pages/Habitations"));
const HabitationDetail = lazy(() => import("./pages/apartments/HabitationDetail"));

// Admin Pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Static Info Pages - lazy loaded
const APropos = lazy(() => import("./pages/APropos"));
const Tarifs = lazy(() => import("./pages/Tarifs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const CGU = lazy(() => import("./pages/CGU"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));

// Protected Route Component - keep sync for fast auth checks
import { ProtectedRoute } from "./components/ProtectedRoute";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

// Redirect based on user role after login
function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'landlord':
      return <Navigate to="/landlord/dashboard" replace />;
    case 'tenant':
      if (user.status === 'pending') {
        return <Navigate to="/pending-payment" replace />;
      }
      if (user.status === 'blocked') {
        return <Navigate to="/account-blocked" replace />;
      }
      return <Navigate to="/tenant/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<><SEO /><Index /></>} />

                {/* Auth Routes */}
                <Route path="/login" element={<><SEO title="Connexion" /><Login /></>} />
                <Route path="/register/tenant" element={<><SEO title="Inscription Locataire" description="Créez votre compte locataire pour accéder à nos services." /><RegisterTenant /></>} />
                <Route path="/register/landlord" element={<><SEO title="Inscription Bailleur" description="Devenez partenaire et publiez vos annonces immobilières." /><RegisterLandlord /></>} />
                <Route path="/pending-payment" element={<PendingPayment />} />
                <Route path="/account-blocked" element={<AccountBlocked />} />
                <Route path="/dashboard" element={<RoleBasedRedirect />} />

                {/* Service Forms (no auth required) */}
                <Route path="/colis" element={<><SEO title="Expédition de Colis" description="Service d'envoi de colis national et international rapide et sécurisé." /><Colis /></>} />
                <Route path="/gaz" element={<><SEO title="Livraison de Gaz" description="Commandez votre bouteille de gaz en ligne et faites-vous livrer à domicile à Douala." /><Gaz /></>} />
                <Route path="/lessive" element={<><SEO title="Service de Lessive" description="Ramassage et livraison de votre lessive à domicile. Pressing de qualité à Douala." /><Lessive /></>} />
                <Route path="/poubelles" element={<><SEO title="Gestion des Ordures" description="Service de collecte et gestion des ordures ménagères à Douala." /><Poubelles /></>} />
                <Route path="/nettoyage" element={<><SEO title="Nettoyage & Entretien" description="Service de nettoyage professionnel pour particuliers et entreprises." /><Nettoyage /></>} />
                <Route path="/demenagement" element={<><SEO title="Déménagement & Aménagement" description="Service de déménagement et aménagement professionnel à Douala." /><Demenagement /></>} />

                {/* Static Info Pages */}
                <Route path="/a-propos" element={<><SEO title="À Propos" description="Découvrez Le Bon Petit, startup camerounaise de services de proximité." /><APropos /></>} />
                <Route path="/tarifs" element={<><SEO title="Tarifs" description="Consultez nos tarifs transparents pour tous nos services." /><Tarifs /></>} />
                <Route path="/faq" element={<><SEO title="FAQ" description="Questions fréquentes sur nos services." /><FAQ /></>} />
                <Route path="/cgu" element={<><SEO title="Conditions Générales d'Utilisation" /><CGU /></>} />
                <Route path="/confidentialite" element={<><SEO title="Politique de Confidentialité" /><Confidentialite /></>} />

                {/* Logements - Public apartment rental section (furnished) */}
                <Route path="/logements" element={<><SEO title="Logements Meublés" description="Trouvez des appartements et studios meublés à louer à Douala." /><Logements /></>} />
                <Route path="/appartements/:id" element={<ApartmentDetail />} />

                {/* Habitations - Public housing rental section (unfurnished) */}
                <Route path="/habitations" element={<><SEO title="Logements Non-Meublés" description="Location d'appartements et maisons non-meublés à Douala." /><Habitations /></>} />
                <Route path="/habitations/:id" element={<HabitationDetail />} />

                {/* Tenant Routes */}
                <Route
                  path="/tenant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['tenant']}>
                      <SEO title="Espace Locataire" />
                      <TenantDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Landlord Routes */}
                <Route
                  path="/landlord/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <LandlordDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landlord/listings"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <LandlordDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landlord/add-listing"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <AddListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landlord/requests"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <LandlordRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landlord/edit-listing/:id"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <EditListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landlord/messages"
                  element={
                    <ProtectedRoute allowedRoles={['landlord']}>
                      <LandlordMessages />
                    </ProtectedRoute>
                  }
                />

                {/* Tenant Messages */}
                <Route
                  path="/tenant/messages"
                  element={
                    <ProtectedRoute allowedRoles={['tenant']}>
                      <TenantMessages />
                    </ProtectedRoute>
                  }
                />

                {/* Listing Detail (accessible to authenticated users) */}
                <Route
                  path="/listings/:id"
                  element={
                    <ProtectedRoute allowedRoles={['tenant', 'landlord', 'admin']}>
                      <ListingDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tenants"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/landlords"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/listings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/requests"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider >
);

export default App;
