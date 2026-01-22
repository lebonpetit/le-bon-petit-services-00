import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Package, Flame, Shirt, Trash2, Building2, User, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Gestion d'ordure", href: "/poubelles", icon: Trash2 },
  { name: "Livraison de gaz", href: "/gaz", icon: Flame },
  { name: "Expédition de colis", href: "/colis", icon: Package },
  { name: "Ramassage lessive", href: "/lessive", icon: Shirt },
  { name: "Nettoyage & Assainissement", href: "/nettoyage", icon: Sparkles },
  { name: "Logement", href: "/logements", icon: Building2 },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Check if current path matches navigation item
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getDashboardLink = () => {
    if (!user) return "/logements";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "landlord":
        return "/landlord/dashboard";
      case "tenant":
        return "/tenant/dashboard";
      default:
        return "/logements";
    }
  };

  const getRoleName = () => {
    if (!user) return "";
    switch (user.role) {
      case "admin":
        return "Administrateur";
      case "landlord":
        return "Bailleur";
      case "tenant":
        return "Locataire";
      default:
        return "Utilisateur";
    }
  };

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      {/* Ndop-inspired top border */}
      <div className="h-1 ndop-border" />

      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 lg:h-28 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.jpg"
              alt="Le Bon Petit Logo"
              className="h-16 lg:h-24 w-auto rounded-xl object-cover shadow-soft group-hover:shadow-card transition-shadow duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          {!user && (
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 ${active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                      }`}
                  >
                    {item.name}
                    {/* Active underline indicator */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${active ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                        }`}
                    />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex gap-1 sm:gap-2 px-2 sm:px-3">
                    <User className="h-4 w-4" />
                    <span className="max-w-[60px] sm:max-w-[100px] truncate text-xs sm:text-sm">{user.name?.split(' ')[0] || 'Compte'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleName()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      <Building2 className="h-4 w-4 mr-2" />
                      Mon espace
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="cta" size="sm" className="flex px-3 sm:px-4 text-xs sm:text-sm" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[calc(100%+1px)] left-0 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-lg animate-slide-up py-4">
            <div className="flex flex-col gap-2">
              {!user &&
                navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-foreground hover:bg-secondary'
                        }`}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">{item.name}</span>
                      {active && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </Link>
                  );
                })}

              {user ? (
                <>
                  <div className="px-4 py-2 mt-2 border-t border-border">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleName()}</p>
                  </div>
                  <Button variant="outline" className="mx-4" asChild>
                    <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Mon espace
                    </Link>
                  </Button>
                  <Button variant="ghost" className="mx-4 text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button variant="cta" className="mt-2 mx-4" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

