import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import {
    Home, LogOut, MessageCircle, CreditCard, Building2, Plus,
    Users, Package, Settings, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
}

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    navItems: NavItem[];
}

export function DashboardLayout({ children, title, subtitle, navItems }: DashboardLayoutProps) {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="Le Bon Petit" className="h-8 w-8 rounded-lg object-cover" />
                        <span className="font-heading font-bold text-lg">Le Bon Petit</span>
                    </Link>

                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={signOut}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>


            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
                sidebarCollapsed ? "w-16" : "w-64",
                "lg:translate-x-0",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className={cn(
                    "h-16 border-b border-border flex items-center",
                    sidebarCollapsed ? "justify-center px-2" : "px-4"
                )}>
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Le Bon Petit" className="h-10 w-10 rounded-lg object-cover" />
                        {!sidebarCollapsed && (
                            <span className="font-heading font-bold text-lg">Le Bon Petit</span>
                        )}
                    </Link>
                </div>

                {/* User Info */}
                {!sidebarCollapsed && (
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                )}
                {sidebarCollapsed && (
                    <div className="p-2 border-b border-border flex justify-center">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-2 flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group",
                                            isActive
                                                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20"
                                                : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground",
                                            sidebarCollapsed && "justify-center"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
                                        {!sidebarCollapsed && (
                                            <span className="flex-1 truncate text-sm">{item.label}</span>
                                        )}
                                        {item.badge != null && item.badge > 0 && (
                                            <span className={cn(
                                                "min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50",
                                                item.badgeColor || "bg-african-red",
                                                sidebarCollapsed && "absolute -top-1 -right-1"
                                            )}>
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom Actions */}
                <div className="p-2 border-t border-border">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                            sidebarCollapsed && "justify-center"
                        )}
                        onClick={signOut}
                    >
                        <LogOut className="h-5 w-5" />
                        {!sidebarCollapsed && <span>Déconnexion</span>}
                    </Button>
                </div>

                {/* Collapse Toggle - Desktop only */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            </aside>

            {/* Main Content */}
            <main className={cn(
                "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
                sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
            )}>
                {/* Header */}
                <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-6 bg-card">
                    <div>
                        <h1 className="font-heading text-xl font-bold">{title}</h1>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Bienvenue, <strong>{user?.name?.split(' ')[0]}</strong>
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Pre-defined nav items for each role
export const tenantNavItems: NavItem[] = [
    { label: 'Tableau de bord', href: '/tenant/dashboard', icon: Home },
    { label: 'Messages', href: '/tenant/messages', icon: MessageCircle },
    { label: 'Mon abonnement', href: '/tenant/subscription', icon: CreditCard },
];

export const landlordNavItems: NavItem[] = [
    { label: 'Tableau de bord', href: '/landlord/dashboard', icon: Home },
    { label: 'Mes logements', href: '/landlord/listings', icon: Building2 },
    { label: 'Ajouter un logement', href: '/landlord/add-listing', icon: Plus },
    { label: 'Demandes', href: '/landlord/requests', icon: Package },
    { label: 'Messages', href: '/landlord/messages', icon: MessageCircle },
];

export const getAdminNavItems = (badges?: { pendingTenants?: number; newRequests?: number; unreadMessages?: number }): NavItem[] => [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: Home },
    { label: 'Locataires', href: '/admin/tenants', icon: Users, badge: badges?.pendingTenants, badgeColor: 'bg-african-yellow' },
    { label: 'Bailleurs', href: '/admin/landlords', icon: Building2 },
    { label: 'Logements', href: '/admin/listings', icon: Building2 },
    { label: 'Publier un logement', href: '/admin/add-listing', icon: Plus },
    { label: 'Demandes', href: '/admin/requests', icon: Package, badge: badges?.newRequests, badgeColor: 'bg-african-red' },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
];

/** @deprecated Use getAdminNavItems() instead */
export const adminNavItems: NavItem[] = getAdminNavItems();
