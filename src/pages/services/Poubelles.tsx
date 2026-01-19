import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
    Home,
    Trash2,
    MapPin,
    CreditCard,
    Building2,
    Info,
    BookOpen,
    Phone,
    CheckCircle2,
    Menu,
    X,
    Leaf,
    Truck,
    Clock,
    ShieldCheck,
    Users,
    MessageCircle,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Send
} from 'lucide-react';

// Import images
import poubellesImage from '@/assets/services/poubelles.png?format=webp&quality=80';

type Section = 'accueil' | 'services' | 'secteurs' | 'tarifs' | 'entreprises' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'services', name: 'Nos services', icon: Trash2 },
    { id: 'secteurs', name: 'Secteurs desservis', icon: MapPin },
    { id: 'tarifs', name: 'Abonnements & tarifs', icon: CreditCard },
    { id: 'entreprises', name: 'Entreprises & collectivités', icon: Building2 },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const engagements = [
    { text: "Collecte régulière et ponctuelle", icon: Clock },
    { text: "Respect strict des normes d’hygiène", icon: ShieldCheck },
    { text: "Personnel formé et équipé", icon: Users },
    { text: "Traçabilité des déchets", icon: CheckCircle2 },
    { text: "Impact environnemental positif", icon: Leaf },
];

const services = [
    {
        title: "Ménages & habitations",
        description: "Précollecte régulière des déchets domestiques dans maisons, immeubles et résidences.",
        details: ["2 à 3 passages / semaine", "Bacs normalisés (optionnel)"],
        icon: Home
    },
    {
        title: "Bureaux, agences & grands magasins",
        description: "Solutions adaptées aux bureaux administratifs, agences de voyage, supermarchés et centres commerciaux.",
        details: ["Collecte programmée", "Gestion des volumes importants"],
        icon: Building2
    },
    {
        title: "Restaurants, snacks & hôtels",
        description: "Collecte hygiénique des déchets alimentaires et d’exploitation.",
        details: ["Collecte quotidienne ou nocturne", "Respect des normes sanitaires"],
        icon: Utensils
    },
    {
        title: "Hôpitaux & centres de santé",
        description: "Précollecte sécurisée des déchets non infectieux et assimilés.",
        warning: "Les déchets biomédicaux sont traités selon les normes et circuits autorisés.",
        icon: BookOpen
    },
    {
        title: "Marchés & espaces commerciaux ouverts",
        description: "Collecte régulière des déchets de marchés et espaces de vente.",
        details: ["Tournées matinales", "Nettoyage des zones communes"],
        icon: MapPin
    },
    {
        title: "Boîtes de nuit & espaces festifs",
        description: "Intervention après activités nocturnes pour une propreté rapide et discrète.",
        icon: Users
    },
    {
        title: "Espaces pour enfants",
        description: "Gestion sécurisée et hygiénique des déchets dans crèches, aires de jeux et espaces de loisirs.",
        icon: Users
    },
    {
        title: "Événements & grands rassemblements",
        description: "Collecte et nettoyage post-événement (mariages, concerts, foires, festivals).",
        icon: Users
    }
];

// Helper for icons that are not imported yet
function Utensils(props: any) {
    return <Trash2 {...props} />; // Placeholder
}


