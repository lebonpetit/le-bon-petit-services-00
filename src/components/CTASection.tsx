import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 lg:p-16">
          {/* African pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="cta-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" className="text-primary-foreground" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#cta-pattern)" />
            </svg>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-xl">
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary-foreground mb-4">
                Prêt à simplifier votre quotidien ?
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed">
                Rejoignez des milliers de camerounais qui font confiance à Le Bon Petit pour leurs services à domicile.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="cta"
                size="xl"
                className="shadow-[0_0_30px_hsl(var(--african-yellow)/0.5)]"
                asChild
              >
                <Link to="#services">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                asChild
              >
                <a href="tel:+237600000000">
                  <Phone className="mr-2 h-5 w-5" />
                  Nous appeler
                </a>
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-african-yellow/20 blur-3xl" />
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-african-yellow/10 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
