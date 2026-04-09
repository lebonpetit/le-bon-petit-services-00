import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireActive?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireActive = true }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden animate-pulse">
                        <img src="/logo.jpg" alt="Le Bon Petit" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    if (requireActive && user.status !== 'active' && user.role === 'tenant') {
        return <Navigate to="/pending-payment" replace />;
    }

    if (user.status === 'blocked') {
        return <Navigate to="/account-blocked" replace />;
    }

    return <>{children}</>;
}
