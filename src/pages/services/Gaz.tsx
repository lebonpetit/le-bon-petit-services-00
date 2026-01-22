import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { GAS_BRANDS, GAS_SIZES } from '@/lib/constants';
import {
    Home,
    Flame,
    Package,
    Building2,
    CreditCard,
    Info,
    BookOpen,
    Phone,
    CheckCircle2,
    Menu,
    X,
    Truck,
    Clock,
    ShieldCheck,
    Users,
    MessageCircle,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Zap,
    Award,
    MapPin,
    ArrowRight,
    ChefHat
} from 'lucide-react';

// Import images - African context
import gazHeroImage from '@/assets/services/gaz-hero.png';
import gazDeliveryImage from '@/assets/services/gaz-delivery.png?format=webp&quality=80';
import gazStockImage from '@/assets/services/gaz-stock.png?format=webp&quality=80';

type Section = 'accueil' | 'commander' | 'bouteilles' | 'entreprises' | 'abonnements' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'commander', name: 'Commander du gaz', icon: Flame },
    { id: 'bouteilles', name: 'Nos bouteilles', icon: Package },
    { id: 'entreprises', name: 'Entreprises & professionnels', icon: Building2 },
    { id: 'abonnements', name: 'Abonnements', icon: CreditCard },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Commande simple (site & WhatsApp)", icon: MessageCircle },
    { text: "Livraison rapide à domicile", icon: Truck },
    { text: "Manipulation sécurisée", icon: ShieldCheck },
    { text: "Personnel formé", icon: Users },
    { text: "Service fiable et ponctuel", icon: Clock },
];

const etapesCommande = [
    { step: "1", title: "Choisissez votre bouteille", description: "6 kg, 12,5 kg ou 50 kg selon vos besoins" },
    { step: "2", title: "Indiquez votre adresse", description: "Pour une livraison précise et rapide" },
    { step: "3", title: "Confirmez la commande", description: "Validation instantanée par WhatsApp ou site" },
    { step: "4", title: "Livraison express", description: "Réception chez vous en toute sécurité" },
];

const bouteilles = [
    {
        taille: "6 kg",
        usage: "Usage domestique",
        description: "Idéal pour les petits ménages, cuisinières à 2 feux",
        prix: "À partir de 3 500 FCFA",
        popular: false
    },
    {
        taille: "12,5 kg",
        usage: "Standard",
        description: "Le plus utilisé pour les familles, cuisinières 4 feux",
        prix: "À partir de 6 500 FCFA",
        popular: true
    },
    {
        taille: "50 kg",
        usage: "Usage professionnel",
        description: "Pour restaurants, hôtels et établissements professionnels",
        prix: "Sur devis",
        popular: false
    }
];

const ciblesPro = [
    "Restaurants",
    "Hôtels",
    "Snacks",
    "Boulangeries",
    "Cantines",
    "Entreprises"
];

const avantagesPro = [
    { text: "Livraison prioritaire", icon: Truck },
    { text: "Facturation claire", icon: CreditCard },
    { text: "Abonnement personnalisé", icon: Award },
    { text: "Disponibilité garantie", icon: CheckCircle2 },
];

const formules = [
    {
        nom: "Ménage",
        description: "Livraison mensuelle",
        avantages: ["1 livraison par mois", "Rappel automatique", "Prix fixe garanti"],
        prix: "Selon taille",
        icon: Home
    },
    {
        nom: "Professionnel",
        description: "Livraisons régulières",
        avantages: ["2-4 livraisons par mois", "Facturation groupée", "Support dédié"],
        prix: "Sur mesure",
        icon: Building2
    },
    {
        nom: "Premium",
        description: "Priorité & urgence",
        avantages: ["Livraison prioritaire", "Service 7j/7", "Urgence en 2h"],
        prix: "Sur devis",
        icon: Award
    }
];

