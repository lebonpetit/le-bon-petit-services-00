import { useState, useEffect, useCallback } from 'react';
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
    Send,
    Utensils
} from 'lucide-react';

// Import images - African context
import poubellesHeroImage from '@/assets/services/poubelles-hero.png';

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




export default function Poubelles() {
    // URL-based navigation
    const getInitialSection = (): Section => {
        const hash = window.location.hash.replace('#', '') as Section;
        return navigation.some(nav => nav.id === hash) ? hash : 'accueil';
    };

    const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    // Navigate to section and update URL
    const navigateToSection = useCallback((section: Section) => {
        window.location.hash = section; setActiveSection(section);
    }, []);

    // Handle hash changes (browser back/forward)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '') as Section;
            if (navigation.some(nav => nav.id === hash)) {
                setActiveSection(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Scroll to top when section changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

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
        <div className="space-y-16 animate-fade-in">
            {/* Hero Section - Clean solid background */}
            <section className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center shadow-2xl bg-african-green">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute inset-0">
                    <img src={poubellesHeroImage} alt="Gestion des déchets" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
                </div>
                {/* Decorative elements */}


                <div className="relative z-20 px-8 py-20 md:py-28 text-center text-white max-w-4xl mx-auto space-y-8 animate-slide-up">
                    <Badge className="bg-white/20 text-white border-none py-2 px-4 backdrop-blur-md">
                        ✨ Service professionnel de collecte
                    </Badge>
                    <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight">
                        Des espaces propres,<br />
                        <span className="text-african-yellow">des vies protégées.</span>
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed font-light">
                        Nous collectons, vous continuez. Service de précollecte d'ordures pour ménages, entreprises et événements au Cameroun.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-african-yellow text-black hover:bg-white font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:shadow-xl transition-all duration-300"
                            onClick={() => {
                                navigateToSection('accueil');
                                setTimeout(() => {
                                    const formElement = document.getElementById('collecte-form');
                                    if (formElement) {
                                        formElement.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }, 100);
                            }}
                        >
                            <Truck className="mr-2 h-5 w-5" />
                            Programmer une collecte
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white/10 font-semibold h-14 px-8 rounded-full"
                            onClick={() => navigateToSection('tarifs')}
                        >
                            Voir les tarifs
                        </Button>
                    </div>
                </div>
            </section>

            {/* Qui sommes-nous - Clean card design */}
            <section className="bg-white dark:bg-card rounded-3xl p-10 shadow-xl border border-border/50">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-african-green rounded-full" />
                    <Leaf className="h-8 w-8 text-african-green" />
                    <div className="h-1 w-12 bg-african-green rounded-full" />
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center text-african-green">
                    Qui sommes-nous ?
                </h2>
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Nous sommes une startup camerounaise spécialisée dans la précollecte et la gestion responsable des déchets ménagers, commerciaux et institutionnels.
                    </p>
                    <p className="text-xl font-semibold text-african-earth">
                        Notre mission : contribuer durablement à la salubrité, à la santé publique et à la protection de l'environnement.
                    </p>
                </div>
            </section>

            {/* Nos engagements - Modern cards */}
            <section>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10 text-center">
                    Nos <span className="text-african-green">engagements</span>
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {engagements.map((item, index) => (
                        <Card key={index} className="group text-center hover:-translate-y-2 transition-all duration-300 border shadow-soft hover:shadow-xl bg-card">
                            <CardContent className="p-8">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-african-green/10 flex items-center justify-center mb-5 group-hover:bg-african-green group-hover:text-white transition-all duration-300">
                                    <item.icon className="h-8 w-8 text-african-green group-hover:text-white transition-colors" />
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-african-green transition-colors">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Formulaire Programmer une collecte - Premium design */}
            <div id="collecte-form" className="pt-8">
                <Card className="border-none shadow-2xl overflow-hidden bg-card">
                    <div className="h-3 bg-african-green w-full" />
                    <CardHeader className="bg-secondary/20 border-b">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Truck className="h-8 w-8 text-african-green" />
                        </div>
                        <CardTitle className="text-center font-heading text-3xl text-african-green">Programmer une collecte</CardTitle>
                        <CardDescription className="text-center text-lg">
                            Indiquez vos besoins et notre équipe vous contactera rapidement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleCollecteSubmit} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nom" className="text-sm font-semibold">Nom / Structure</Label>
                                <Input id="nom" value={collecteForm.nom} onChange={e => setCollecteForm({ ...collecteForm, nom: e.target.value })} placeholder="Votre nom ou entreprise" className="h-12 bg-secondary/30" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telephone" className="text-sm font-semibold">Téléphone / WhatsApp</Label>
                                <Input id="telephone" value={collecteForm.telephone} onChange={e => setCollecteForm({ ...collecteForm, telephone: e.target.value })} placeholder="+237..." className="h-12 bg-secondary/30" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secteur" className="text-sm font-semibold">Secteur d'activité</Label>
                                <Select onValueChange={v => setCollecteForm({ ...collecteForm, secteur: v })}>
                                    <SelectTrigger className="h-12 bg-secondary/30"><SelectValue placeholder="Choisir..." /></SelectTrigger>
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
                                <Label htmlFor="localisation" className="text-sm font-semibold">Localisation</Label>
                                <Input id="localisation" value={collecteForm.localisation} onChange={e => setCollecteForm({ ...collecteForm, localisation: e.target.value })} placeholder="Quartier, Repère..." className="h-12 bg-secondary/30" required />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="frequence" className="text-sm font-semibold">Fréquence souhaitée</Label>
                                <Select onValueChange={v => setCollecteForm({ ...collecteForm, frequence: v })}>
                                    <SelectTrigger className="h-12 bg-secondary/30"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hebdo">Hebdomadaire</SelectItem>
                                        <SelectItem value="myenne">2-3 fois par semaine</SelectItem>
                                        <SelectItem value="quotidien">Quotidien</SelectItem>
                                        <SelectItem value="ponctuel">Ponctuel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <Button type="submit" size="lg" className="w-full bg-african-green hover:bg-african-green/90 text-white font-bold h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={collecteLoading}>
                                    {collecteLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-10 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-green text-white mb-4">Nos Solutions</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4">Nos <span className="text-african-green">Services</span></h2>
                <p className="text-muted-foreground text-lg">Des solutions adaptées à chaque besoin</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                            <div className="h-2 bg-african-green w-0 group-hover:w-full transition-all duration-500" />
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 rounded-2xl bg-african-green/10 text-african-green group-hover:bg-african-green group-hover:text-white transition-all duration-300">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-heading group-hover:text-african-green transition-colors">{service.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
                                {service.details && (
                                    <ul className="space-y-2 mb-4">
                                        {service.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-center text-sm">
                                                <CheckCircle2 className="h-5 w-5 text-african-green mr-3 flex-shrink-0" />
                                                <span className="font-medium">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {service.warning && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm border border-amber-200 dark:border-amber-800">
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
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <Badge className="bg-african-green text-white mb-4">Couverture</Badge>
                <h2 className="font-heading text-4xl font-bold">Secteurs <span className="text-african-green">Desservis</span></h2>
            </div>
            <Card className="border-none shadow-2xl overflow-hidden">
                <div className="h-2 bg-african-green w-full" />
                <CardContent className="p-10">
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: "Ménages & résidences", icon: Home },
                            { name: "Bureaux & administrations", icon: Building2 },
                            { name: "Agences de voyage", icon: MapPin },
                            { name: "Grands magasins & supermarchés", icon: Building2 },
                            { name: "Restaurants, snacks & hôtels", icon: Utensils },
                            { name: "Hôpitaux & centres de santé", icon: ShieldCheck },
                            { name: "Marchés & espaces ouverts", icon: MapPin },
                            { name: "Boîtes de nuit & bars", icon: Users },
                            { name: "Espaces pour enfants", icon: Users },
                            { name: "Événementiel", icon: Users }
                        ].map((secteur, idx) => {
                            const Icon = secteur.icon;
                            return (
                                <div key={idx} className="group flex items-center p-4 rounded-xl bg-secondary/30 hover:bg-african-green/10 hover:shadow-md transition-all duration-300 cursor-default">
                                    <div className="w-10 h-10 rounded-lg bg-african-green/10 flex items-center justify-center mr-4 group-hover:bg-african-green group-hover:scale-110 transition-all duration-300">
                                        <Icon className="h-5 w-5 text-african-green group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-semibold group-hover:text-african-green transition-colors">{secteur.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderTarifs = () => (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-green text-white mb-4">Tarification</Badge>
                <h2 className="font-heading text-4xl font-bold">Abonnements & <span className="text-african-green">Tarifs</span></h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Ménages", price: "5 000 – 10 000", unit: "FCFA / mois", desc: "Pour les particuliers", icon: Home },
                    { title: "Bureaux & Agences", price: "15 000 – 100 000", unit: "FCFA / mois", desc: "Adapté aux volumes", icon: Building2 },
                    { title: "Restaurants / Snacks", price: "À partir de 30 000", unit: "FCFA / mois", desc: "Hygiène garantie", icon: Utensils },
                    { title: "Événements", price: "20 000 – 200 000", unit: "FCFA / intervention", desc: "Nettoyage complet", icon: Users },
                ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Card key={idx} className="group text-center hover:-translate-y-2 transition-all duration-300 border-none shadow-lg hover:shadow-2xl bg-white dark:bg-card overflow-hidden">
                            <div className="h-1 bg-african-green w-0 group-hover:w-full transition-all duration-500" />
                            <CardHeader className="pb-2">
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-african-green/10 flex items-center justify-center mb-3 group-hover:bg-african-green group-hover:scale-110 transition-all duration-300">
                                    <Icon className="h-7 w-7 text-african-green group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-african-green mb-1">{item.price}</div>
                                <div className="text-muted-foreground text-sm mb-3">{item.unit}</div>
                                {item.desc && <p className="text-sm text-muted-foreground">{item.desc}</p>}
                            </CardContent>
                            {/* Interactive background */}
                            <div className="absolute inset-0 bg-african-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </Card>
                    );
                })}
            </div>

            <Card className="border-2 border-african-green/30 shadow-xl bg-african-green/5">
                <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-african-green mb-2">Hôpitaux / Marchés / Grands Magasins</h3>
                        <p className="text-muted-foreground text-lg">Prix basés sur le volume et la fréquence de collecte.</p>
                    </div>
                    <Button onClick={() => navigateToSection('contact')} size="lg" className="bg-african-green hover:bg-african-green/90 text-white font-bold h-14 px-8 rounded-xl shadow-lg">
                        Demander un devis personnalisé
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderEntreprises = () => (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-green text-white mb-4">B2B</Badge>
                <h2 className="font-heading text-4xl font-bold mb-6">
                    Une solution <span className="text-african-green">fiable</span> pour vos locaux
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                    Nous accompagnons les entreprises, institutions, marchés et organisateurs d'événements avec des solutions de collecte adaptées, sécurisées et responsables.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                {[
                    { text: "Contrats clairs et transparents", icon: CheckCircle2 },
                    { text: "Facturation mensuelle simplifiée", icon: CreditCard },
                    { text: "Équipe dédiée et réactive", icon: Users },
                    { text: "Image professionnelle & responsable", icon: ShieldCheck }
                ].map((avantage, idx) => {
                    const Icon = avantage.icon;
                    return (
                        <Card key={idx} className="group border-none shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-card">
                            <CardContent className="p-6 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-african-green/10 flex items-center justify-center group-hover:bg-african-green group-hover:scale-110 transition-all duration-300">
                                    <Icon className="h-7 w-7 text-african-green group-hover:text-white transition-colors" />
                                </div>
                                <span className="font-bold text-lg">{avantage.text}</span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center">
                <Button onClick={() => navigateToSection('contact')} size="lg" className="bg-african-green hover:bg-african-green/90 text-white font-bold h-14 px-10 rounded-xl shadow-lg">
                    Demander un devis entreprise
                </Button>
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
            <div>
                <Badge className="bg-african-green text-white mb-4">Notre Vision</Badge>
                <h2 className="font-heading text-4xl font-bold">À <span className="text-african-green">Propos</span></h2>
            </div>
            <Card className="border-none shadow-2xl bg-white dark:bg-card overflow-hidden">
                <div className="h-2 bg-african-green w-full" />
                <CardContent className="p-12 space-y-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-african-green/10 flex items-center justify-center">
                        <Leaf className="h-10 w-10 text-african-green" />
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-light leading-relaxed text-gray-700 dark:text-gray-300 italic">
                        "Nous croyons qu'un environnement propre est un pilier essentiel de la santé publique et du développement durable."
                    </blockquote>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-0.5 w-16 bg-african-green rounded-full" />
                        <div className="h-2 w-2 rounded-full bg-african-earth" />
                        <div className="h-0.5 w-16 bg-african-green rounded-full" />
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                                <p className="font-semibold text-lg">+237 690 547 084</p>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/237690547084"
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
            fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card/95 backdrop-blur border-r shadow-2xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}
                >
                    <div className="p-6 border-b">
                        <h2 className="font-heading text-xl font-bold text-african-green flex items-center gap-2">
                            <Trash2 className="h-6 w-6" />
                            Poubelles
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
                                        navigateToSection(item.id);
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
                            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => navigateToSection('contact')}>
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
                phoneNumber="+237690547084"
                message="Bonjour, je souhaite programmer une collecte d'ordures."
            />
        </Layout>
    );
}
