import { Link } from "react-router-dom";

export function PersonalBrandingSection() {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/30 to-background border-t border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-4xl mx-auto">
                    {/* Logo Circle */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-african-yellow to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-xl flex-shrink-0">
                            <img
                                src="/logo.jpg"
                                alt="Le Bon Petit"
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center md:text-left">
                        <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
                            "Je serais votre bon petit"
                        </h2>
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm md:text-base mb-4 border border-primary/20">
                            Entrepreneur digital, Webmarketer
                        </div>
                        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                            Passionné par l'innovation et le service client, je mets mon expertise à votre disposition pour faciliter toutes vos démarches. Que ce soit pour trouver un logement, gérer vos courses ou organiser un déménagement, je suis là pour vous accompagner avec efficacité et sourire. Faites confiance à votre "Bon Petit" pour une expérience fluide et sans tracas au quotidien.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
