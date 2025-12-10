import { ServiceCard } from "./ServiceCard";

const services = [
  {
    title: "Expédition de Colis",
    description: "Envoyez vos colis partout au Cameroun en toute sécurité. Tarifs compétitifs et suivi en temps réel.",
    image: "/service-colis.png",
    href: "/colis",
    color: "green" as const,
  },
  {
    title: "Livraison de Gaz",
    description: "Commandez vos bouteilles de gaz et recevez-les directement chez vous. Toutes marques disponibles.",
    image: "/service-gaz.png",
    href: "/gaz",
    color: "red" as const,
  },
  {
    title: "Ramassage Lessive",
    description: "On récupère, on lave, on livre. Vêtements propres et bien repassés sans effort de votre part.",
    image: "/service-lessive.png",
    href: "/lessive",
    color: "yellow" as const,
  },
  {
    title: "Vidage de Poubelles",
    description: "Service de ramassage régulier pour particuliers, entreprises, hôtels et restaurants.",
    image: "/service-poubelles.png",
    href: "/poubelles",
    color: "green" as const,
  },
  {
    title: "Recherche de Logements",
    description: "Trouvez le logement idéal ou publiez votre bien à louer. Mise en relation directe propriétaire-locataire.",
    image: "/service-logement.png",
    href: "/logements",
    color: "yellow" as const,
    featured: true,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 lg:py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary text-sm font-medium text-primary mb-4">
            Nos Services
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Tout ce dont vous avez besoin, à domicile
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Choisissez parmi nos services adaptés à vos besoins quotidiens.
            Simple, rapide et fiable — c'est la promesse Le Bon Petit.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
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
