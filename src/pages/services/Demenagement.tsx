import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
    Home,
    Truck,
    Users,
    Building2,
    Package,
    CreditCard,
    Info,
    BookOpen,
    Phone,
    CheckCircle2,
    Menu,
    X,
    Clock,
    ShieldCheck,
    MessageCircle,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Zap,
    Award,
    MapPin,
    Sofa,
    Boxes,
    ArrowUpDown,
    Move,
    PackageCheck,
    CalendarCheck,
    HandHelping
} from 'lucide-react';

// Import images
import demenagementHeroImage from '@/assets/services/demenagement-hero.png';
import demenagementTeamImage from '@/assets/services/demenagement-team.png';
import demenagementFurnitureImage from '@/assets/services/demenagement-furniture.png';
import demenagementLoadingImage from '@/assets/services/demenagement-loading.png';

type Section = 'accueil' | 'services' | 'particuliers' | 'entreprises' | 'tarifs' | 'apropos' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'services', name: 'Nos prestations', icon: Truck },
    { id: 'particuliers', name: 'Particuliers', icon: Users },
    { id: 'entreprises', name: 'Entreprises', icon: Building2 },
    { id: 'tarifs', name: 'Tarifs & devis', icon: CreditCard },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Équipe expérimentée", icon: Users },
    { text: "Matériel adapté", icon: Truck },
    { text: "Protection des biens", icon: ShieldCheck },
    { text: "Ponctualité garantie", icon: Clock },
    { text: "Devis gratuit", icon: CreditCard },
    { text: "Partout à Douala", icon: MapPin },
];

const servicesDemenagement = [
    {
        title: "Déménagement complet",
        description: "Emballage, transport, déballage - on s'occupe de tout.",
        icon: Boxes
    },
    {
        title: "Transport de meubles",
        description: "Canapés, lits, armoires, électroménager en toute sécurité.",
        icon: Sofa
    },
    {
        title: "Déménagement d'entreprise",
        description: "Bureaux, commerces, locaux professionnels.",
        icon: Building2
    },
    {
        title: "Livraison de gros colis",
        description: "Électroménager, meubles achetés en magasin.",
        icon: Package
    },
];

const servicesAmenagement = [
    {
        title: "Montage de meubles",
        description: "Assemblage de meubles IKEA, locaux et autres.",
        icon: Move
    },
    {
        title: "Installation d'équipements",
        description: "Électroménager, climatiseurs, TV murales.",
        icon: PackageCheck
    },
    {
        title: "Agencement de locaux",
        description: "Réorganisation d'espaces, bureaux, commerces.",
        icon: ArrowUpDown
    },
    {
        title: "Service de manutention",
        description: "Main-d'œuvre qualifiée pour charges lourdes.",
        icon: HandHelping
    },
];

