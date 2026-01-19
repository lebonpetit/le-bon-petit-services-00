import { ArrowRight, Phone, MessageCircle, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  "Service 7j/7",
  "Réponse en 5 min",
  "Paiement à la livraison",
  "Satisfaction garantie",
];

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 african-pattern opacity-10" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem]">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-african-green via-primary to-african-earth" />

          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="cta-pattern-new" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" className="text-white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#cta-pattern-new)" />
            </svg>
          </div>

          {/* Decorative blurs */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-african-yellow/30 blur-3xl" />
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-african-yellow/20 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative p-8 md:p-12 lg:p-16 xl:p-20">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left content */}
              <div className="text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <Star className="w-4 h-4 text-african-yellow fill-african-yellow" />
                  <span className="text-sm font-medium text-white">+2000 clients satisfaits</span>
                </div>

                <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
                  Prêt à simplifier
                  <br />
                  <span className="text-african-yellow">votre quotidien ?</span>
                </h2>

                <p className="text-white/80 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Rejoignez des milliers de camerounais qui font confiance à
                  <strong className="text-white"> Le Bon Petit </strong>
                  pour leurs services à domicile.
                </p>

                {/* Features grid */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/90">
                      <CheckCircle2 className="w-5 h-5 text-african-yellow flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right content - CTA buttons */}
              <div className="flex flex-col items-center lg:items-end gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 w-full max-w-sm">
                  <h3 className="font-heading font-bold text-xl text-white mb-4 text-center">
                    Commencez maintenant
                  </h3>

                  <div className="space-y-3">
                    <Button
                      variant="cta"
                      size="xl"
                      className="w-full shadow-[0_0_30px_hsl(var(--african-yellow)/0.4)] hover:shadow-[0_0_40px_hsl(var(--african-yellow)/0.6)] transition-shadow"
                      asChild
                    >
                      <a href="#services">
                        Découvrir nos services
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </a>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                        asChild
                      >
                        <a href="https://wa.me/237690000000" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                        asChild
                      >
                        <a href="tel:+237690000000">
                          <Phone className="mr-2 h-4 w-4" />
                          Appeler
                        </a>
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-white/60 text-xs mt-4">
                    Réponse garantie en moins de 5 minutes
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-4 text-white/80">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-african-yellow text-african-yellow" />
                    ))}
                  </div>
                  <span className="text-sm">4.9/5 sur +500 avis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
