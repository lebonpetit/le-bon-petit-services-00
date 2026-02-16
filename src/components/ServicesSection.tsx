import { ServiceCard } from "./ServiceCard";
import { useSettings } from "@/contexts/SettingsContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const servicesData = [
  {
    id: "poubelles",
    title: "Gestion d'ordure",
    description: "Service de ramassage régulier d'ordure de tout type pour particulier, entreprise, hôtel, marché, restaurant, hôpitaux, espace ouvert, après évènement, etc... Nous collectons, vous respirez.",
    image: "/service-poubelles.png",
    href: "/poubelles",
    color: "green" as const,
  },
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
    description: "Commandez vos bouteilles de gaz et recevez-les directement chez vous. Toutes marques disponibles. Le gaz arrive, vous cuisinez.",
    image: "/service-gaz.png",
    href: "/gaz",
    color: "red" as const,
  },
  {
    id: "lessive",
    title: "Ramassage Lessive",
    description: "Sans effort de votre part. Vous gagnez du temps.",
    image: "/service-lessive.png",
    href: "/lessive",
    color: "yellow" as const,
  },
  {
    id: "logements",
    title: "Recherche de logements",
    description: "Trouvez votre logement ou publiez votre bien. Meublé ou non meublé, nous vous accompagnons.",
    image: "/service-logement.png",
    href: "/logements",
    color: "yellow" as const,
    featured: true,
  },
  {
    id: "nettoyage",
    title: "Nettoyage & Hygiène",
    description: "Nettoyage domiciles, bureaux, entreprises, hôtels, restaurants, snacks, boîtes de nuit, espaces ouverts, avant et après évènement, voiture, école.",
    image: "/service-nettoyage.png",
    href: "/nettoyage",
    color: "green" as const,
  },
  {
    id: "personnel",
    title: "Personnel à domicile",
    description: "Gouvernantes, ménagères, cuisinières, électriciens, plombiers — du personnel qualifié, vérifié et formé pour votre maison.",
    image: "/service-personnel.png",
    href: "/personnel",
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

        {/* Pour qui travaillons-nous ? */}
        <div className="mt-16 lg:mt-24">
          <div className="text-center mb-12">
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
              POUR QUI TRAVAILLONS-NOUS ?
            </h3>
            <p className="text-muted-foreground text-lg">
              Pensé pour vous, quel que soit votre besoin
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Particuliers",
                subtitle: "Votre maison, votre confort",
                emoji: "🏠",
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                title: "Entreprises",
                subtitle: "Votre image, notre mission",
                emoji: "🏢",
                gradient: "from-african-green to-teal-500"
              },
              {
                title: "Établissements",
                subtitle: "Propreté, sécurité, conformité",
                emoji: "🏥",
                gradient: "from-african-yellow to-orange-500"
              },
              {
                title: "Événementiel",
                subtitle: "Avant. Pendant. Après.",
                emoji: "🎉",
                gradient: "from-african-red to-rose-500"
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-4 group-hover:animate-bounce">{item.emoji}</div>
                  <h4 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
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
                  Recherche de logements
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
