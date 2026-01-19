import { MousePointer, FileText, Clock, CheckCircle, ArrowRight, Zap } from "lucide-react";

const steps = [
  {
    icon: MousePointer,
    title: "Choisissez un service",
    description: "Sélectionnez le service dont vous avez besoin parmi nos 6 offres.",
    color: "from-african-green to-teal-500",
  },
  {
    icon: FileText,
    title: "Remplissez le formulaire",
    description: "Indiquez vos informations et les détails de votre demande.",
    color: "from-african-yellow to-orange-500",
  },
  {
    icon: Clock,
    title: "Nous vous contactons",
    description: "Notre équipe vous recontacte rapidement via WhatsApp.",
    color: "from-african-red to-rose-500",
  },
  {
    icon: CheckCircle,
    title: "Service effectué",
    description: "Votre demande est traitée avec professionnalisme et rapidité.",
    color: "from-primary to-indigo-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-28 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 african-pattern opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-african-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-african-yellow/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-african-green/10 border border-african-green/20 mb-6">
            <Zap className="w-4 h-4 text-african-green" />
            <span className="text-sm font-medium text-african-green">Simple & rapide</span>
          </div>

          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
            Comment ça
            <span className="relative mx-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-african-green to-african-yellow"> marche </span>
            </span>
            ?
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            En 4 étapes simples, accédez à tous nos services sans complications.
            C'est aussi simple que bonjour !
          </p>
        </div>

        {/* Desktop Steps - Horizontal */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-16 left-[10%] right-[10%] h-1 bg-gradient-to-r from-african-green via-african-yellow via-african-red to-primary rounded-full" />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="text-center">
                    {/* Step number badge */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-african-yellow text-african-yellow font-bold text-sm flex items-center justify-center shadow-lg z-20">
                      {index + 1}
                    </div>

                    {/* Icon container */}
                    <div className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br ${step.color} shadow-xl flex items-center justify-center mb-6 relative overflow-hidden group transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <step.icon className="h-14 w-14 text-white relative z-10" />
                    </div>

                    <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Steps - Vertical Cards */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-card shadow-soft border border-border animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${step.color}`} />

              {/* Left: Icon with step number */}
              <div className="relative flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-african-yellow text-african-yellow font-bold text-xs flex items-center justify-center shadow">
                  {index + 1}
                </div>
              </div>

              {/* Right: Text content */}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-heading font-bold text-base text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow indicator */}
              {index < steps.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10 hidden">
                  <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
