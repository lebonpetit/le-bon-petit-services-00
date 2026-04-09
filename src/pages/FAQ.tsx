import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ChevronDown,
    Phone,
    HelpCircle
} from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            category: "Général",
            questions: [
                {
                    q: "Qu'est-ce que Le Bon Petit ?",
                    a: "Le Bon Petit est une startup camerounaise qui propose des services de proximité : gestion d'ordure ménagères, livraison de gaz, expédition de colis, nettoyage, lessive et location de logements meublés. Notre objectif est de simplifier votre quotidien."
                },
                {
                    q: "Dans quelles villes opérez-vous ?",
                    a: "Nous sommes actuellement basés à Douala et couvrons la plupart des quartiers de la ville. Nous étendons progressivement notre couverture à d'autres villes du Cameroun."
                },
                {
                    q: "Comment puis-je passer commande ?",
                    a: "Vous pouvez commander directement sur notre site web, via WhatsApp au +237 690 547 084, ou en nous appelant. Nous confirmons votre commande et intervenons rapidement."
                },
            ]
        },
        {
            category: "Gestion d'ordures",
            questions: [
                {
                    q: "À quelle fréquence passez-vous pour la collecte ?",
                    a: "Selon votre abonnement, nous passons 2 à 3 fois par semaine pour les ménages. Pour les professionnels (restaurants, hôtels), la collecte peut être quotidienne."
                },
                {
                    q: "Fournissez-vous les bacs de collecte ?",
                    a: "Oui, nous proposons des bacs normalisés en option. Vous pouvez également utiliser vos propres contenants conformes aux normes d'hygiène."
                },
            ]
        },
        {
            category: "Livraison de gaz",
            questions: [
                {
                    q: "Quelles marques de bouteilles livrez-vous ?",
                    a: "Nous livrons toutes les grandes marques : SCTM, CAMGAZ, TRADEX, TOTAL, et autres. Précisez votre préférence lors de la commande."
                },
                {
                    q: "L'installation est-elle incluse ?",
                    a: "Oui, l'installation est gratuite et effectuée par nos livreurs formés. Nous vérifions systématiquement l'étanchéité de votre installation."
                },
                {
                    q: "Quel est le délai de livraison ?",
                    a: "En général, la livraison est effectuée dans l'heure suivant la commande, selon la disponibilité et votre localisation. Pour les urgences, contactez-nous directement."
                },
            ]
        },
        {
            category: "Expédition de colis",
            questions: [
                {
                    q: "Puis-je suivre mon colis ?",
                    a: "Oui, nous vous fournissons un numéro de suivi et vous tenons informé par SMS ou WhatsApp à chaque étape de la livraison."
                },
                {
                    q: "Quels types de colis acceptez-vous ?",
                    a: "Nous acceptons la plupart des colis : documents, vêtements, appareils électroniques, produits alimentaires non périssables. Les produits dangereux, illicites ou périssables sans emballage adapté sont refusés."
                },
            ]
        },
        {
            category: "Paiement",
            questions: [
                {
                    q: "Quels modes de paiement acceptez-vous ?",
                    a: "Nous acceptons le paiement en espèces à la livraison, Mobile Money (MTN, Orange Money), et les virements bancaires pour les professionnels."
                },
                {
                    q: "Puis-je payer après le service ?",
                    a: "Oui, pour la plupart de nos services, le paiement se fait à la livraison ou après l'intervention. Les abonnements peuvent être payés en début de mois."
                },
            ]
        },
    ];

    const toggleQuestion = (globalIndex: number) => {
        setOpenIndex(openIndex === globalIndex ? null : globalIndex);
    };

    let globalIndex = 0;

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-african-green/10 via-background to-african-yellow/10">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="bg-african-green text-white mb-6">Support</Badge>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                            Questions <span className="text-african-green">Fréquentes</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Trouvez rapidement les réponses à vos questions les plus courantes.
                        </p>
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-16 container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {faqs.map((category) => (
                            <div key={category.category}>
                                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                                    <HelpCircle className="h-6 w-6 text-african-green" />
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq) => {
                                        const currentIndex = globalIndex++;
                                        const isOpen = openIndex === currentIndex;
                                        return (
                                            <div
                                                key={currentIndex}
                                                className="border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <button
                                                    onClick={() => toggleQuestion(currentIndex)}
                                                    className="w-full flex items-center justify-between p-5 text-left"
                                                >
                                                    <span className="font-semibold text-lg pr-4">{faq.q}</span>
                                                    <ChevronDown className={`h-5 w-5 text-african-green flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t pt-4">
                                                        {faq.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-secondary/30">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-heading text-2xl font-bold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
                        <p className="text-muted-foreground mb-8">Notre équipe est disponible 7j/7 pour vous aider.</p>
                        <Button
                            size="lg"
                            className="bg-african-green hover:bg-african-green/90 text-white font-bold rounded-full"
                            onClick={() => window.open('https://wa.me/237690547084', '_blank')}
                        >
                            <Phone className="mr-2 h-5 w-5" /> Contactez-nous
                        </Button>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
