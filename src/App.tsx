import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

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
                <Route path="/" element={<Index />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register/tenant" element={<RegisterTenant />} />
                <Route path="/register/landlord" element={<RegisterLandlord />} />
                <Route path="/pending-payment" element={<PendingPayment />} />
                <Route path="/account-blocked" element={<AccountBlocked />} />

                {/* Service Forms (no auth required) */}
                <Route path="/colis" element={<Colis />} />
                <Route path="/gaz" element={<Gaz />} />
                <Route path="/lessive" element={<Lessive />} />
                <Route path="/poubelles" element={<Poubelles />} />
                <Route path="/nettoyage" element={<Nettoyage />} />

                {/* Logements - Public apartment rental section (furnished) */}
                <Route path="/logements" element={<Logements />} />
                <Route path="/appartements/:id" element={<ApartmentDetail />} />

                {/* Habitations - Public housing rental section (unfurnished) */}
                <Route path="/habitations" element={<Habitations />} />
                <Route path="/habitations/:id" element={<HabitationDetail />} />

                {/* Tenant Routes */}
                <Route
                  path="/tenant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['tenant']}>
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