export default function Demenagement() {
    const getInitialSection = (): Section => {
        const hash = window.location.hash.replace('#', '') as Section;
        return navigation.some(nav => nav.id === hash) ? hash : 'accueil';
    };

    const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    const navigateToSection = useCallback((section: Section) => {
        window.location.hash = section;
        setActiveSection(section);
    }, []);

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

    // Form states
    const [devisForm, setDevisForm] = useState({
        nom: '',
        telephone: '',
        typeService: '',
        depart: '',
        arrivee: '',
        datePreferee: '',
        details: '',
    });
    const [devisLoading, setDevisLoading] = useState(false);

    const handleDevisSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (devisLoading) return;

        setDevisLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'colis', // Using 'colis' as fallback since 'demenagement' is not yet in DB enum
                payload: { ...devisForm, type: 'devis_demenagement', original_service: 'demenagement' },
                contact_name: devisForm.nom,
                contact_phone: devisForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Notre équipe vous contactera pour votre devis.",
            });
            setDevisForm({ nom: '', telephone: '', typeService: '', depart: '', arrivee: '', datePreferee: '', details: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre demande. Réessayez.",
            });
        } finally {
            setDevisLoading(false);
        }
    };

    const renderAccueil = () => (
        <div className="space-y-16 animate-fade-in">
            {/* Hero Section */}
            <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[400px] sm:min-h-[500px] flex items-center shadow-2xl bg-african-earth">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <div className="absolute inset-0">
                    <img src={demenagementHeroImage} alt="Déménagement & Aménagement" className="w-full h-full object-cover" />
                </div>

                <div className="relative z-20 px-4 sm:px-8 py-12 sm:py-20 md:py-28 text-center text-white max-w-4xl mx-auto space-y-4 sm:space-y-8">
                    <Badge className="bg-white/20 text-white border-none py-2 px-4 backdrop-blur-md">
                        🚚 Service professionnel
                    </Badge>
                    <h1 className="font-heading text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight break-words">
                        Déménagement &<br />
                        <span className="text-african-yellow">Aménagement</span>
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed font-light px-2">
                        Vous déménagez ? Besoin de transporter ou monter des meubles ? Le Bon Petit vous accompagne de A à Z avec professionnalisme.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-african-yellow text-black hover:bg-white font-bold h-12 sm:h-14 px-4 sm:px-8 rounded-full shadow-lg text-sm sm:text-base"
                            onClick={() => navigateToSection('tarifs')}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            Demander un devis gratuit
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white/10 font-semibold h-12 sm:h-14 px-4 sm:px-8 rounded-full text-sm sm:text-base"
                            onClick={() => window.open('https://wa.me/237690547084', '_blank')}
                        >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            WhatsApp
                        </Button>
                    </div>
                </div>
            </section>

            {/* Avantages */}
            <section>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10 text-center dark:text-white">
                    Pourquoi <span className="text-african-earth dark:text-african-yellow">nous choisir</span> ?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                    {avantages.map((item, index) => (
                        <Card key={index} className="group text-center hover:-translate-y-2 transition-all duration-300 border shadow-sm hover:shadow-xl bg-card">
                            <CardContent className="p-3 sm:p-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-african-earth/10 flex items-center justify-center mb-2 sm:mb-4 group-hover:bg-african-earth group-hover:text-white transition-all">
                                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-african-earth dark:text-african-yellow group-hover:text-white dark:group-hover:text-white" />
                                </div>
                                <p className="font-semibold text-xs sm:text-sm">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Team Gallery */}
            <section>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10 text-center dark:text-white">
                    Notre <span className="text-african-earth dark:text-african-yellow">Équipe</span> en action
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        <img src={demenagementTeamImage} alt="Équipe Le Bon Petit 237" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                            <p className="text-white font-semibold">Notre équipe professionnelle</p>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        <img src={demenagementFurnitureImage} alt="Transport de meubles" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                            <p className="text-white font-semibold">Transport soigné de vos meubles</p>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        <img src={demenagementLoadingImage} alt="Chargement du camion" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                            <p className="text-white font-semibold">Chargement efficace et organisé</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="text-center">
                <Card className="bg-african-earth text-white border-none shadow-2xl">
                    <CardContent className="p-6 sm:p-10">
                        <h2 className="font-heading text-3xl font-bold mb-4">Prêt à déménager ?</h2>
                        <p className="text-white/80 mb-6 text-lg max-w-2xl mx-auto">
                            Obtenez un devis gratuit en quelques minutes. Notre équipe vous rappelle rapidement.
                        </p>
                        <Button
                            size="lg"
                            className="bg-african-yellow text-black hover:bg-white font-bold rounded-full"
                            onClick={() => navigateToSection('tarifs')}
                        >
                            Demander un devis
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-earth text-white mb-4">Nos Prestations</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4 dark:text-white">
                    Services de <span className="text-african-earth dark:text-african-yellow">Déménagement & Aménagement</span>
                </h2>
                <p className="text-muted-foreground text-lg">Transport sécurisé de vos biens</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {servicesDemenagement.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none shadow-lg bg-card overflow-hidden">
                            <div className="h-1 bg-african-earth w-0 group-hover:w-full transition-all duration-500" />
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-african-earth/10 text-african-earth dark:text-african-yellow group-hover:bg-african-earth group-hover:text-white transition-all">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-heading">{service.title}</CardTitle>
                                        <CardDescription className="mt-1">{service.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center pt-8">
                <Badge className="bg-african-yellow text-black mb-4">Aménagement & Installation</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4 dark:text-white">
                    Services d'<span className="text-african-earth dark:text-african-yellow">Aménagement</span>
                </h2>
                <p className="text-muted-foreground text-lg">Installation et montage professionnels</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {servicesAmenagement.map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none shadow-lg bg-card overflow-hidden">
                            <div className="h-1 bg-african-yellow w-0 group-hover:w-full transition-all duration-500" />
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-african-yellow/10 text-african-earth dark:text-african-yellow group-hover:bg-african-yellow group-hover:text-black transition-all">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-heading">{service.title}</CardTitle>
                                        <CardDescription className="mt-1">{service.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    const renderParticuliers = () => (
        <div className="space-y-10 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-earth text-white mb-4">Particuliers</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4 dark:text-white">
                    Déménagez <span className="text-african-earth dark:text-african-yellow">l'esprit tranquille</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Que vous changiez de quartier ou de ville, nous prenons soin de vos affaires comme si c'étaient les nôtres.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: "Studios & Chambres", desc: "Petit volume, prix adapté", icon: Home },
                    { title: "Appartements", desc: "Transport complet avec équipe", icon: Building2 },
                    { title: "Maisons & Villas", desc: "Déménagement sur mesure", icon: Home },
                ].map((item, idx) => (
                    <Card key={idx} className="group border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <div className="w-14 h-14 mx-auto rounded-xl bg-african-earth/10 flex items-center justify-center mb-4 group-hover:bg-african-earth transition-colors">
                                <item.icon className="h-7 w-7 text-african-earth dark:text-african-yellow group-hover:text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center">
                <Button size="lg" className="bg-african-earth hover:bg-african-earth/90 text-white font-bold rounded-xl" onClick={() => navigateToSection('tarifs')}>
                    Demander un devis gratuit
                </Button>
            </div>
        </div>
    );

    const renderEntreprises = () => (
        <div className="space-y-10 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-african-earth text-white mb-4">Entreprises</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4 dark:text-white">
                    Solutions <span className="text-african-earth dark:text-african-yellow">professionnelles</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Déménagement de bureaux, réagencement de locaux, installation d'équipements — nous intervenons rapidement.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { title: "Déménagement de bureaux", desc: "Mobilier, archives, matériel informatique", features: ["Week-end possible", "Confidentialité assurée"] },
                    { title: "Transfert de commerces", desc: "Boutiques, restaurants, showrooms", features: ["Coordination avec vos équipes", "Remise en service rapide"] },
                ].map((item, idx) => (
                    <Card key={idx} className="border-none shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                            <p className="text-muted-foreground mb-4">{item.desc}</p>
                            <ul className="space-y-2">
                                {item.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-african-earth dark:text-african-yellow flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center">
                <Button size="lg" className="bg-african-earth hover:bg-african-earth/90 text-white font-bold rounded-xl" onClick={() => navigateToSection('tarifs')}>
                    Demander un devis entreprise
                </Button>
            </div>
        </div>
    );

    const renderTarifs = () => (
        <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center">
                <Badge className="bg-african-yellow text-black mb-4">Devis Gratuit</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4 dark:text-white">
                    Tarifs & <span className="text-african-earth dark:text-african-yellow">Devis</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                    Chaque déménagement est unique. Remplissez le formulaire pour recevoir un devis personnalisé.
                </p>
            </div>

            <Card className="border-none shadow-2xl">
                <div className="h-2 bg-african-earth w-full" />
                <CardHeader className="text-center">
                    <CardTitle className="font-heading text-2xl">Demander un devis</CardTitle>
                    <CardDescription>Réponse sous 24h</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleDevisSubmit} className="grid gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom complet</Label>
                            <Input id="nom" value={devisForm.nom} onChange={e => setDevisForm({ ...devisForm, nom: e.target.value })} placeholder="Votre nom" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone / WhatsApp</Label>
                            <PhoneInput
                                value={devisForm.telephone}
                                onValueChange={(val) => setDevisForm({ ...devisForm, telephone: val })}
                                placeholder="Numéro de téléphone"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="typeService">Type de service</Label>
                            <Select onValueChange={v => setDevisForm({ ...devisForm, typeService: v })}>
                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="demenagement_complet">Déménagement complet</SelectItem>
                                    <SelectItem value="transport_meubles">Transport de meubles</SelectItem>
                                    <SelectItem value="montage_meubles">Montage de meubles</SelectItem>
                                    <SelectItem value="demenagement_bureau">Déménagement bureau</SelectItem>
                                    <SelectItem value="manutention">Manutention</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="datePreferee">Date souhaitée</Label>
                            <Input id="datePreferee" type="date" value={devisForm.datePreferee} onChange={e => setDevisForm({ ...devisForm, datePreferee: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depart">Adresse de départ</Label>
                            <Input id="depart" value={devisForm.depart} onChange={e => setDevisForm({ ...devisForm, depart: e.target.value })} placeholder="Quartier, repère..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="arrivee">Adresse d'arrivée</Label>
                            <Input id="arrivee" value={devisForm.arrivee} onChange={e => setDevisForm({ ...devisForm, arrivee: e.target.value })} placeholder="Quartier, repère..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="details">Détails supplémentaires</Label>
                            <Textarea id="details" value={devisForm.details} onChange={e => setDevisForm({ ...devisForm, details: e.target.value })} placeholder="Liste des objets, étage, accès difficile..." className="min-h-[100px]" />
                        </div>
                        <div className="pt-4">
                            <Button type="submit" size="lg" className="w-full bg-african-earth hover:bg-african-earth/90 text-white font-bold h-14 text-lg rounded-xl" disabled={devisLoading}>
                                {devisLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-center">
                {[
                    { title: "Transport simple", price: "À partir de 10 000 FCFA", desc: "Petit volume, courte distance" },
                    { title: "Déménagement standard", price: "À partir de 50 000 FCFA", desc: "Appartement, équipe de 2-3 personnes" },
                    { title: "Déménagement complet", price: "Sur devis", desc: "Emballage, transport, installation" },
                ].map((item, idx) => (
                    <Card key={idx} className="border shadow-sm">
                        <CardContent className="p-6">
                            <h4 className="font-bold mb-2">{item.title}</h4>
                            <p className="text-xl font-extrabold text-african-earth dark:text-african-yellow mb-2">{item.price}</p>
                            <p className="text-muted-foreground text-sm">{item.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
            <div>
                <Badge className="bg-african-earth text-white mb-4">Notre Vision</Badge>
                <h2 className="font-heading text-4xl font-bold dark:text-white">À <span className="text-african-earth dark:text-african-yellow">Propos</span></h2>
            </div>
            <Card className="border-none shadow-2xl">
                <div className="h-2 bg-african-earth w-full" />
                <CardContent className="p-12 space-y-6">
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Le Bon Petit Déménagement & Aménagement</strong> est un service de transport et d'aménagement basé à Douala.
                        Nous aidons les particuliers et les professionnels à déplacer leurs biens en toute sérénité.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Notre équipe expérimentée manipule vos affaires avec soin, dans les délais convenus et à des tarifs transparents.
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const renderContact = () => (
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto animate-fade-in">
            <div className="space-y-8">
                <div>
                    <h2 className="font-heading text-3xl font-bold mb-4 dark:text-white">Contactez-nous</h2>
                    <p className="text-muted-foreground">Pour toute question ou demande de devis.</p>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-african-earth/10 flex items-center justify-center">
                                <Phone className="h-6 w-6 text-african-earth dark:text-african-yellow" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Téléphone</p>
                                <p className="font-semibold text-lg dark:text-white">+237 690 547 084</p>
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
                                <p className="text-sm text-muted-foreground">WhatsApp</p>
                                <p className="font-semibold text-lg text-[#25D366]">Discuter maintenant</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold text-lg dark:text-white">contact@lebonpetit237.com</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-3">Réseaux Sociaux</p>
                            <div className="flex gap-4">
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-earth"><Facebook className="h-5 w-5" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-earth"><Instagram className="h-5 w-5" /></Button>
                                <Button size="icon" variant="outline" className="rounded-full hover:text-african-earth"><Twitter className="h-5 w-5" /></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Demande rapide</CardTitle>
                    <CardDescription>Décrivez brièvement votre besoin</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input placeholder="Votre nom" />
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input placeholder="+237..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea placeholder="Décrivez votre besoin..." className="min-h-[100px]" />
                        </div>
                        <Button type="button" className="w-full bg-african-earth hover:bg-african-earth/90 text-white">
                            Envoyer
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
                        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 sm:w-72 bg-card/95 backdrop-blur border-r shadow-2xl lg:shadow-none
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        flex flex-col
                    `}
                >
                    <div className="p-6 border-b flex items-center justify-between">
                        <span className="font-heading text-lg sm:text-xl lg:text-2xl font-bold text-african-earth dark:text-white leading-tight">
                            Déménagement & Aménagement
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
                                        ? 'bg-african-earth text-white shadow-md'
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
                        <div className="bg-card rounded-xl p-4 shadow-sm border border-african-earth/20">
                            <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Besoin d'aide ?</p>
                            <p className="font-bold text-african-earth dark:text-white">+237 690 547 084</p>
                            <p className="text-xs text-muted-foreground">Devis gratuit</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-secondary/10">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-african-earth dark:text-african-yellow" />
                            <span className="font-heading font-bold text-sm sm:text-lg truncate">Déménagement</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    <div className="p-2 sm:p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
                        {activeSection === 'accueil' && renderAccueil()}
                        {activeSection === 'services' && renderServices()}
                        {activeSection === 'particuliers' && renderParticuliers()}
                        {activeSection === 'entreprises' && renderEntreprises()}
                        {activeSection === 'tarifs' && renderTarifs()}
                        {activeSection === 'apropos' && renderAPropos()}
                        {activeSection === 'contact' && renderContact()}
                    </div>
                </main>

                <WhatsAppButton phoneNumber="237690547084" message="Bonjour, je souhaite un devis pour un déménagement." />
            </div>
        </Layout>
    );
}
