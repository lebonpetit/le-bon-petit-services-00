import { ServiceCard } from "./ServiceCard";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const servicesData = [
  {
    id: "colis",
    title: "Expédition de Colis",
    description: "Envoyez vos colis partout au Cameroun en toute sécurité. Tarifs compétitifs et suivi en temps réel.",
    image: "/service-colis.png",
    href: "/colis",
    color: "green" as const,
  },
  {
    id: "gaz",
    title: "Livraison de Gaz",
    description: "Commandez vos bouteilles de gaz et recevez-les directement chez vous. Toutes marques disponibles.",
    image: "/service-gaz.png",
    href: "/gaz",
    color: "red" as const,
  },
  {
    id: "lessive",
    title: "Ramassage Lessive",
    description: "On récupère, on lave, on livre. Vêtements propres et bien repassés sans effort de votre part.",
    image: "/service-lessive.png",
    href: "/lessive",
    color: "yellow" as const,
  },
  {
    id: "poubelles",
    title: "Vidage de Poubelles",
    description: "Service de ramassage régulier pour particuliers, entreprises, hôtels et restaurants.",
    image: "/service-poubelles.png",
    href: "/poubelles",
    color: "green" as const,
  },
  {
    id: "logements",
    title: "Logements meublés",
    description: "Trouvez le logement meublé idéal ou publiez votre bien. Mise en relation directe propriétaire-locataire.",
    image: "/service-logement.png",
    href: "/logements",
    color: "yellow" as const,
    featured: true,
  },
  {
    id: "nettoyage",
    title: "Nettoyage & Hygiène",
    description: "Bureaux, domiciles, canapés, tapis, matelas. Dératisation, désinsectisation, fumigation et désinfection.",
    image: "/service-nettoyage.png",
    href: "/nettoyage",
    color: "green" as const,
  },
];

export function ServicesSection() {
  const { services: servicesSettings } = useSettings();

  const visibleServices = servicesData.filter(service => {
    if (service.id === 'logements') return true;
    return servicesSettings[service.id] ?? true;
  });

  return (
    <section id="services" className="py-16 lg:py-28 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-african-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-african-yellow/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-african-red/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nos solutions</span>
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Des services
            <span className="relative mx-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-african-green via-primary to-african-yellow"> adaptés </span>
            </span>
            à votre quotidien
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Qualité, rapidité et professionnalisme. Choisissez le service dont vous avez besoin
            et laissez-nous nous occuper du reste.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {visibleServices.map((service, index) => (
            <div
              key={service.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard {...service} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 lg:mt-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-african-green/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-african-yellow/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {/* Avatars */}
                <div className="flex -space-x-3">
                  {[
                    { initials: "JD", gradient: "from-african-green to-teal-500" },
                    { initials: "AM", gradient: "from-african-yellow to-orange-500" },
                    { initials: "KE", gradient: "from-african-red to-rose-500" },
                    { initials: "SN", gradient: "from-primary to-indigo-500" },
                    { initials: "+", gradient: "from-gray-400 to-gray-500" },
                  ].map((avatar, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-sm font-bold text-white border-3 border-background shadow-lg`}
                    >
                      {avatar.initials}
                    </div>
                  ))}
                </div>

                <div className="text-left">
                  <p className="font-heading font-bold text-xl text-foreground">+2,000 clients satisfaits</p>
                  <p className="text-muted-foreground">Rejoignez la communauté Le Bon Petit</p>
                </div>
              </div>

              <Button variant="cta" size="lg" className="shadow-lg" asChild>
                <Link to="/logements">
                  Logements meublés
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
