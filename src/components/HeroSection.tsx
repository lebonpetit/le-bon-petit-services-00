import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  "Livraison rapide à Douala",
  "Service 7j/7",
  "Prix transparents",
  "Satisfaction garantie",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-warm african-pattern">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <div className="flex gap-0.5">
                <div className="w-2 h-2 rounded-full bg-african-green" />
                <div className="w-2 h-2 rounded-full bg-african-red" />
                <div className="w-2 h-2 rounded-full bg-african-yellow" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Services à domicile à Douala</span>
            </div>

            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Vos services à domicile,{" "}
              <span className="text-primary">simplifiés</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Colis, gaz, lessive, poubelles ou logements — Le Bon Petit s'occupe de tout.
              Un service camerounais moderne, fiable et à votre portée.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-african-green flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="cta" size="xl" asChild>
                <Link to="#services">
                  Découvrir nos services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/logements">Rechercher un logement</Link>
              </Button>
            </div>
          </div>

          {/* Visual - African Family Image */}
          <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative max-w-lg mx-auto">
              {/* Background decoration */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-african-green/20 to-african-yellow/10 blur-3xl" />

              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-card border-4 border-white/10">
                <img
                  src="/hero-family.png"
                  alt="Famille africaine heureuse chez elle"
                  className="w-full h-auto object-cover"
                />

                {/* Overlay with stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-heading font-bold text-2xl text-white">2,000+</p>
                      <p className="text-xs text-white/70">Clients satisfaits</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-2xl text-african-yellow">500+</p>
                      <p className="text-xs text-white/70">Services/mois</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-2xl text-african-green">4.9/5</p>
                      <p className="text-xs text-white/70">Note moyenne</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-african-yellow shadow-glow flex items-center justify-center animate-float">
                <span className="text-3xl">📦</span>
              </div>
              <div className="absolute -bottom-2 -left-4 w-16 h-16 rounded-2xl bg-african-green shadow-soft flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-2xl">🏠</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" className="w-full h-auto fill-background">
          <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  );
}
