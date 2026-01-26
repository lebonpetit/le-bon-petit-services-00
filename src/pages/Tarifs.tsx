import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Trash2,
    Flame,
    Package,
    Sparkles,
    Home,
    Shirt,
    Truck,
    CheckCircle2,
    Phone
} from 'lucide-react';

export default function Tarifs() {
    const services = [
        {
            id: 'poubelles',
            title: "Gestion d'ordures",
            icon: Trash2,
            color: 'bg-green-500',
            plans: [
                { name: "Ménages", price: "5 000 – 10 000", unit: "FCFA/mois", features: ["Collecte 2-3x/semaine", "Bac fourni (option)"] },
                { name: "Bureaux & Agences", price: "15 000 – 100 000", unit: "FCFA/mois", features: ["Volume adapté", "Facturation claire"] },
                { name: "Restaurants / Hôtels", price: "À partir de 30 000", unit: "FCFA/mois", features: ["Collecte quotidienne", "Hygiène garantie"] },
            ]
        },
        {
            id: 'gaz',
            title: "Livraison de gaz",
            icon: Flame,
            color: 'bg-red-500',
            plans: [
                { name: "Bouteille 6 kg", price: "4 500", unit: "FCFA", features: ["Livraison incluse", "Installation gratuite"] },
                { name: "Bouteille 12,5 kg", price: "7 000", unit: "FCFA", features: ["Livraison incluse", "Installation gratuite"] },
                { name: "Bouteille 50 kg", price: "28 000", unit: "FCFA", features: ["Livraison incluse", "Pour professionnels"] },
            ]
        },
        {
            id: 'colis',
            title: "Expédition de colis",
            icon: Package,
            color: 'bg-blue-500',
            plans: [
                { name: "Express National", price: "À partir de 2 500", unit: "FCFA", features: ["Livraison 24-48h", "Suivi en temps réel"] },
                { name: "Standard National", price: "À partir de 1 500", unit: "FCFA", features: ["Livraison 3-5 jours", "Option économique"] },
                { name: "International", price: "À partir de 8 000", unit: "FCFA", features: ["Europe, Amérique, Afrique", "Suivi complet"] },
            ]
        },
        {
            id: 'nettoyage',
            title: "Nettoyage",
            icon: Sparkles,
            color: 'bg-purple-500',
            plans: [
                { name: "Ménage ponctuel", price: "À partir de 10 000", unit: "FCFA", features: ["Maison / Appartement", "Produits inclus"] },
                { name: "Abonnement mensuel", price: "À partir de 25 000", unit: "FCFA/mois", features: ["4 passages/mois", "Équipe dédiée"] },
                { name: "Nettoyage professionnel", price: "Sur devis", unit: "", features: ["Bureaux, commerces", "Intervention rapide"] },
            ]
        },
        {
            id: 'lessive',
            title: "Ramassage lessive",
            icon: Shirt,
            color: 'bg-cyan-500',
            plans: [
                { name: "Formule Basique", price: "À partir de 3 000", unit: "FCFA/kg", features: ["Lavage + Séchage", "Retour 48h"] },
                { name: "Formule Premium", price: "À partir de 5 000", unit: "FCFA/kg", features: ["Lavage + Repassage", "Retour 24h"] },
            ]
        },
        {
            id: 'logements',
            title: "Recherche de logements",
            icon: Home,
            color: 'bg-orange-500',
            plans: [
                { name: "Studios", price: "À partir de 15 000", unit: "FCFA/jour", features: ["Meublé et équipé", "Quartiers sécurisés"] },
                { name: "Appartements", price: "À partir de 25 000", unit: "FCFA/jour", features: ["2-3 chambres", "Eau & électricité"] },
                { name: "Villas", price: "Sur demande", unit: "", features: ["Haut standing", "Personnalisé"] },
            ]
        },
        {
            id: 'demenagement',
            title: "Déménagement & Aménagement",
            icon: Truck,
            color: 'bg-amber-500',
            plans: [
                { name: "Transport simple", price: "À partir de 10 000", unit: "FCFA", features: ["Petit volume", "Courte distance"] },
                { name: "Déménagement standard", price: "À partir de 50 000", unit: "FCFA", features: ["Équipe 2-3 personnes", "Appartement"] },
                { name: "Déménagement complet", price: "Sur devis", unit: "", features: ["Emballage + Transport", "Installation"] },
            ]
        },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-african-yellow/10 via-background to-african-green/10">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="bg-african-yellow text-black mb-6">Transparence</Badge>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                            Nos <span className="text-african-green">Tarifs</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Des prix clairs, sans surprise. Choisissez le service qui correspond à vos besoins.
                        </p>
                    </div>
                </section>

                {/* Services & Pricing */}
                <section className="py-16 container mx-auto px-4">
                    <div className="space-y-16 max-w-7xl mx-auto">
                        {services.map((service) => (
                            <div key={service.id} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center text-white`}>
                                        <service.icon className="h-6 w-6" />
                                    </div>
                                    <h2 className="font-heading text-2xl md:text-3xl font-bold">{service.title}</h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {service.plans.map((plan, idx) => (
                                        <Card key={idx} className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                                            <CardHeader>
                                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                                <div className="pt-2">
                                                    <span className="text-3xl font-extrabold text-african-green">{plan.price}</span>
                                                    {plan.unit && <span className="text-muted-foreground ml-2">{plan.unit}</span>}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <ul className="space-y-2">
                                                    {plan.features.map((feature, i) => (
                                                        <li key={i} className="flex items-center gap-2 text-sm">
                                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-african-green">
                    <div className="container mx-auto px-4 text-center text-white">
                        <h2 className="font-heading text-3xl font-bold mb-4">Besoin d'un devis personnalisé ?</h2>
                        <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
                            Pour les entreprises ou besoins spécifiques, contactez-nous pour une offre sur mesure.
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-african-green hover:bg-african-yellow hover:text-black font-bold rounded-full"
                            onClick={() => window.open('https://wa.me/237690547084?text=Bonjour, je souhaite obtenir un devis personnalisé.', '_blank')}
                        >
                            <Phone className="mr-2 h-5 w-5" /> Demander un devis
                        </Button>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
