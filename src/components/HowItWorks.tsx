import { MousePointer, FileText, Clock, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: MousePointer,
    title: "Choisissez un service",
    description: "Sélectionnez le service dont vous avez besoin parmi nos 5 offres.",
  },
  {
    icon: FileText,
    title: "Remplissez le formulaire",
    description: "Indiquez vos informations et les détails de votre demande.",
  },
  {
    icon: Clock,
    title: "Nous vous contactons",
    description: "Notre équipe vous recontacte rapidement via WhatsApp.",
  },
  {
    icon: CheckCircle,
    title: "Service effectué",
    description: "Votre demande est traitée avec professionnalisme et rapidité.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-10 lg:py-20 bg-secondary/50 african-pattern">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-background text-xs lg:text-sm font-medium text-primary mb-3 lg:mb-4 shadow-soft">
            Comment ça marche
          </span>
          <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-3 lg:mb-4">
            Simple comme bonjour
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
            En 4 étapes simples, accédez à tous nos services sans complications.
          </p>
        </div>

        {/* Steps - Mobile: Horizontal cards, Desktop: Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative text-center">
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-african-yellow text-accent-foreground font-bold text-sm flex items-center justify-center shadow-glow z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-background shadow-card border border-border flex items-center justify-center mb-6 group-hover:shadow-glow transition-shadow duration-300">
                  <step.icon className="h-9 w-9 text-primary" />
                </div>

                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout - Compact horizontal cards */}
        <div className="lg:hidden space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-2xl bg-background shadow-soft border border-border animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Left: Step number + Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-african-yellow text-accent-foreground font-bold text-xs flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
              </div>

              {/* Right: Text content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-sm text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
