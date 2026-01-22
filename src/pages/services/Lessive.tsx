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
    Shirt,
    ShoppingBag,
    CreditCard,
    Building2,
    Info,
    BookOpen,
    Phone,
    CheckCircle2,
    Menu,
    X,
    Truck,
    Clock,
    Sparkles,
    Users,
    MessageCircle,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Award,
    Layers,
    Heart,
    Calendar,
    ArrowRight,
    MapPin,
    Zap
} from 'lucide-react';

// Import images - African context
import lessiveHeroImage from '@/assets/services/lessive-hero.png';
import africanLessiveArt from '@/assets/services/african-lessive-art.png';
import pressingWashing from '@/assets/services/pressing-washing.png';
import pressingIroning from '@/assets/services/pressing-ironing.png';
import pressingFolding from '@/assets/services/pressing-folding.png';
import pressingDelivery from '@/assets/services/pressing-delivery.png';

type Section = 'accueil' | 'commander' | 'services' | 'abonnements' | 'entreprises' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'commander', name: 'Commander', icon: ShoppingBag },
    { id: 'services', name: 'Nos services', icon: Shirt },
    { id: 'abonnements', name: 'Abonnements', icon: CreditCard },
    { id: 'entreprises', name: 'Entreprises', icon: Building2 },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Ramassage à domicile", icon: Truck },
    { text: "Lavage professionnel", icon: Sparkles },
    { text: "Respect des tissus", icon: Heart },
    { text: "Délais rapides (24-48h)", icon: Clock },
    { text: "Service fiable", icon: CheckCircle2 },
];

const etapesCommande = [
    { step: "1", title: "Programmez", description: "Choisissez le créneau de ramassage" },
    { step: "2", title: "Nous collectons", description: "Un agent récupère votre linge" },
    { step: "3", title: "Lavage & Soin", description: "Traitement expert de vos textiles" },
    { step: "4", title: "Livraison", description: "Linge propre et plié chez vous" },
];

const servicesDetails = [
    {
        title: "Lessive Standard",
        icon: Shirt,
        color: "green",
        items: ["Lavage machine", "Séchage", "Pliage soigné"],
        description: "Pour le linge du quotidien.",
        image: pressingWashing
    },
    {
        title: "Repassage",
        icon: Layers,
        color: "emerald",
        items: ["Repassage main", "Sur cintre ou plié"],
        description: "Fini la corvée de repassage.",
        image: pressingIroning
    },
    {
        title: "Délicat & Pressing",
        icon: Sparkles,
        color: "teal",
        items: ["Nettoyage à sec", "Tâches tenaces", "Textiles fragiles"],
        description: "Costumes, robes de soirée...",
        image: pressingFolding
    },
    {
        title: "Gros volumes",
        icon: Building2,
        color: "green",
        items: ["Couettes", "Rideaux", "Nappes"],
        description: "Lavage spécial grandes pièces.",
        image: lessiveHeroImage
    }
];

const formules = [
    {
        nom: "Essentiel",
        description: "Pour célibataires",
        avantages: ["2 ramassages / mois", "Lavage + Pliage", "10kg max / ramassage"],
        prix: "15 000 FCFA",
        icon: Users,
        popular: false
    },
    {
        nom: "Famille",
        description: "Le plus populaire",
        avantages: ["4 ramassages / mois", "Lavage + Repassage", "Livraison prioritaire"],
        prix: "35 000 FCFA",
        icon: Home,
        popular: true
    },
    {
        nom: "Premium",
        description: "Tout inclus",
        avantages: ["Illimité", "Pressing inclus", "Ramassage express"],
        prix: "Sur devis",
        icon: Award,
        popular: false
    }
];

const ciblesPro = [
    "Hôtels", "Restaurants", "Spas", "Cliniques", "Bureaux"
];

const typesLinge = [
    "Vêtements divers", "Chemises & Costumes", "Draps & Serviettes", "Rideaux & Tapis", "Autre"
];

