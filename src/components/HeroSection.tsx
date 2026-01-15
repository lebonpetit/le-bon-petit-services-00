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
      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content - First on Mobile, First on Desktop */}
          <div className="space-y-6 lg:space-y-8 animate-fade-in text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <div className="flex gap-0.5">
                <div className="w-2 h-2 rounded-full bg-african-green" />
                <div className="w-2 h-2 rounded-full bg-african-red" />
                <div className="w-2 h-2 rounded-full bg-african-yellow" />
              </div>
              <span className="text-xs lg:text-sm font-medium text-muted-foreground">Services à domicile à Douala</span>
            </div>

            <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Vos services à domicile,{" "}
              <span className="text-primary">simplifiés</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Colis, gaz, lessive, poubelles ou logements — Le Bon Petit s'occupe de tout.
              Un service camerounais moderne, fiable et à votre portée.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-left">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-foreground justify-center lg:justify-start">
                  <CheckCircle2 className="h-4 w-4 text-african-green flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <Button variant="cta" size="lg" className="h-12 px-8 text-base lg:text-lg w-full sm:w-auto" asChild>
                <a href="#services">
                  Découvrir nos services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base lg:text-lg w-full sm:w-auto" asChild>
                <Link to="/logements">Rechercher un logement</Link>
              </Button>
            </div>
          </div>

          {/* Visual - African Family Image - Second on Mobile */}
          <div className="relative block animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative max-w-lg mx-auto">
              {/* Background decoration */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-african-green/20 to-african-yellow/10 blur-3xl transform scale-90 lg:scale-100" />

              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden shadow-card border-4 border-white/10 aspect-[4/3] lg:aspect-square">
                <img
                  src="/hero-family.png"
                  alt="Famille africaine heureuse utilisant les services Le Bon Petit à Douala"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover"
                />

                {/* Overlay with stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 lg:p-6">
                  <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
                    <div>
                      <p className="font-heading font-bold text-lg lg:text-2xl text-white">2k+</p>
                      <p className="text-[10px] lg:text-xs text-white/70">Clients</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-lg lg:text-2xl text-african-yellow">500+</p>
                      <p className="text-[10px] lg:text-xs text-white/70">Services</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-lg lg:text-2xl text-african-green">4.9</p>
                      <p className="text-[10px] lg:text-xs text-white/70">Note</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements - Hidden on very small screens to avoid clutter */}
              <div className="hidden sm:flex absolute -top-4 -right-4 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-african-yellow shadow-glow items-center justify-center animate-float">
                <span className="text-2xl lg:text-3xl">📦</span>
              </div>
              <div className="hidden sm:flex absolute -bottom-2 -left-4 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-african-green shadow-soft items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                <span className="text-xl lg:text-2xl">🏠</span>
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
