import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-border toghu-pattern">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-lg">BP</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">Le Bon Petit</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre partenaire de confiance pour tous vos services à domicile à Douala. Qualité, rapidité et fiabilité.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-african-green hover:text-primary-foreground transition-colors duration-200">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Nos Services</h3>
            <ul className="space-y-2">
              {["Expédition de Colis", "Livraison de Gaz", "Ramassage Lessive", "Vidage Poubelles", "Recherche Logements"].map((service) => (
                <li key={service}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens Utiles */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Liens Utiles</h3>
            <ul className="space-y-2">
              {["À propos", "Tarifs", "FAQ", "Conditions d'utilisation", "Politique de confidentialité"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@lebonpetit.cm</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Douala, Cameroun</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border">
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
