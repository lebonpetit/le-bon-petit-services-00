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
    <section className="py-20 bg-secondary/50 african-pattern">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-background text-sm font-medium text-primary mb-4 shadow-soft">
            Comment ça marche
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Simple comme bonjour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            En 4 étapes simples, accédez à tous nos services sans complications.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </div>
    </section>
  );
}