export default function Poubelles() {
    const [activeSection, setActiveSection] = useState<Section>('accueil');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    // Form states
    const [collecteForm, setCollecteForm] = useState({
        nom: '',
        telephone: '',
        secteur: '',
        localisation: '',
        frequence: '',
    });
    const [collecteLoading, setCollecteLoading] = useState(false);

    const [contactForm, setContactForm] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);


    const handleCollecteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (collecteLoading) return;

        setCollecteLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'poubelles',
                payload: { ...collecteForm, type: 'programmation_collecte' },
                contact_name: collecteForm.nom,
                contact_phone: collecteForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Notre équipe vous contactera pour confirmer la collecte.",
            });
            setCollecteForm({ nom: '', telephone: '', secteur: '', localisation: '', frequence: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre demande. Réessayez.",
            });
        } finally {
            setCollecteLoading(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contactLoading) return;

        setContactLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'poubelles',
                payload: { ...contactForm, type: 'contact_poubelles' },
                contact_name: contactForm.nom,
                contact_phone: 'N/A',
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Message envoyé !",
                description: "Nous vous répondrons dans les plus brefs délais.",
            });
            setContactForm({ nom: '', email: '', sujet: '', message: '' });
        } catch (error) {
            console.error('Error submitting contact form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre message. Réessayez.",
            });
        } finally {
            setContactLoading(false);
        }
    };


    const renderAccueil = () => (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-african-green/90 to-african-earth">
                <div className="absolute inset-0">
                    <img src={poubellesImage} alt="Gestion des déchets" className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="relative z-10 px-6 py-16 md:py-24 text-center text-white">
                    <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                        Des espaces propres, des vies protégées. Nous collectons, vous continuez.
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                        Service professionnel de précollecte d’ordures et de gestion de déchets pour ménages, entreprises, établissements sensibles et événements au Cameroun.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-african-green hover:bg-white/90 font-semibold"
                            onClick={() => {
                                // S'assurer qu'on est sur la section accueil où se trouve le formulaire
                                setActiveSection('accueil');
                                // Attendre que le DOM soit mis à jour puis faire défiler vers le formulaire
                                setTimeout(() => {
                                    const formElement = document.getElementById('collecte-form');
                                    if (formElement) {
                                        formElement.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }, 100);
                            }}
                        >
                            🔘 Programmer une collecte
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => setActiveSection('tarifs')}
                        >
                            🔘 Demander un devis
                        </Button>
                    </div>
                </div>
            </section>

            {/* Qui sommes-nous */}
            <section className="bg-secondary/50 rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-center text-african-green">
                    Qui sommes-nous ?
                </h2>
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <p className="text-muted-foreground text-lg">
                        Nous sommes une startup camerounaise spécialisée dans la précollecte et la gestion responsable des déchets ménagers, commerciaux et institutionnels.
                    </p>
                    <p className="text-muted-foreground text-lg font-medium">
                        Notre mission est de contribuer durablement à la salubrité, à la santé publique et à la protection de l’environnement.
                    </p>
                </div>
            </section>

            {/* Nos engagements */}
            <section>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
                    Nos engagements
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {engagements.map((item, index) => (
                        <Card key={index} className="text-center hover:shadow-card transition-shadow border-t-4 border-t-african-green">
                            <CardContent className="p-6">
                                <div className="w-14 h-14 mx-auto rounded-full bg-african-green/10 flex items-center justify-center mb-4">
                                    <item.icon className="h-7 w-7 text-african-green" />
                                </div>
                                <p className="font-medium text-sm">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Formulaire Programmer une collecte */}
            <div id="collecte-form" className="pt-8">
                <Card className="bg-african-green/5 border-african-green/20">
                    <CardHeader>
                        <CardTitle className="text-center font-heading text-2xl text-african-green">Programmer une collecte</CardTitle>
                        <CardDescription className="text-center text-lg">
                            Indiquez vos besoins et notre équipe vous contactera rapidement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCollecteSubmit} className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom / Structure</Label>
                                <Input id="nom" value={collecteForm.nom} onChange={e => setCollecteForm({ ...collecteForm, nom: e.target.value })} placeholder="Votre nom ou entreprise" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone / WhatsApp</Label>
                                <Input id="telephone" value={collecteForm.telephone} onChange={e => setCollecteForm({ ...collecteForm, telephone: e.target.value })} placeholder="+237..." required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secteur">Secteur d’activité</Label>
                                <Select onValueChange={v => setCollecteForm({ ...collecteForm, secteur: v })}>
                                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="menage">Ménage</SelectItem>
                                        <SelectItem value="bureau">Bureau / Agence</SelectItem>
                                        <SelectItem value="commerce">Commerce / Restaurant</SelectItem>
                                        <SelectItem value="evenement">Événement</SelectItem>
                                        <SelectItem value="autre">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="localisation">Localisation</Label>
                                <Input id="localisation" value={collecteForm.localisation} onChange={e => setCollecteForm({ ...collecteForm, localisation: e.target.value })} placeholder="Quartier, Repère..." required />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="frequence">Fréquence souhaitée</Label>
                                <Select onValueChange={v => setCollecteForm({ ...collecteForm, frequence: v })}>
                                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hebdo">Hebdomadaire</SelectItem>
                                        <SelectItem value="myenne">2-3 fois par semaine</SelectItem>
                                        <SelectItem value="quotidien">Quotidien</SelectItem>
                                        <SelectItem value="ponctuel">Ponctuel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 pt-2">
                                <Button type="submit" variant="cta" className="w-full bg-african-green hover:bg-african-green/90" disabled={collecteLoading}>
                                    {collecteLoading ? "Envoi..." : "Envoyer ma demande"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4">Nos Services</h2>
                <p className="text-muted-foreground">Des solutions adaptées à chaque besoin</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-african-green">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-african-green/10 text-african-green">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-heading">{service.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{service.description}</p>
                                {service.details && (
                                    <ul className="space-y-2 mb-4">
                                        {service.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-center text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-african-green mr-2 flex-shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {service.warning && (
                                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-200">
                                        ⚠️ {service.warning}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    const renderSecteurs = () => (
        <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center">Secteurs Desservis</h2>
            <Card>
                <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        {[
                            "Ménages & résidences",
                            "Bureaux & administrations",
                            "Agences de voyage",
                            "Grands magasins & supermarchés",
                            "Restaurants, snacks & hôtels",
                            "Hôpitaux & centres de santé",
                            "Marchés & espaces ouverts",
                            "Boîtes de nuit & bars",
                            "Espaces pour enfants",
                            "Événementiel"
                        ].map((secteur, idx) => (
                            <div key={idx} className="flex items-center p-3 rounded-lg bg-secondary/50 hover:bg-african-green/5 transition-colors">
                                <div className="h-2 w-2 rounded-full bg-african-green mr-3" />
                                <span className="font-medium">{secteur}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderTarifs = () => (
        <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center text-african-green">Abonnements & Tarifs</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Ménages", price: "5 000 – 10 000 FCFA", unit: "/ mois", desc: "Pour les particuliers" },
                    { title: "Bureaux & Agences", price: "15 000 – 100 000 FCFA", unit: "/ mois", desc: "Adapté aux volumes" },
                    { title: "Restaurants / Snacks", price: "À partir de 30 000 FCFA", unit: "/ mois", desc: "Hygiène garantie" },
                    { title: "Événements", price: "20 000 – 200 000 FCFA", unit: "/ intervention", desc: "Nettoyage complet" },
                ].map((item, idx) => (
                    <Card key={idx} className="text-center hover:scale-105 transition-transform border-african-green/20">
                        <CardHeader>
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-african-green mb-1">{item.price}</div>
                            <div className="text-muted-foreground text-sm mb-4">{item.unit}</div>
                            <p className="text-sm text-balance">{item.desc}</p>
                        </CardContent>
                    </Card>
                ))}

                <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-secondary to-background border-african-green">
                    <CardHeader>
                        <CardTitle className="text-xl">Hôpitaux / Marchés / Grands Magasins</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-full pb-8">
                        <div className="text-2xl font-bold text-african-green mb-4">Devis Personnalisé</div>
                        <p className="mb-6 opacity-80">Prix basés sur le volume et la fréquence de collecte.</p>
                        <Button onClick={() => setActiveSection('contact')} variant="cta">Demander un devis</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderEntreprises = () => (
        <div className="max-w-4xl mx-auto text-center space-y-12">
            <div>
                <h2 className="font-heading text-3xl font-bold mb-6 text-african-green">
                    Une solution fiable pour des environnements propres et conformes
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                    Nous accompagnons les entreprises, institutions, marchés et organisateurs d’événements avec des solutions de collecte adaptées, sécurisées et responsables.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 text-left">
                {[
                    "Contrats clairs et transparents",
                    "Facturation mensuelle simplifiée",
                    "Équipe dédiée et réactive",
                    "Image professionnelle & responsable"
                ].map((avantage, idx) => (
                    <Card key={idx} className="bg-african-green/5 border-none">
                        <CardContent className="p-6 flex items-center gap-4">
                            <CheckCircle2 className="h-8 w-8 text-african-green" />
                            <span className="font-semibold text-lg">{avantage}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-heading text-3xl font-bold mb-6">À Propos</h2>
            <Card className="bg-gradient-to-b from-transparent to-secondary/30">
                <CardContent className="p-10 space-y-6">
                    <Leaf className="h-16 w-16 mx-auto text-african-green mb-4" />
                    <p className="text-2xl font-light leading-relaxed">
                        "Nous croyons qu’un environnement propre est un pilier essentiel de la santé publique et du développement durable."
                    </p>
                    <div className="h-1 w-20 bg-african-earth mx-auto rounded-full" />
                    <p className="text-xl text-muted-foreground">
                        Notre startup agit chaque jour pour un Cameroun plus sain et plus responsable.
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const renderBlog = () => (
        <div className="text-center py-16">
            <BookOpen className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Blog</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Nos articles sur la gestion des déchets et l'écologie arrivent bientôt.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2 inline" />
                Bientôt disponible
            </Badge>
        </div>
    );

    const renderContact = () => (
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
                <div>
                    <h2 className="font-heading text-3xl font-bold mb-4">Contactez-nous</h2>
                    <p className="text-muted-foreground">Pour toute question ou demande spécifique.</p>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-african-green/10 flex items-center justify-center">
                                <Phone className="h-6 w-6 text-african-green" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Téléphone</p>
                                <p className="font-semibold text-lg">+237 690 000 000</p>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/237690000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors border border-[#25D366]/20 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">WhatsApp (Cliquable)</p>
                                <p className="font-semibold text-lg text-[#25D366]">Discuter maintenant</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold text-lg">contact@lebonpetit.cm</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-3">Réseaux Sociaux</p>
                            <div className="flex gap-4">
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-green"><Facebook className="h-5 w-5" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-green"><Instagram className="h-5 w-5" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-green"><Twitter className="h-5 w-5" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Formulaire de contact</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactNom">Nom complet</Label>
                            <Input
                                id="contactNom"
                                value={contactForm.nom}
                                onChange={e => setContactForm({ ...contactForm, nom: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={contactForm.email}
                                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactSujet">Sujet</Label>
                            <Input
                                id="contactSujet"
                                value={contactForm.sujet}
                                onChange={e => setContactForm({ ...contactForm, sujet: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactMessage">Message</Label>
                            <Textarea
                                id="contactMessage"
                                value={contactForm.message}
                                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                                className="min-h-[120px]"
                                required
                            />
                        </div>
                        <Button type="submit" variant="cta" className="w-full" disabled={contactLoading}>
                            {contactLoading ? "Envoi..." : "Envoyer"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );


    return (
        <Layout>
            <div className="flex min-h-screen bg-background relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside
                    className={`
            fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card border-r shadow-lg lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}
                >
                    <div className="p-6 border-b bg-african-green/5">
                        <h2 className="font-heading text-xl font-bold text-african-green flex items-center gap-2">
                            <Trash2 className="h-6 w-6" />
                            Gestion des Déchets
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Précollecte & Salubrité</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setSidebarOpen(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left
                      ${isActive
                                            ? 'bg-african-green text-white shadow-md font-medium'
                                            : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }
                    `}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="bg-african-earth/10 p-4 rounded-lg">
                            <p className="font-bold text-african-earth text-sm mb-1">Besoin d'aide ?</p>
                            <p className="text-xs text-muted-foreground mb-3">Contactez notre support client disponible 7j/7.</p>
                            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setActiveSection('contact')}>
                                Nous contacter
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-secondary/10">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-african-green" />
                            <span className="font-heading font-bold text-lg">Poubelles</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeSection === 'accueil' && renderAccueil()}
                            {activeSection === 'services' && renderServices()}
                            {activeSection === 'secteurs' && renderSecteurs()}
                            {activeSection === 'tarifs' && renderTarifs()}
                            {activeSection === 'entreprises' && renderEntreprises()}
                            {activeSection === 'apropos' && renderAPropos()}
                            {activeSection === 'blog' && renderBlog()}
                            {activeSection === 'contact' && renderContact()}
                        </div>
                    </div>
                </main>
            </div>

            <WhatsAppButton
                phoneNumber="+237690000000"
                message="Bonjour, je souhaite programmer une collecte d'ordures."
                label="Programmer une collecte"
            />
        </Layout>
    );
}
