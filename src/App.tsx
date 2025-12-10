import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import RegisterTenant from "./pages/auth/RegisterTenant";
import RegisterLandlord from "./pages/auth/RegisterLandlord";
import PendingPayment from "./pages/auth/PendingPayment";
import AccountBlocked from "./pages/auth/AccountBlocked";

// Service Pages (no auth required)
import Colis from "./pages/services/Colis";
import Gaz from "./pages/services/Gaz";
import Lessive from "./pages/services/Lessive";
import Poubelles from "./pages/services/Poubelles";

// Tenant Pages
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantMessages from "./pages/tenant/Messages";

// Landlord Pages
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import AddListing from "./pages/landlord/AddListing";
import EditListing from "./pages/landlord/EditListing";
import LandlordMessages from "./pages/landlord/Messages";

// Listing Pages
import ListingDetail from "./pages/listings/ListingDetail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Protected Route Component
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Redirect based on user role after login
function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  console.log('RoleBasedRedirect - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground font-heading font-bold text-xl">BP</span>
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User role:', user.role, 'status:', user.status);

  switch (user.role) {
    case 'admin':
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    case 'landlord':
      console.log('Redirecting to landlord dashboard');
      return <Navigate to="/landlord/dashboard" replace />;
    case 'tenant':
      if (user.status === 'pending') {
        console.log('Tenant pending, redirecting to pending-payment');
        return <Navigate to="/pending-payment" replace />;
      }
      if (user.status === 'blocked') {
        console.log('Tenant blocked, redirecting to account-blocked');
        return <Navigate to="/account-blocked" replace />;
      }
      console.log('Redirecting to tenant dashboard');
      return <Navigate to="/tenant/dashboard" replace />;
    default:
      console.log('Unknown role, redirecting to home');
      return <Navigate to="/" replace />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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

            {/* Logements redirect - goes to login for auth */}
            <Route path="/logements" element={<RoleBasedRedirect />} />

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
              path="/landlord/add-listing"
              element={
                <ProtectedRoute allowedRoles={['landlord']}>
                  <AddListing />
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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
