import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";

export function Footer() {
  const { user } = useAuth();
  const { platform } = useSettings();

  return (
    <footer className="relative bg-card border-t border-border toghu-pattern">
      <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-3 lg:space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="Le Bon Petit Logo"
                className="h-12 lg:h-40 w-auto rounded-lg lg:rounded-xl object-cover"
              />
            </Link>
            <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed hidden lg:block">
              Votre partenaire de confiance pour tous vos services à domicile à Douala. Qualité, rapidité et fiabilité.
            </p>
            <div className="flex gap-2 lg:gap-3 justify-center lg:justify-start">
              <a href="#" className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                <Facebook className="h-3 w-3 lg:h-4 lg:w-4" />
              </a>
              <a href="#" className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                <Instagram className="h-3 w-3 lg:h-4 lg:w-4" />
              </a>
              <a href="#" className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-african-green hover:text-primary-foreground transition-colors duration-200">
                <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          {!user && (
            <div className="text-center lg:text-left">
              <h3 className="font-heading font-semibold text-foreground text-sm lg:text-base mb-2 lg:mb-4">Nos Services</h3>
              <ul className="space-y-1 lg:space-y-2">
                {["Colis", "Gaz", "Lessive", "Poubelles", "Nettoyage", "Logements"].map((service) => (
                  <li key={service}>
                    <a href={`/${service.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="text-xs lg:text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Liens Utiles */}
          <div className="text-center lg:text-left">
            <h3 className="font-heading font-semibold text-foreground text-sm lg:text-base mb-2 lg:mb-4">Liens Utiles</h3>
            <ul className="space-y-1 lg:space-y-2">
              {["À propos", "Tarifs", "FAQ", "CGU", "Confidentialité"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs lg:text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            <h3 className="font-heading font-semibold text-foreground text-sm lg:text-base mb-2 lg:mb-4">Contact</h3>
            <ul className="space-y-1 lg:space-y-3">
              <li className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
                <Phone className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                <span>{platform.contact_phone}</span>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
                <Mail className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                <span>{platform.contact_email}</span>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                <span>{platform.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 lg:mt-12 pt-4 lg:pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Le Bon Petit. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Fièrement camerounais</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-3 bg-african-green rounded-l-sm" />
                <div className="w-4 h-3 bg-african-red" />
                <div className="w-4 h-3 bg-african-yellow rounded-r-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ndop border */}
      <div className="h-1 ndop-border" />
    </footer>
  );
}
