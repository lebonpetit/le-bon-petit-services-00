import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trash2,
  Sparkles,
  Package,
  Flame,
  Shirt,
  Building2,
  Truck,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Slide {
  id: number;
  image: string;
  tagline: string;
  useCase: string;
  highlight: string;
  useCaseEnd?: string;
  problem: string;
  solution: string;
  cta: string;
  ctaAction: () => void;
  serviceIcons: { icon: React.ElementType; label: string; color: string }[];
  gradient: string;
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const scrollToWizard = () => {
    document
      .getElementById("service-selection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const slides: Slide[] = [
    {
      id: 0,
      image: "/slide-waste.jpg",
      tagline: "Gestion des déchets",
      useCase: "Vos poubelles débordent ? ",
      highlight: "On s'en charge.",
      problem:
        "Ras-le-bol des ordures qui s'accumulent devant votre maison, votre restaurant ou votre entreprise ?",
      solution:
        "Le Bon Petit collecte vos déchets régulièrement. Vous n'avez plus rien à faire.",
      cta: "Planifier un ramassage",
      ctaAction: scrollToWizard,
      serviceIcons: [
        { icon: Trash2, label: "Collecte", color: "text-green-500" },
        { icon: Sparkles, label: "Nettoyage", color: "text-teal-500" },
      ],
      gradient: "from-green-900/60 via-green-900/30 to-transparent",
    },
    {
      id: 1,
      image: "/slide-delivery.jpg",
      tagline: "Livraison à domicile",
      useCase: "Plus de gaz ? Colis à envoyer ? ",
      highlight: "On livre.",
      problem:
        "Votre bouteille de gaz est vide en plein repas ? Un colis urgent à expédier ? Du linge à faire laver ?",
      solution:
        "Commandez en 2 minutes. On vient chercher ou livrer directement chez vous.",
      cta: "Commander maintenant",
      ctaAction: scrollToWizard,
      serviceIcons: [
        { icon: Flame, label: "Gaz", color: "text-orange-500" },
        { icon: Package, label: "Colis", color: "text-blue-500" },
        { icon: Shirt, label: "Lessive", color: "text-violet-500" },
      ],
      gradient: "from-orange-900/60 via-orange-900/30 to-transparent",
    },
    {
      id: 2,
      image: "/slide-cleaning.jpg",
      tagline: "Nettoyage professionnel",
      useCase: "Votre espace a besoin d'un ",
      highlight: "coup de frais ?",
      problem:
        "Bureau, maison, hôtel, restaurant ou après un événement — la saleté n'attend pas.",
      solution:
        "Notre équipe pro intervient rapidement avec le matériel adapté. Résultat garanti.",
      cta: "Demander un nettoyage",
      ctaAction: scrollToWizard,
      serviceIcons: [
        { icon: Sparkles, label: "Nettoyage", color: "text-teal-500" },
        { icon: Users, label: "Équipe pro", color: "text-indigo-500" },
      ],
      gradient: "from-teal-900/60 via-teal-900/30 to-transparent",
    },
    {
      id: 3,
      image: "/slide-housing.jpg",
      tagline: "Logement & Déménagement",
      useCase: "Vous cherchez ",
      highlight: "où vivre ?",
      problem:
        "Trouver un bon logement à Douala, c'est un parcours du combattant. Et déménager, c'est le stress total.",
      solution:
        "On vous trouve le logement idéal et on gère votre déménagement de A à Z.",
      cta: "Trouver un logement",
      ctaAction: () => (window.location.href = "/logements"),
      serviceIcons: [
        { icon: Building2, label: "Logement", color: "text-rose-500" },
        { icon: Truck, label: "Déménagement", color: "text-amber-500" },
        { icon: Users, label: "Personnel", color: "text-violet-500" },
      ],
      gradient: "from-rose-900/60 via-rose-900/30 to-transparent",
    },
  ];

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? "next" : "prev");
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    setDirection("next");
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection("prev");
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  const slide = slides[current];

  return (
    <section
      id="hero-slider"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.image}
              alt={s.tagline}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${slide.gradient}`}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-16 sm:py-20 lg:py-28 min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            {/* Left: Slide content */}
            <div
              key={slide.id}
              className={`space-y-5 sm:space-y-6 hero-slide-animate ${
                direction === "next"
                  ? "hero-slide-from-right"
                  : "hero-slide-from-left"
              }`}
            >
              {/* Tagline badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-african-green" />
                <span className="text-sm font-medium text-white/90">
                  {slide.tagline}
                </span>
              </div>

              {/* Use case title */}
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white leading-tight">
                {slide.useCase}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-african-yellow via-african-gold to-african-yellow">
                  {slide.highlight}
                </span>
                {slide.useCaseEnd && (
                  <span className="text-white">{slide.useCaseEnd}</span>
                )}
              </h2>

              {/* Problem → Solution */}
              <div className="space-y-3">
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  {slide.problem}
                </p>
                <p className="text-white font-semibold text-base sm:text-lg leading-relaxed flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-african-yellow mt-1 shrink-0" />
                  {slide.solution}
                </p>
              </div>

              {/* Service icons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {slide.serviceIcons.map((svc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm"
                  >
                    <svc.icon className={`w-5 h-5 ${svc.color}`} />
                    <span className="text-sm font-medium text-white/90">
                      {svc.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Button
                  variant="cta"
                  size="lg"
                  className="rounded-full shadow-lg text-base px-8 group"
                  onClick={slide.ctaAction}
                >
                  {slide.cta}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Right: Empty for image background to show through */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Navigation bar */}
        <div className="pb-8 sm:pb-10">
          <div className="flex items-center justify-between max-w-xl">
            {/* Arrows + Dots */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                aria-label="Slide précédent"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-10 h-3 bg-gradient-to-r from-african-green to-african-yellow"
                        : "w-3 h-3 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Aller au slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                aria-label="Slide suivant"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Slide counter */}
            <div className="text-white/50 text-sm font-mono">
              <span className="text-white font-bold">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="mx-1">/</span>
              <span>{String(slides.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 max-w-xl">
            <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                key={`progress-${current}-${isPaused}`}
                className={`h-full rounded-full bg-gradient-to-r from-african-green to-african-yellow ${
                  isPaused ? "" : "hero-progress-bar"
                }`}
                style={isPaused ? { width: "0%" } : {}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
