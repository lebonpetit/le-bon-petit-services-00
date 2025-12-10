import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Package, Flame, Shirt, Trash2, Building2, User, LogOut } from "lucide-react";
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
  { name: "Colis", href: "/colis", icon: Package },
  { name: "Gaz", href: "/gaz", icon: Flame },
  { name: "Lessive", href: "/lessive", icon: Shirt },
  { name: "Poubelles", href: "/poubelles", icon: Trash2 },
  { name: "Logements", href: "/logements", icon: Building2 },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow duration-300">
                <span className="text-primary-foreground font-heading font-bold text-lg">BP</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-african-yellow shadow-glow" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-primary leading-tight">Le Bon Petit</span>
              <span className="text-xs text-muted-foreground font-body">Services à domicile</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.name?.split(' ')[0] || 'Mon compte'}</span>
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
              <Button variant="cta" size="sm" className="hidden sm:flex" asChild>
                <Link to="/logements">Connexion</Link>
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
          <div className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors duration-200"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

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
                  <Link to="/logements" onClick={() => setMobileMenuOpen(false)}>
                    Connexion Logements
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