export default function Gaz() {
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

    // Form states
    const [commandeForm, setCommandeForm] = useState({
        typeBouteille: '',
        typeCommande: '',
        nom: '',
        telephone: '',
        localisation: '',
        modePaiement: '',
    });
    const [commandeLoading, setCommandeLoading] = useState(false);

    const [contactForm, setContactForm] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);

    // Scroll to top when section changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);


    const handleCommandeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commandeLoading) return;

        setCommandeLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'gaz',
                payload: { ...commandeForm, type: 'commande_gaz' },
                contact_name: commandeForm.nom,
                contact_phone: commandeForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Commande envoyée !",
                description: "Notre équipe vous contactera pour confirmer la livraison.",
            });
            setCommandeForm({ typeBouteille: '', typeCommande: '', nom: '', telephone: '', localisation: '', modePaiement: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre commande. Réessayez.",
            });
        } finally {
            setCommandeLoading(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contactLoading) return;

        setContactLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'gaz',
                payload: { ...contactForm, type: 'contact_gaz' },
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
            {/* Hero Section */}
            <section className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center shadow-2xl">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div className="absolute inset-0">
                    <img src={gazHeroImage} alt="Maman qui cuisine heureuse" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
                </div>
                <div className="relative z-20 container px-6 md:px-12 py-16 text-white grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6 animate-slide-up">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md mb-2">
                            🔥 Le feu qui ne s'éteint jamais
                        </Badge>
                        <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight">
                            Votre gaz livré <span className="text-african-yellow">sans effort</span>, directement en cuisine.
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-xl font-light leading-relaxed">
                            Commandez votre bouteille de gaz en ligne et recevez-la chez vous en un temps record. Sécurité et fiabilité garanties.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-african-yellow text-black hover:bg-white font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300"
                                onClick={() => navigateToSection('commander')}
                            >
                                Commander Maintenant <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/50 text-white hover:bg-white/10 h-14 px-8 rounded-full backdrop-blur-sm"
                                onClick={() => navigateToSection('abonnements')}
                            >
                                Créer un abonnement
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Decorative curve */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-background rounded-t-[50%] scale-x-110 translate-y-8 z-30" />
            </section>

            {/* Qui sommes-nous */}
            <section className="relative py-8">
                <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                    <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 group">
                        <img src={gazDeliveryImage} alt="Livraison de gaz à moto" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border-l-4 border-african-red">
                                <p className="text-african-earth font-medium italic">"Rapide comme l'éclair, sûr comme le roc"</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-african-red">
                            Plus de panne sèche inattendue
                        </h2>
                        <p className="text-muted-foreground text-xl leading-relaxed">
                            Nous sommes un service de distribution de gaz domestique digitalisé, conçu pour simplifier l'accès au gaz de cuisson au Cameroun.
                        </p>
                        <p className="text-muted-foreground text-lg">
                            Grâce à notre plateforme, commandez en quelques clics et recevez votre bouteille en toute sécurité, installée par nos professionnels.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span>Installation Gratuite</span>
                            </li>
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span>Paiement à la livraison</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Pourquoi nous choisir */}
            <section>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {avantages.map((item, index) => (
                        <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 border shadow-soft hover:shadow-xl bg-card">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-african-red/10 flex items-center justify-center mb-4 group-hover:bg-african-red group-hover:text-white transition-colors duration-300">
                                    <item.icon className="h-8 w-8 text-african-red group-hover:text-white transition-colors duration-300" />
                                </div>
                                <p className="font-bold text-foreground">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );

    const renderCommander = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-african-red text-white hover:bg-african-red/90">Commande Express</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Commander votre gaz</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Suivez les étapes simples pour ne plus jamais être à court de gaz.</p>
            </div>

            {/* Étapes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {etapesCommande.map((etape, index) => (
                    <div key={index} className="relative p-6 rounded-2xl bg-card border hover:border-african-red transition-colors group">
                        <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-african-red text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                            {etape.step}
                        </div>
                        <h3 className="font-heading text-lg font-bold mb-2 mt-2">{etape.title}</h3>
                        <p className="text-sm text-muted-foreground">{etape.description}</p>
                    </div>
                ))}
            </div>

            {/* Formulaire de commande */}
            <Card className="border-none shadow-2xl overflow-hidden bg-card">
                <div className="h-3 w-full bg-african-red" />
                <CardHeader className="bg-secondary/20 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Flame className="h-6 w-6 text-african-red" />
                        Formulaire de commande
                    </CardTitle>
                    <CardDescription>Remplissez et c'est livré !</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleCommandeSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="bg-secondary/30 p-4 rounded-xl space-y-6">
                            <div className="space-y-3">
                                <Label className="font-semibold text-base">Marque de la bouteille</Label>
                                <Select
                                    value={commandeForm.typeBouteille.split(' ')[0]}
                                    onValueChange={(v) => {
                                        const currentSize = commandeForm.typeBouteille.split(' ')[1] || '12.5kg';
                                        setCommandeForm({ ...commandeForm, typeBouteille: `${v} ${currentSize}` });
                                    }}
                                >
                                    <SelectTrigger className="bg-background border-none shadow-sm h-12">
                                        <SelectValue placeholder="Choisir une marque..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GAS_BRANDS.map(brand => (
                                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-semibold text-base">Taille de la bouteille</Label>
                                <RadioGroup
                                    value={commandeForm.typeBouteille.split(' ')[1] || ''}
                                    onValueChange={v => {
                                        const brand = commandeForm.typeBouteille.split(' ')[0] || 'SCTM';
                                        setCommandeForm({ ...commandeForm, typeBouteille: `${brand} ${v}` });
                                    }}
                                    className="grid grid-cols-1 gap-2"
                                >
                                    {GAS_SIZES.map((size) => (
                                        <label
                                            key={size.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${commandeForm.typeBouteille.includes(size.id) ? 'border-african-red bg-african-red/5' : 'border-transparent bg-background hover:bg-secondary'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value={size.id} id={`bt-${size.id}`} />
                                                <div className="font-medium">{size.label}</div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px]">{size.usage.split(' / ')[0]}</Badge>
                                        </label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                                <Label className="font-semibold text-base">Votre besoin</Label>
                                <Select onValueChange={v => setCommandeForm({ ...commandeForm, typeCommande: v })}>
                                    <SelectTrigger className="bg-background border-none shadow-sm h-12"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recharge">🔄 Recharge uniquement (Échange)</SelectItem>
                                        <SelectItem value="complete">🆕 Bouteille complète (Neuve + Gaz)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cmd-nom">Votre Nom</Label>
                                    <Input id="cmd-nom" className="bg-secondary/20 h-12" value={commandeForm.nom} onChange={e => setCommandeForm({ ...commandeForm, nom: e.target.value })} placeholder="Prénom et Nom" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cmd-telephone">Téléphone</Label>
                                    <Input id="cmd-telephone" className="bg-secondary/20 h-12" value={commandeForm.telephone} onChange={e => setCommandeForm({ ...commandeForm, telephone: e.target.value })} placeholder="Numéro joignable" required />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="cmd-localisation">Localisation exacte</Label>
                                <Input id="cmd-localisation" className="bg-secondary/20 h-12" value={commandeForm.localisation} onChange={e => setCommandeForm({ ...commandeForm, localisation: e.target.value })} placeholder="Quartier, Repère, Rue... (Soyez précis pour une livraison rapide)" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Paiement préféré</Label>
                                <RadioGroup value={commandeForm.modePaiement} onValueChange={v => setCommandeForm({ ...commandeForm, modePaiement: v })} className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center space-x-2 bg-secondary/20 px-4 py-2 rounded-full cursor-pointer hover:bg-secondary/40">
                                        <RadioGroupItem value="livraison" id="cmd-paiement-livraison" />
                                        <Label htmlFor="cmd-paiement-livraison" className="cursor-pointer">Espèces à la livraison</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-secondary/20 px-4 py-2 rounded-full cursor-pointer hover:bg-secondary/40">
                                        <RadioGroupItem value="mobile" id="cmd-paiement-mobile" />
                                        <Label htmlFor="cmd-paiement-mobile" className="cursor-pointer">Mobile Money</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-secondary/20 px-4 py-2 rounded-full cursor-pointer hover:bg-secondary/40">
                                        <RadioGroupItem value="orange" id="cmd-paiement-orange" />
                                        <Label htmlFor="cmd-paiement-orange" className="cursor-pointer">Orange Money</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <Button type="submit" size="lg" className="w-full bg-african-red hover:bg-african-red/90 text-white font-bold h-14 text-lg shadow-lg hover:shadow-xl transition-all" disabled={commandeLoading}>
                                {commandeLoading ? "Envoi..." : "Commander maintenant"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderBouteilles = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-african-yellow text-black hover:bg-african-yellow/80">Catalogue</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Nos Bouteilles</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Toutes les marques, toutes les tailles.</p>
            </div>

            {/* Grille des bouteilles */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {bouteilles.map((bouteille, index) => (
                    <Card key={index} className={`relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 ${bouteille.popular ? 'border-african-red scale-105 z-10' : 'border-transparent hover:border-african-yellow'}`}>
                        {bouteille.popular && (
                            <div className="absolute top-0 right-0 bg-african-red text-white px-4 py-1 text-sm font-bold rounded-bl-xl z-20">
                                Populaire
                            </div>
                        )}
                        <div className="p-8 text-center relative z-10">
                            <div className="w-32 h-32 mx-auto rounded-full bg-african-red/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-african-red/10 transition-all duration-500">
                                <Package className="h-16 w-16 text-african-red" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-african-earth mb-2 dark:text-white">{bouteille.taille}</h3>
                            <Badge variant="secondary" className="mb-4">{bouteille.usage}</Badge>
                            <p className="text-muted-foreground mb-6">{bouteille.description}</p>

                            <div className="text-2xl font-bold text-african-red mb-6">{bouteille.prix}</div>

                            <Button
                                className="w-full bg-african-red hover:bg-african-earth text-white rounded-full font-bold"
                                onClick={() => navigateToSection('commander')}
                            >
                                Commander
                            </Button>
                        </div>
                        {/* Interactive background */}
                        <div className="absolute inset-0 bg-african-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center space-y-2">
                        <ShieldCheck className="h-8 w-8 mx-auto text-green-600" />
                        <h3 className="font-bold dark:text-black">Sécurité Certifiée</h3>
                        <p className="text-sm text-muted-foreground dark:text-black">Bouteilles testées et conformes.</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6 text-center space-y-2">
                        <Award className="h-8 w-8 mx-auto text-blue-600" />
                        <h3 className="font-bold dark:text-black">Qualité Garantie</h3>
                        <p className="text-sm text-muted-foreground dark:text-black">Poids exact, flamme bleue.</p>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-6 text-center space-y-2">
                        <Users className="h-8 w-8 mx-auto text-orange-600" />
                        <h3 className="font-bold dark:text-black">Toutes Marques</h3>
                        <p className="text-sm text-muted-foreground dark:text-black">SCTM, CAMGAZ, TRADEX, TOTAL...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderEntreprises = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-purple-600 hover:bg-purple-700">Professionnels</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Solutions Entreprises</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Restaurateurs, Hôteliers : ne laissez jamais votre gaz s'épuiser en plein service.</p>
            </div>

            <div className="bg-secondary/20 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold font-heading mb-4">L'offre Pro "Zéro Rupture"</h3>
                            <p className="text-muted-foreground">Un service dédié avec un gestionnaire de compte pour vos approvisionnements réguliers.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {avantagesPro.map((av, i) => (
                                <div key={i} className="flex flex-col gap-2 p-4 bg-background rounded-xl border">
                                    <av.icon className="h-6 w-6 text-african-red" />
                                    <span className="font-medium text-sm">{av.text}</span>
                                </div>
                            ))}
                        </div>
                        <Button size="lg" className="w-full bg-african-earth text-white hover:bg-black" onClick={() => navigateToSection('contact')}>
                            Demander un devis Pro
                        </Button>
                    </div>
                    <div className="relative h-[400px] bg-african-earth rounded-2xl flex items-center justify-center text-white p-8 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0">
                            <img src={gazStockImage} alt="Entrepôt de gaz" className="w-full h-full object-cover opacity-20" />
                        </div>
                        <div className="relative z-10 text-center">
                            <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-80" />
                            <h4 className="text-2xl font-bold mb-2">Partenaire des Chefs</h4>
                            <p className="text-white/80">
                                "La rapidité de Le Bon Petit nous a sauvé plus d'une fois en plein coup de feu."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center max-w-3xl mx-auto bg-card border rounded-xl p-8 shadow-sm">
                <h4 className="font-bold text-lg mb-4 dark:text-white">Secteurs que nous servons</h4>
                <div className="flex flex-wrap justify-center gap-3">
                    {ciblesPro.map((cible, idx) => (
                        <Badge key={idx} variant="outline" className="px-4 py-2 text-base border-african-red/20 text-african-earth dark:text-white">
                            {cible}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAbonnements = () => (
        <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <Badge className="bg-blue-600 hover:bg-blue-700">Tranquillité</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Abonnements</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Automatisez vos commandes et profitez de tarifs préférentiels.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {formules.map((formule, index) => {
                    const Icon = formule.icon;
                    return (
                        <Card key={index} className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border hover:border-african-red flex flex-col bg-card">
                            <div className="absolute top-0 left-0 w-full h-2 bg-african-red" />
                            <CardHeader className="text-center pt-8">
                                <div className="w-16 h-16 mx-auto rounded-full bg-african-red/10 flex items-center justify-center mb-4">
                                    <Icon className="h-8 w-8 text-african-red" />
                                </div>
                                <Badge variant="outline" className="mx-auto mb-2 border-african-red text-african-red">{formule.nom}</Badge>
                                <CardTitle className="text-xl">{formule.description}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 flex-1 flex flex-col">
                                <ul className="space-y-3 flex-1">
                                    {formule.avantages.map((av, i) => (
                                        <li key={i} className="flex items-start text-sm gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{av}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-center pt-4 border-t mt-auto">
                                    <div className="text-lg font-bold text-african-earth mb-4 dark:text-white">{formule.prix}</div>
                                    <Button
                                        className="w-full bg-african-earth text-white hover:bg-african-red"
                                        onClick={() => navigateToSection('contact')}
                                    >
                                        Je m'abonne
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in text-center">
            <div className="space-y-4">
                <Badge className="bg-gray-600">Qui sommes-nous</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Notre Ambition</h2>
            </div>

            <div className="bg-card border-none shadow-2xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-3 bg-african-red" />
                <CardContent className="p-10 md:p-16 space-y-8">
                    <Flame className="h-20 w-20 mx-auto text-african-red mb-6 animate-pulse-glow" />
                    <blockquote className="text-2xl md:text-3xl font-light leading-relaxed font-heading italic text-gray-700 dark:text-foreground">
                        "Rendre le gaz domestique accessible partout, tout le temps, sans effort. Parce que cuisiner pour sa famille ne devrait jamais être interrompu."
                    </blockquote>
                    <div className="w-24 h-1 bg-african-earth/20 mx-auto rounded-full" />

                    <div className="grid md:grid-cols-3 gap-8 pt-4">
                        <div className="space-y-2">
                            <Zap className="h-8 w-8 mx-auto text-african-red" />
                            <h5 className="font-bold text-lg">Rapidité</h5>
                            <p className="text-muted-foreground text-sm">Livraison express garantie.</p>
                        </div>
                        <div className="space-y-2">
                            <ShieldCheck className="h-8 w-8 mx-auto text-african-red" />
                            <h5 className="font-bold text-lg">Sécurité</h5>
                            <p className="text-muted-foreground text-sm">Personnel formé et qualifié.</p>
                        </div>
                        <div className="space-y-2">
                            <MapPin className="h-8 w-8 mx-auto text-african-red" />
                            <h5 className="font-bold text-lg">Proximité</h5>
                            <p className="text-muted-foreground text-sm">Partout dans la ville.</p>
                        </div>
                    </div>
                </CardContent>
            </div>
        </div>
    );

    const renderBlog = () => (
        <div className="text-center py-24 animate-fade-in max-w-xl mx-auto">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-3xl font-bold mb-4">Blog & Conseils</h2>
            <p className="text-muted-foreground mb-8 text-lg">
                Recettes, astuces d'économie d'énergie et sécurité gaz. Bientôt disponible !
            </p>
            <Badge variant="secondary" className="text-base px-6 py-2 bg-secondary text-secondary-foreground">
                🚀 En construction
            </Badge>
        </div>
    );

    const renderContact = () => (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-12">
            <div className="text-center space-y-4">
                <Badge className="bg-african-earth">Support Client</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth dark:text-white">Contactez-nous</h2>
                <p className="text-muted-foreground text-lg">Nous sommes à votre écoute 7j/7.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="bg-african-red/5 border-african-red/20">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shrink-0">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">Commander sur WhatsApp</h3>
                                <p className="text-muted-foreground mb-3">Le moyen le plus rapide.</p>
                                <a
                                    href="https://wa.me/237690547084"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#25D366] font-bold hover:underline flex items-center gap-1"
                                >
                                    Ouvrir le chat <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <Phone className="h-8 w-8 text-african-earth mb-4" />
                                <h4 className="font-bold mb-1">Service Client</h4>
                                <p className="text-muted-foreground dark:text-white">+237 690 547 084</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <Mail className="h-8 w-8 text-african-earth mb-4" />
                                <h4 className="font-bold mb-1">Email</h4>
                                <p className="text-muted-foreground">gaz@lebonpetit237.com</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-red hover:text-african-red"><Facebook /></Button>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-red hover:text-african-red"><Instagram /></Button>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-red hover:text-african-red"><Twitter /></Button>
                    </div>
                </div>

                <Card className="bg-card border-t-4 border-t-african-red shadow-xl">
                    <CardHeader>
                        <CardTitle>Envoyer un message</CardTitle>
                        <CardDescription>Pour les partenariats ou réclamations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom</Label>
                                    <Input value={contactForm.nom} onChange={e => setContactForm({ ...contactForm, nom: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Sujet</Label>
                                <Input value={contactForm.sujet} onChange={e => setContactForm({ ...contactForm, sujet: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea className="min-h-[150px]" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required />
                            </div>
                            <Button type="submit" className="w-full bg-african-earth text-white hover:bg-black" disabled={contactLoading}>
                                {contactLoading ? "Envoi..." : "Envoyer le message"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="flex min-h-screen bg-background african-pattern relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Navigation */}
                <aside
                    className={`
                        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card/95 backdrop-blur border-r shadow-2xl lg:shadow-none
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b flex items-center justify-between">
                            <span className="font-heading text-2xl font-bold text-african-red dark:text-white">
                                Livraison de gaz
                            </span>
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            {navigation.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        navigateToSection(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left
                                        ${activeSection === item.id
                                            ? 'bg-african-red text-white shadow-md'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-white' : ''}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 border-t bg-secondary/30">
                            <div className="bg-card rounded-xl p-4 shadow-sm border border-african-red/20">
                                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Urgence Gaz ?</p>
                                <p className="font-bold text-african-earth dark:text-white">+237 690 547 084</p>
                                <p className="text-xs text-muted-foreground">Livraison &lt; 30min</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b p-4 flex items-center justify-between">
                        <span className="font-heading text-xl font-bold">Service Gaz</span>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                        {activeSection === 'accueil' && renderAccueil()}
                        {activeSection === 'commander' && renderCommander()}
                        {activeSection === 'bouteilles' && renderBouteilles()}
                        {activeSection === 'entreprises' && renderEntreprises()}
                        {activeSection === 'abonnements' && renderAbonnements()}
                        {activeSection === 'apropos' && renderAPropos()}
                        {activeSection === 'blog' && renderBlog()}
                        {activeSection === 'contact' && renderContact()}
                    </div>
                </main>

                {/* Fixed WhatsApp Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <WhatsAppButton
                        phoneNumber="237690547084"
                        message="Bonjour, je souhaite commander du gaz."
                    />
                </div>
            </div>
        </Layout>
    );
}
