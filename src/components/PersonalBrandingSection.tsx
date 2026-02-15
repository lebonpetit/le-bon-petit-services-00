import { Link } from "react-router-dom";

export function PersonalBrandingSection() {
    return (
        <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/30 to-background border-t border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-6xl mx-auto">
                    {/* Text Content */}
                    <div className="text-center md:text-left flex-1">
                        <h2 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-2">
                            Je suis EBANDA BOYA Pascal
                        </h2>
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm md:text-base mb-4 border border-primary/20">
                            Fondateur de la startup Africa Digital Services
                        </div>
                        <div className="text-muted-foreground text-base md:text-lg leading-relaxed">
                            <p className="mb-4">
                                IT, entrepreneur digital et marketeur. Je développe une solution digitale innovante conçue pour simplifier le quotidien des particuliers, entreprises et collectivités.
                            </p>
                            <p className="mb-4">
                                À travers une plateforme unique, nous mettons à votre disposition des services essentiels :
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-left">
                                {[
                                    "Ramassage et gestion des ordures",
                                    "Aménagement et déménagement",
                                    "Nettoyage de meubles et de locaux",
                                    "Livraison de gaz",
                                    "Assainissement",
                                    "Recherche de logement"
                                ].map((service, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className="text-primary">✔</span>
                                        <span>{service}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mb-4">
                                Notre objectif est simple : vous faire gagner du temps, réduire vos efforts et vous offrir des services fiables, rapides et accessibles, directement depuis votre téléphone.
                            </p>
                            <p>
                                Avec notre solution, plus besoin de multiplier les contacts ou de perdre du temps à chercher : un seul canal, plusieurs services, une équipe professionnelle.
                            </p>
                        </div>
                    </div>

                    {/* Image Circle */}
                    <div className="relative group flex-shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-african-yellow to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-background shadow-xl">
                            <img
                                src="/EBANDA BOYA Pascal.jpg"
                                alt="EBANDA BOYA Pascal"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