export default function Lessive() {
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
        nom: '',
        telephone: '',
        adresse: '',
        typeLinge: '',
        delai: '',
    });
    const [commandeLoading, setCommandeLoading] = useState(false);

    const [contactForm, setContactForm] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

    const handleCommandeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commandeLoading) return;
        setCommandeLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'lessive',
                payload: { ...commandeForm, type: 'commande_lessive' },
                contact_name: commandeForm.nom,
                contact_phone: commandeForm.telephone,
                status: 'new',
            });
            if (error) throw error;
            toast({ title: "Ramassage programmé !", description: "Un agent vous contactera très vite." });
            setCommandeForm({ nom: '', telephone: '', adresse: '', typeLinge: '', delai: '' });
        } catch (error) {
            console.error('Error:', error);
            toast({ variant: "destructive", title: "Erreur", description: "Réessayez plus tard." });
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
                service_type: 'lessive',
                payload: { ...contactForm, type: 'contact_lessive' },
                contact_name: contactForm.nom,
                contact_phone: 'N/A',
                status: 'new',
            });
            if (error) throw error;
            toast({ title: "Message envoyé !", description: "Nous reviendrons vers vous." });
            setContactForm({ nom: '', email: '', sujet: '', message: '' });
        } catch (error) {
            console.error('Error:', error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer." });
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
                    <img src={lessiveHeroImage} alt="Linge propre" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
                </div>
                <div className="relative z-20 container px-6 md:px-12 py-16 text-white grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6 animate-slide-up">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md mb-2">
                            ✨ Fraîcheur et Propreté Garanties
                        </Badge>
                        <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight">
                            Redécouvrez le plaisir d'un <span className="text-emerald-200">linge éclatant</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-xl font-light leading-relaxed">
                            Nous ramassons, lavons, repassons et livrons votre linge. Offrez-vous la qualité d'un service premium.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-emerald-400 text-green-900 hover:bg-white font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300"
                                onClick={() => navigateToSection('commander')}
                            >
                                Programmer un ramassage <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-background rounded-t-[50%] scale-x-110 translate-y-8 z-30" />
            </section>

            {/* Qui sommes-nous */}
            <section className="relative py-8">
                <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                    <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 group">
                        <img src={africanLessiveArt} alt="Femme africaine faisant la lessive" className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border-l-4 border-emerald-500">
                                <p className="text-green-900 font-medium italic">"L'art de la lessive africaine"</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-green-600">
                            L'Art du Linge au Cameroun
                        </h2>
                        <p className="text-muted-foreground text-xl leading-relaxed">
                            Chez Le Bon Petit, nous comprenons que chaque vêtement a une histoire. Nos experts utilisent des méthodes traditionnelles et modernes pour préserver vos textiles.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                <span>Lavage à la main ou machine pro</span>
                            </li>
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                <span>Produits doux et parfumés</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Avantages */}
            <section>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {avantages.map((item, index) => (
                        <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 border shadow-soft hover:shadow-xl bg-card">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                    <item.icon className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <p className="font-bold text-gray-800">{item.text}</p>
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
                <Badge className="bg-green-600 text-white">Service Express</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Programmer une lessive</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Remplissez le formulaire et nous arrivons.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                    {etapesCommande.map((etape, index) => (
                        <div key={index} className="relative p-6 rounded-2xl bg-card border hover:border-emerald-400 transition-colors group">
                            <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                                {etape.step}
                            </div>
                            <h3 className="font-heading text-lg font-bold mb-2 mt-2">{etape.title}</h3>
                            <p className="text-sm text-muted-foreground">{etape.description}</p>
                        </div>
                    ))}
                </div>
                <div className="hidden lg:block rounded-2xl overflow-hidden shadow-xl rotate-2 hover:rotate-0 transition-all duration-500">
                    <img src={pressingDelivery} alt="Livraison de linge propre" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                </div>
            </div>

            <Card className="border-none shadow-2xl overflow-hidden bg-card">
                <div className="h-3 w-full bg-emerald-500" />
                <CardHeader className="bg-secondary/20 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <ShoppingBag className="h-6 w-6 text-green-600" />
                        Détails du ramassage
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleCommandeSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom complet</Label>
                                <Input id="nom" className="bg-secondary/20 h-12" value={commandeForm.nom} onChange={e => setCommandeForm({ ...commandeForm, nom: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <Input id="telephone" className="bg-secondary/20 h-12" value={commandeForm.telephone} onChange={e => setCommandeForm({ ...commandeForm, telephone: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="adresse">Adresse de ramassage</Label>
                                <Input id="adresse" className="bg-secondary/20 h-12" value={commandeForm.adresse} onChange={e => setCommandeForm({ ...commandeForm, adresse: e.target.value })} placeholder="Quartier, porte, etc." required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type de linge</Label>
                                    <Select onValueChange={v => setCommandeForm({ ...commandeForm, typeLinge: v })}>
                                        <SelectTrigger className="bg-background h-12"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                        <SelectContent>
                                            {typesLinge.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Urgence</Label>
                                    <Select onValueChange={v => setCommandeForm({ ...commandeForm, delai: v })}>
                                        <SelectTrigger className="bg-background h-12"><SelectValue placeholder="Délai..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="24h">Express (24h)</SelectItem>
                                            <SelectItem value="48h">Standard (48h)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-lg shadow-lg" disabled={commandeLoading}>
                                {commandeLoading ? "Envoi..." : "Confirmer le ramassage"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Expertise</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Nos Services</h2>
                <p className="text-muted-foreground text-lg">Du simple lavage au traitement délicat.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {servicesDetails.map((service, index) => {
                    const Icon = service.icon;
                    const colorMap: any = {
                        green: "bg-green-50 border-green-100 dark:bg-green-900/10",
                        emerald: "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10",
                        teal: "bg-teal-50 border-teal-100 dark:bg-teal-900/10",
                    };
                    const iconColor: any = {
                        green: "text-green-600",
                        emerald: "text-emerald-600",
                        teal: "text-teal-600",
                    };

                    return (
                        <Card key={index} className={`border ${colorMap[service.color]} hover:shadow-lg transition-all overflow-hidden`}>
                            <div className="h-48 overflow-hidden relative group-hover:shadow-inner">
                                <div className={`absolute inset-0 bg-${service.color}-900/10 z-10`} />
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white shadow-sm ${iconColor[service.color]}`}>
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <CardTitle>{service.title}</CardTitle>
                                        <CardDescription>{service.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {service.items.map((it, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className={`w-1.5 h-1.5 rounded-full ${iconColor[service.color].replace('text-', 'bg-')}`} />
                                            {it}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    const renderAbonnements = () => (
        <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <Badge className="bg-emerald-500">Économies</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Nos Abonnements</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {formules.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <Card key={i} className={`relative hover:shadow-2xl transition-all duration-300 flex flex-col bg-card ${f.popular ? 'border-emerald-400 border-2 scale-105 z-10 shadow-xl' : 'border-border'}`}>
                            {f.popular && <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">Choix Malin</div>}
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                            <CardHeader className="text-center pt-8">
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                                    <Icon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold">{f.nom}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col space-y-6">
                                <div className="text-3xl font-bold text-center text-green-700">{f.prix}</div>
                                <ul className="space-y-3 flex-1">
                                    {f.avantages.map((a, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {a}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full ${f.popular ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-black'} text-white`} onClick={() => navigateToSection('contact')}>
                                    Choisir cette formule
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );

    const renderEntreprises = () => (
        <div className="space-y-12 animate-fade-in text-center">
            <div className="space-y-4">
                <Badge className="bg-teal-600">Pro</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Solutions Entreprises</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Confiez-nous la gestion du linge de votre établissement.</p>
            </div>

            <Card className="bg-green-900 text-white overflow-hidden max-w-5xl mx-auto shadow-2xl border-none">
                <CardContent className="p-12 space-y-8">
                    <Building2 className="h-16 w-16 mx-auto opacity-80" />
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Pourquoi Le Bon Petit Pro ?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3"><Clock className="text-emerald-400" /> Ramassage sur horaires fixes</li>
                                <li className="flex items-center gap-3"><Award className="text-emerald-400" /> Qualité hôtelière garantie</li>
                                <li className="flex items-center gap-3"><CreditCard className="text-emerald-400" /> Facturation fin de mois</li>
                            </ul>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
                            <h4 className="font-bold mb-4">Parfait pour :</h4>
                            <div className="flex flex-wrap gap-2">
                                {ciblesPro.map((c, i) => <Badge key={i} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">{c}</Badge>)}
                            </div>
                            <Button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold" onClick={() => navigateToSection('contact')}>
                                Demander un devis
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-4xl mx-auto text-center space-y-12 animate-fade-in">
            <h2 className="font-heading text-4xl font-bold text-african-earth">Notre Philosophie</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-card rounded-xl shadow-sm">
                    <Clock className="h-10 w-10 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Gain de temps</h3>
                    <p className="text-sm text-muted-foreground">Profitez de votre vie, on s'occupe du linge.</p>
                </div>
                <div className="p-6 bg-card rounded-xl shadow-sm">
                    <Award className="h-10 w-10 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Qualité Premium</h3>
                    <p className="text-sm text-muted-foreground">Chaque vêtement est inspecté et traité avec soin.</p>
                </div>
                <div className="p-6 bg-card rounded-xl shadow-sm">
                    <Heart className="h-10 w-10 text-green-600 mx-auto mb-4" />
                    <h3 className="font-bold mb-2">Écologique</h3>
                    <p className="text-sm text-muted-foreground">Utilisation de produits respectueux de l'environnement.</p>
                </div>
            </div>
        </div>
    );

    const renderContact = () => (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-4xl font-bold text-african-earth">Contactez-nous</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="bg-emerald-50 border-emerald-100">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shrink-0">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">WhatsApp Direct</h3>
                                <p className="text-muted-foreground mb-3">+237 690 547 084</p>
                                <a href="https://wa.me/237690547084" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Ouvrir le chat →</a>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" size="icon" className="rounded-full"><Facebook /></Button>
                        <Button variant="outline" size="icon" className="rounded-full"><Instagram /></Button>
                        <Button variant="outline" size="icon" className="rounded-full"><Twitter /></Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>Écrivez-nous</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <Input placeholder="Votre nom" value={contactForm.nom} onChange={e => setContactForm({ ...contactForm, nom: e.target.value })} required />
                            <Input placeholder="Email" type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                            <Input placeholder="Sujet" value={contactForm.sujet} onChange={e => setContactForm({ ...contactForm, sujet: e.target.value })} required />
                            <Textarea placeholder="Message..." value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required />
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={contactLoading}>
                                {contactLoading ? "Envoi..." : "Envoyer"}
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
                {/* Sidebar Overlay */}
                {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-card/95 backdrop-blur border-r shadow-2xl lg:shadow-none transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b flex items-center justify-between">
                            <span className="font-heading text-2xl font-bold text-green-700">
                                Pressing Plus
                            </span>
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}><X /></Button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            {navigation.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { navigateToSection(item.id); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeSection === item.id ? 'bg-green-600 text-white shadow-md' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </button>
                            ))}
                        </nav>
                        <div className="p-4 border-t bg-secondary/30">
                            <div className="bg-card rounded-xl p-4 shadow-sm border border-green-200">
                                <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Une question ?</p>
                                <p className="font-bold text-african-earth">+237 690 547 084</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b p-4 flex items-center justify-between">
                        <span className="font-heading text-xl font-bold">Service Lessive</span>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}><Menu /></Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                        {activeSection === 'accueil' && renderAccueil()}
                        {activeSection === 'commander' && renderCommander()}
                        {activeSection === 'services' && renderServices()}
                        {activeSection === 'abonnements' && renderAbonnements()}
                        {activeSection === 'entreprises' && renderEntreprises()}
                        {activeSection === 'apropos' && renderAPropos()}
                        {activeSection === 'contact' && renderContact()}
                        {activeSection === 'blog' && <div className="text-center py-20 text-muted-foreground"><BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />Blog en construction...</div>}
                    </div>
                </main>

                <div className="fixed bottom-6 right-6 z-50">
                    <WhatsAppButton phoneNumber="237690547084" message="Bonjour, je souhaite programmer une lessive." />
                </div>
            </div>
        </Layout>
    );
}
