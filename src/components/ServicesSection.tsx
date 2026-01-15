import { ServiceCard } from "./ServiceCard";
import { useSettings } from "@/contexts/SettingsContext";

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
    id: "logements", // Not currently controlled by settings, always shown or add control? Assuming always shown for now unless added to settings.
    title: "Recherche de Logements",
    description: "Trouvez le logement idéal ou publiez votre bien à louer. Mise en relation directe propriétaire-locataire.",
    image: "/service-logement.png",
    href: "/logements",
    color: "yellow" as const,
    featured: true,
  },
  {
    id: "nettoyage",
    title: "Nettoyage & Antiparasitaire",
    description: "Bureaux, domiciles, canapés, tapis, matelas. Dératisation, désinsectisation, fumigation et désinfection.",
    image: "/service-nettoyage.png",
    href: "/nettoyage",
    color: "green" as const,
  },
];

export function ServicesSection() {
  const { services: servicesSettings, loading } = useSettings();

  const visibleServices = servicesData.filter(service => {
    // If the service has a corresponding setting key, check it. 
    // If not (like logements), default to true (show it).
    // Also handling the case where settings might be loading (though context provides defaults).
    if (service.id === 'logements') return true;
    return servicesSettings[service.id] ?? true;
  });

  return (
    <section className="py-12 lg:py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-african-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-african-red/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
            Nos <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
            Des solutions adaptées à votre quotidien pour vous simplifier la vie.
            Qualité et professionnalisme garantis.
          </p>
        </div>

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
        <div className="mt-12 lg:mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-secondary border border-border">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-african-green to-african-yellow flex items-center justify-center text-sm font-bold text-primary-foreground border-2 border-background"
                >
                  {["JD", "AM", "KE", "SN"][i - 1]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">+2,000 clients satisfaits</p>
              <p className="text-sm text-muted-foreground">Rejoignez la communauté Le Bon Petit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
