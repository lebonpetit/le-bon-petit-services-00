import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Users,
    Target,
    Heart,
    MapPin,
    Phone,
    Mail,
    CheckCircle2,
    Leaf,
    Truck,
    Package,
    Home,
    Sparkles
} from 'lucide-react';

export default function APropos() {
    const values = [
        { icon: Heart, title: "Proximité", description: "Un service ancré dans les réalités camerounaises, pour les Camerounais." },
        { icon: Target, title: "Fiabilité", description: "Des engagements tenus, des délais respectés, une qualité constante." },
        { icon: Leaf, title: "Responsabilité", description: "Un engagement fort pour l'environnement et la communauté." },
        { icon: Users, title: "Accessibilité", description: "Des tarifs justes et transparents pour tous les budgets." },
    ];

    const services = [
        { icon: Leaf, label: "Gestion d'ordures", color: "text-green-500" },
        { icon: Truck, label: "Livraison de gaz", color: "text-red-500" },
        { icon: Package, label: "Expédition de colis", color: "text-blue-500" },
        { icon: Sparkles, label: "Nettoyage", color: "text-purple-500" },
        { icon: Home, label: "Logements meublés", color: "text-orange-500" },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-african-green/10 via-background to-african-yellow/10">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="bg-african-green text-white mb-6">Qui sommes-nous</Badge>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                            À propos de <span className="text-african-green">Le Bon Petit</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Une startup camerounaise née de la volonté de simplifier le quotidien des ménages et des entreprises à travers des services de proximité modernes, fiables et accessibles.
                        </p>
                    </div>
                </section>

                {/* Notre Histoire */}
                <section className="py-16 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div className="space-y-6">
                            <h2 className="font-heading text-3xl md:text-4xl font-bold">
                                Notre <span className="text-african-green">Histoire</span>
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Fondée à Douala, <strong>Le Bon Petit</strong> est née d'un constat simple : les services essentiels du quotidien (gaz, collecte d'ordures, livraison, nettoyage) sont souvent difficiles d'accès, peu fiables ou informels.
                            </p>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Notre mission est de digitaliser et professionnaliser ces services pour offrir à chaque Camerounais une expérience simple, rapide et de qualité — directement depuis son téléphone.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-4">
                                {services.map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="px-4 py-2 text-base">
                                        <service.icon className={`h-4 w-4 mr-2 ${service.color}`} />
                                        {service.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="bg-african-green/10 rounded-3xl p-10 text-center">
                            <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden mb-6 shadow-xl">
                                <img src="/logo.jpg" alt="Le Bon Petit" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold mb-2">Le Bon Petit</h3>
                            <p className="text-muted-foreground">Votre quotidien, simplifié.</p>
                            <div className="mt-6 flex items-center justify-center gap-2 text-african-green">
                                <MapPin className="h-5 w-5" />
                                <span className="font-medium">Douala, Cameroun</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Nos Valeurs */}
                <section className="py-16 bg-secondary/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                                Nos <span className="text-african-green">Valeurs</span>
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Les principes qui guident chacune de nos actions.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {values.map((value, idx) => (
                                <Card key={idx} className="group hover:-translate-y-2 transition-all duration-300 border-none shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-african-green/10 flex items-center justify-center mb-4 group-hover:bg-african-green group-hover:text-white transition-colors">
                                            <value.icon className="h-8 w-8 text-african-green group-hover:text-white" />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                                        <p className="text-muted-foreground text-sm">{value.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-16 container mx-auto px-4">
                    <Card className="max-w-4xl mx-auto bg-african-green text-white border-none shadow-2xl">
                        <CardContent className="p-10 text-center">
                            <h2 className="font-heading text-3xl font-bold mb-4">Une question ? Un partenariat ?</h2>
                            <p className="text-white/80 mb-8 text-lg">Notre équipe est à votre disposition pour répondre à toutes vos interrogations.</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-african-green hover:bg-african-yellow hover:text-black font-bold rounded-full"
                                    onClick={() => window.open('https://wa.me/237690547084', '_blank')}
                                >
                                    <Phone className="mr-2 h-5 w-5" /> WhatsApp
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10 rounded-full"
                                    onClick={() => window.location.href = 'mailto:contact@lebonpetit237.com'}
                                >
                                    <Mail className="mr-2 h-5 w-5" /> Email
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </Layout>
    );
}
