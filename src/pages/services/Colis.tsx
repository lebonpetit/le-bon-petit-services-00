import { useState, useEffect } from 'react';
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
import {
    Home,
    Package,
    Send,
    MapPin,
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
    ShieldCheck,
    Users,
    MessageCircle,
    Mail,
    Facebook,
    Instagram,
    Twitter,
    Award,
    Globe,
    Plane,
    Navigation,
    Zap,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

// Import images
import colisCustomerImage from '@/assets/services/colis-customer.png?format=webp&quality=80';
import colisDeliveryImage from '@/assets/services/colis-delivery.png?format=webp&quality=80';
import colisWarehouseImage from '@/assets/services/colis-warehouse.png?format=webp&quality=80';

type Section = 'accueil' | 'envoyer' | 'destinations' | 'tarifs' | 'entreprises' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'envoyer', name: 'Envoyer un colis', icon: Send },
    { id: 'destinations', name: 'Nos destinations', icon: MapPin },
    { id: 'tarifs', name: 'Tarifs & délais', icon: CreditCard },
    { id: 'entreprises', name: 'Entreprises & e-commerce', icon: Building2 },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Collecte à domicile", icon: Truck },
    { text: "Suivi en temps réel", icon: Navigation },
    { text: "Livraison sécurisée", icon: ShieldCheck },
    { text: "National & International", icon: Globe },
    { text: "Délais garantis", icon: Clock },
];

const etapesEnvoi = [
    { step: "1", title: "Programmez l'envoi", description: "Remplissez le formulaire avec les détails du colis" },
    { step: "2", title: "Collecte chez vous", description: "Un livreur passe récupérer votre colis" },
    { step: "3", title: "Acheminement", description: "Transport sécurisé vers la destination" },
    { step: "4", title: "Livraison", description: "Le destinataire reçoit son colis" },
];

const destinationsNationales = [
    "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua",
    "Maroua", "Ngaoundéré", "Bertoua", "Kribi", "Limbé",
    "Buéa", "Edéa", "Nkongsamba", "Dschang", "Ebolowa"
];

const destinationsInternationales = [
    { zone: "Europe", pays: ["France", "Belgique", "Allemagne", "Suisse", "Royaume-Uni", "Espagne", "Italie"] },
    { zone: "Amérique", pays: ["Canada", "États-Unis"] },
    { zone: "Afrique", pays: ["Côte d'Ivoire", "Sénégal", "Gabon", "Tchad", "Nigeria", "Congo"] },
];

const tarifs = [
    { type: "Express National", delai: "24-48h", prix: "À partir de 2 500 FCFA", description: "Livraison rapide dans les grandes villes" },
    { type: "Standard National", delai: "3-5 jours", prix: "À partir de 1 500 FCFA", description: "Option économique pour le Cameroun" },
    { type: "Express International", delai: "5-7 jours", prix: "À partir de 15 000 FCFA", description: "Envoi rapide vers l'étranger" },
    { type: "Économique International", delai: "10-15 jours", prix: "À partir de 8 000 FCFA", description: "Option abordable à l'international" },
];

const ciblesPro = [
    { nom: "E-commerce", icon: Package },
    { nom: "Entreprises", icon: Building2 },
    { nom: "Diaspora", icon: Globe },
    { nom: "Particuliers réguliers", icon: Users },
];

const avantagesPro = [
    { text: "Tarifs négociés sur volume", icon: CreditCard },
    { text: "Collecte régulière programmée", icon: Clock },
    { text: "API d'intégration disponible", icon: Zap },
    { text: "Service client dédié", icon: Users },
];

const typesEnvoi = [
    "Documents",
    "Petit colis (< 5kg)",
    "Colis moyen (5-20kg)",
    "Gros colis (> 20kg)",
    "Colis fragile",
    "Produits alimentaires",
    "Autre"
];

const villesCameroun = [
    "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua",
    "Maroua", "Ngaoundéré", "Bertoua", "Kribi", "Limbé", "Autre"
];

const paysInternational = [
    "France", "Belgique", "Allemagne", "Suisse", "Canada",
    "États-Unis", "Royaume-Uni", "Côte d'Ivoire", "Sénégal", "Gabon", "Autre"
];

export default function Colis() {
    const [activeSection, setActiveSection] = useState<Section>('accueil');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    // Form states
    const [envoiForm, setEnvoiForm] = useState({
        typeDestination: 'national',
        expediteurNom: '',
        expediteurTelephone: '',
        expediteurAdresse: '',
        destinataireNom: '',
        destinataireTelephone: '',
        destinataireVille: '',
        destinatairePays: '',
        destinataireAdresse: '',
        typeColis: '',
        description: '',
        urgence: 'standard',
    });
    const [envoiLoading, setEnvoiLoading] = useState(false);

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

    const handleEnvoiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (envoiLoading) return;

        setEnvoiLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'colis',
                payload: { ...envoiForm, type: 'envoi_colis' },
                contact_name: envoiForm.expediteurNom,
                contact_phone: envoiForm.expediteurTelephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Notre équipe vous contactera pour confirmer l'envoi.",
            });
            setEnvoiForm({
                typeDestination: 'national',
                expediteurNom: '',
                expediteurTelephone: '',
                expediteurAdresse: '',
                destinataireNom: '',
                destinataireTelephone: '',
                destinataireVille: '',
                destinatairePays: '',
                destinataireAdresse: '',
                typeColis: '',
                description: '',
                urgence: 'standard',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre demande. Réessayez.",
            });
        } finally {
            setEnvoiLoading(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contactLoading) return;

        setContactLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'colis',
                payload: { ...contactForm, type: 'contact_colis' },
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
                <div className="absolute inset-0 bg-gradient-to-r from-african-yellow/90 via-african-earth/80 to-black/80 z-10" />
                <div className="absolute inset-0">
                    <img src={colisCustomerImage} alt="Cliente heureuse recevant un colis" className="w-full h-full object-cover scale-105 animate-slow-zoom" style={{ objectPosition: 'center 20%' }} />
                </div>

                <div className="relative z-20 container px-6 md:px-12 py-16 text-white grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6 animate-slide-up">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-1.5 px-4 backdrop-blur-md mb-2">
                            🌍 Leader de la logistique au Cameroun
                        </Badge>
                        <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight">
                            Vos colis, notre <span className="text-african-yellow">priorité</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-xl font-light leading-relaxed">
                            Envoyez vos colis partout au Cameroun et dans le monde avec rapidité, sécurité et des tarifs imbattables.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-african-yellow text-black hover:bg-white font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all duration-300"
                                onClick={() => setActiveSection('envoyer')}
                            >
                                Envoyer un colis <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/50 text-white hover:bg-white/10 h-14 px-8 rounded-full backdrop-blur-sm"
                                onClick={() => setActiveSection('tarifs')}
                            >
                                Voir les tarifs
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
                    <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img src={colisDeliveryImage} alt="Livreur Le Bon Petit remettant un colis" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <p className="text-white font-medium italic">"Le sourire à chaque livraison"</p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-african-earth">
                            L'excellence logistique, simplifiée
                        </h2>
                        <p className="text-muted-foreground text-xl leading-relaxed">
                            Nous digitalisons le transport de colis. Que vous soyez un particulier envoyant un cadeau ou une entreprise gérant ses stocks,
                            <span className="font-semibold text-african-yellow"> Le Bon Petit </span>
                            est votre partenaire de confiance.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span>Service 100% Camerounais</span>
                            </li>
                            <li className="flex items-center gap-3 text-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <span>Suivi en temps réel</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Pourquoi nous choisir */}
            <section>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {avantages.map((item, index) => (
                        <Card key={index} className="group hover:-translate-y-2 transition-all duration-300 border-none shadow-soft hover:shadow-card bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-african-yellow/20 to-african-yellow/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <item.icon className="h-8 w-8 text-african-earth" />
                                </div>
                                <p className="font-bold text-gray-800">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Rapide */}
            <div className="rounded-3xl bg-gradient-to-r from-african-earth to-black p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-african-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-6">
                    <h3 className="font-heading text-3xl font-bold">Prêt à expédier ?</h3>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg">
                        Remplissez notre formulaire simplifié en moins de 2 minutes et laissez-nous gérer le reste.
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-african-earth hover:bg-african-yellow hover:text-black font-bold rounded-full h-12 px-8"
                        onClick={() => setActiveSection('envoyer')}
                    >
                        Commencer l'envoi
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderEnvoyer = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-african-yellow text-black hover:bg-african-yellow/80">Expédition</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Envoyer un colis</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Suivez les étapes ci-dessous pour programmer votre envoi en toute simplicité.</p>
            </div>

            {/* Étapes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {etapesEnvoi.map((etape, index) => (
                    <div key={index} className="relative p-6 rounded-2xl bg-card border hover:border-african-yellow transition-colors group">
                        <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-african-yellow text-black flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform">
                            {etape.step}
                        </div>
                        <h3 className="font-heading text-lg font-bold mb-2 mt-2">{etape.title}</h3>
                        <p className="text-sm text-muted-foreground">{etape.description}</p>
                    </div>
                ))}
            </div>

            {/* Formulaire complet */}
            <Card className="border-none shadow-2xl overflow-hidden bg-card/80 backdrop-blur">
                <div className="h-2 w-full bg-gradient-to-r from-african-yellow to-african-earth" />
                <CardHeader className="bg-secondary/20 border-b">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Package className="h-6 w-6 text-african-yellow" />
                        Détails de l'expédition
                    </CardTitle>
                    <CardDescription>Tous les champs sont requis pour un traitement rapide.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleEnvoiSubmit} className="space-y-8">
                        {/* Type Selection */}
                        <div className="bg-secondary/30 p-4 rounded-xl">
                            <Label className="mb-3 block text-base font-semibold">Où envoyez-vous ?</Label>
                            <RadioGroup value={envoiForm.typeDestination} onValueChange={v => setEnvoiForm({ ...envoiForm, typeDestination: v })} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${envoiForm.typeDestination === 'national' ? 'border-african-yellow bg-african-yellow/5' : 'border-transparent bg-background hover:bg-secondary'}`}>
                                    <RadioGroupItem value="national" id="env-national" />
                                    <div className="flex items-center gap-2 font-medium">
                                        <Truck className="h-5 w-5 text-african-earth" /> National (Cameroun)
                                    </div>
                                </label>
                                <label className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${envoiForm.typeDestination === 'international' ? 'border-african-yellow bg-african-yellow/5' : 'border-transparent bg-background hover:bg-secondary'}`}>
                                    <RadioGroupItem value="international" id="env-international" />
                                    <div className="flex items-center gap-2 font-medium">
                                        <Plane className="h-5 w-5 text-blue-600" /> International
                                    </div>
                                </label>
                            </RadioGroup>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Expéditeur */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-african-earth font-bold text-lg border-b pb-2">
                                    <Send className="h-5 w-5" /> Expéditeur
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Nom complet</Label>
                                        <Input className="bg-secondary/20" placeholder="Votre nom" value={envoiForm.expediteurNom} onChange={e => setEnvoiForm({ ...envoiForm, expediteurNom: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Téléphone / WhatsApp</Label>
                                        <Input className="bg-secondary/20" placeholder="+237..." value={envoiForm.expediteurTelephone} onChange={e => setEnvoiForm({ ...envoiForm, expediteurTelephone: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Adresse de collecte</Label>
                                        <Input className="bg-secondary/20" placeholder="Où récupérer le colis ?" value={envoiForm.expediteurAdresse} onChange={e => setEnvoiForm({ ...envoiForm, expediteurAdresse: e.target.value })} required />
                                    </div>
                                </div>
                            </div>

                            {/* Destinataire */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-african-earth font-bold text-lg border-b pb-2">
                                    <MapPin className="h-5 w-5" /> Destinataire
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Nom complet</Label>
                                        <Input className="bg-secondary/20" placeholder="Nom du destinataire" value={envoiForm.destinataireNom} onChange={e => setEnvoiForm({ ...envoiForm, destinataireNom: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Téléphone</Label>
                                        <Input className="bg-secondary/20" placeholder="Numéro du destinataire" value={envoiForm.destinataireTelephone} onChange={e => setEnvoiForm({ ...envoiForm, destinataireTelephone: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {envoiForm.typeDestination === 'national' ? (
                                            <div className="space-y-1">
                                                <Label>Ville</Label>
                                                <Select onValueChange={v => setEnvoiForm({ ...envoiForm, destinataireVille: v })}>
                                                    <SelectTrigger className="bg-secondary/20"><SelectValue placeholder="Ville" /></SelectTrigger>
                                                    <SelectContent>
                                                        {villesCameroun.map(ville => <SelectItem key={ville} value={ville}>{ville}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <Label>Pays</Label>
                                                <Select onValueChange={v => setEnvoiForm({ ...envoiForm, destinatairePays: v })}>
                                                    <SelectTrigger className="bg-secondary/20"><SelectValue placeholder="Pays" /></SelectTrigger>
                                                    <SelectContent>
                                                        {paysInternational.map(pays => <SelectItem key={pays} value={pays}>{pays}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <Label>Adresse</Label>
                                            <Input className="bg-secondary/20" placeholder="Quartier/Rue" value={envoiForm.destinataireAdresse} onChange={e => setEnvoiForm({ ...envoiForm, destinataireAdresse: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label>Nature du colis</Label>
                                <Select onValueChange={v => setEnvoiForm({ ...envoiForm, typeColis: v })}>
                                    <SelectTrigger className="bg-secondary/20 h-11"><SelectValue placeholder="Sélectionner le type..." /></SelectTrigger>
                                    <SelectContent>
                                        {typesEnvoi.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Niveau d'urgence</Label>
                                <Select value={envoiForm.urgence} onValueChange={v => setEnvoiForm({ ...envoiForm, urgence: v })}>
                                    <SelectTrigger className="bg-secondary/20 h-11"><SelectValue placeholder="Urgence" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="express">⚡ Express (Prioritaire)</SelectItem>
                                        <SelectItem value="standard">🕒 Standard</SelectItem>
                                        <SelectItem value="economique">💰 Économique</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-african-yellow text-black hover:bg-white hover:text-black font-bold h-14 text-lg shadow-lg hover:shadow-xl transition-all" disabled={envoiLoading}>
                            {envoiLoading ? "Traitement..." : "Valider la demande d'envoi"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderDestinations = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-blue-600 hover:bg-blue-700">Réseau</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Nos Destinations</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Une couverture nationale complète et des connexions internationales.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* National */}
                <Card className="overflow-hidden border-2 border-green-100 hover:border-green-300 transition-colors shadow-lg">
                    <div className="bg-green-50 p-6 flex items-center justify-between border-b border-green-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg text-green-700">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-800">Cameroun</h3>
                                <p className="text-green-600 text-sm">Réseau national express</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">J+1 à J+3</Badge>
                    </div>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {destinationsNationales.map((ville, idx) => (
                                <Badge key={idx} variant="secondary" className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 uppercase tracking-wide text-xs border border-green-100">
                                    {ville}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* International */}
                <Card className="overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-colors shadow-lg">
                    <div className="bg-blue-50 p-6 flex items-center justify-between border-b border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                                <Plane className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-blue-800">International</h3>
                                <p className="text-blue-600 text-sm">Import / Export</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">J+5 à J+15</Badge>
                    </div>
                    <CardContent className="p-6 space-y-6">
                        {destinationsInternationales.map((zone, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> {zone.zone}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {zone.pays.map((pays, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                                            {pays}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="bg-african-yellow/10 rounded-2xl p-8 text-center borderBorder-african-yellow/20">
                <h4 className="font-heading text-xl font-bold mb-2">Une destination spécifique ?</h4>
                <p className="text-muted-foreground mb-6">Nous pouvons probablement livrer là où vous en avez besoin. Contactez-nous pour une étude personnalisée.</p>
                <Button variant="outline" className="border-african-earth text-african-earth hover:bg-african-earth hover:text-white" onClick={() => setActiveSection('contact')}>
                    Contacter le service client
                </Button>
            </div>
        </div>
    );

    const renderTarifs = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-green-600 hover:bg-green-700">Prix Transparents</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Tarifs & Délais</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Des solutions adaptées à toutes les urgences et tous les budgets.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {tarifs.map((tarif, index) => (
                    <Card key={index} className="relative group overflow-hidden border-2 hover:border-african-yellow transition-all duration-300">
                        <div className="absolute top-0 left-0 w-2 h-full bg-african-yellow group-hover:w-full group-hover:opacity-10 transition-all duration-300" />
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="bg-background">{tarif.type.split(' ')[0]}</Badge>
                                <div className="flex items-center text-sm font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {tarif.delai}
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">{tarif.type}</CardTitle>
                            <CardDescription className="text-base mt-2">{tarif.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-extrabold text-african-earth">{tarif.prix.replace('À partir de ', '')}</span>
                                <span className="text-sm text-muted-foreground font-normal">/ min</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">À partir de</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-african-earth text-white border-none shadow-xl max-w-4xl mx-auto">
                <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <h3 className="font-heading text-2xl font-bold mb-2">Gros volumes ou Expéditions régulières ?</h3>
                        <p className="text-white/80 max-w-md">Obtenez des tarifs préférentiels et un compte pro pour gérer vos envois business.</p>
                    </div>
                    <Button size="lg" className="bg-white text-african-earth hover:bg-african-yellow hover:text-black font-bold whitespace-nowrap" onClick={() => setActiveSection('entreprises')}>
                        Voir les offres Pro
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderEntreprises = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <Badge className="bg-purple-600 hover:bg-purple-700">Business</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Solutions Entreprises</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Logistique externalisée pour E-commerçants et Sociétés.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {ciblesPro.map((cible, idx) => (
                    <Card key={idx} className="group hover:border-african-yellow transition-colors text-center py-6 bg-card/50">
                        <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mb-4 group-hover:scale-110 transition-transform">
                            <cible.icon className="h-8 w-8" />
                        </div>
                        <h4 className="font-bold">{cible.nom}</h4>
                    </Card>
                ))}
            </div>

            <div className="bg-secondary/20 rounded-3xl p-8 md:p-12 max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold font-heading">Pourquoi passer Pro ?</h3>
                        <ul className="space-y-4">
                            {avantagesPro.map((av, i) => (
                                <li key={i} className="flex items-center gap-4 bg-background p-4 rounded-xl shadow-sm border">
                                    <div className="p-2 bg-african-yellow/20 rounded-lg text-african-earth">
                                        <av.icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium">{av.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Button size="lg" className="w-full bg-african-earth text-white hover:bg-black" onClick={() => setActiveSection('contact')}>
                            Devenir Partenaire
                        </Button>
                    </div>
                    <div className="relative h-[400px] bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl flex items-center justify-center text-white p-8 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0">
                            <img src={colisWarehouseImage} alt="Entrepôt logistique moderne" className="w-full h-full object-cover opacity-30" />
                        </div>
                        <div className="relative z-10 text-center">
                            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-80" />
                            <h4 className="text-2xl font-bold mb-2">Espace Pro</h4>
                            <p className="text-white/80">
                                "Depuis que nous utilisons Le Bon Petit pour nos livraisons e-commerce, notre taux de satisfaction client a augmenté de 40%."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in text-center">
            <div className="space-y-4">
                <Badge className="bg-gray-600">Qui sommes-nous</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Notre Mission</h2>
            </div>

            <div className="bg-card border-none shadow-2xl rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-red-500 to-yellow-500" />
                <CardContent className="p-10 md:p-16 space-y-8">
                    <Package className="h-20 w-20 mx-auto text-african-yellow mb-6 animate-pulse-glow" />
                    <blockquote className="text-2xl md:text-3xl font-light leading-relaxed font-heading italic text-gray-700">
                        "Connecter les familles, soutenir les entreprises et simplifier la vie quotidienne grâce à une logistique fiable et humaine."
                    </blockquote>
                    <div className="w-24 h-1 bg-african-earth/20 mx-auto rounded-full" />

                    <div className="grid md:grid-cols-3 gap-8 pt-4">
                        <div className="space-y-2">
                            <h5 className="font-bold text-lg">Camerounais</h5>
                            <p className="text-muted-foreground text-sm">Une entreprise locale qui connaît le terrain.</p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-lg">Digital</h5>
                            <p className="text-muted-foreground text-sm">Technologie moderne pour un suivi précis.</p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-lg">Humain</h5>
                            <p className="text-muted-foreground text-sm">Un service client toujours à l'écoute.</p>
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
            <h2 className="font-heading text-3xl font-bold mb-4">Blog & Actualités</h2>
            <p className="text-muted-foreground mb-8 text-lg">
                Nos conseils d'expédition, guides d'emballage et actualités logistiques sont en cours de rédaction.
            </p>
            <Badge variant="secondary" className="text-base px-6 py-2 bg-secondary text-secondary-foreground">
                🚀 Bientôt disponible
            </Badge>
        </div>
    );

    const renderContact = () => (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-12">
            <div className="text-center space-y-4">
                <Badge className="bg-african-earth">Support</Badge>
                <h2 className="font-heading text-4xl font-bold text-african-earth">Contactez-nous</h2>
                <p className="text-muted-foreground text-lg">Une question ? Une réclamation ? Nous sommes là pour vous.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-african-yellow/10 to-transparent border-african-yellow/20">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-lg shrink-0">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">WhatsApp Live</h3>
                                <p className="text-muted-foreground mb-3">Réponse instantanée 7j/7</p>
                                <a
                                    href="https://wa.me/237690000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#25D366] font-bold hover:underline flex items-center gap-1"
                                >
                                    Démarrer une conversation <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <Phone className="h-8 w-8 text-african-earth mb-4" />
                                <h4 className="font-bold mb-1">Téléphone</h4>
                                <p className="text-muted-foreground">+237 690 000 000</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <Mail className="h-8 w-8 text-african-earth mb-4" />
                                <h4 className="font-bold mb-1">Email</h4>
                                <p className="text-muted-foreground">colis@lebonpetit.cm</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-yellow hover:text-african-yellow"><Facebook /></Button>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-yellow hover:text-african-yellow"><Instagram /></Button>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2 hover:border-african-yellow hover:text-african-yellow"><Twitter /></Button>
                    </div>
                </div>

                <Card className="bg-card border-t-4 border-t-african-yellow shadow-xl">
                    <CardHeader>
                        <CardTitle>Envoyer un message</CardTitle>
                        <CardDescription>Nous vous répondrons par email sous 24h.</CardDescription>
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
                            <span className="font-heading text-2xl font-bold bg-gradient-to-r from-african-yellow to-african-earth bg-clip-text text-transparent">
                                Colis
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
                                        setActiveSection(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                                        ${activeSection === item.id
                                            ? 'bg-african-yellow text-black shadow-md'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-black' : ''}`} />
                                    {item.name}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 border-t bg-secondary/30">
                            <div className="bg-card rounded-xl p-4 shadow-sm border border-african-yellow/20">
                                <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Besoin d'aide ?</p>
                                <p className="font-bold text-african-earth">+237 690 000 000</p>
                                <p className="text-xs text-muted-foreground">Lun-Dim: 8h-20h</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b p-4 flex items-center justify-between">
                        <span className="font-heading text-xl font-bold">Service Colis</span>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                        {activeSection === 'accueil' && renderAccueil()}
                        {activeSection === 'envoyer' && renderEnvoyer()}
                        {activeSection === 'destinations' && renderDestinations()}
                        {activeSection === 'tarifs' && renderTarifs()}
                        {activeSection === 'entreprises' && renderEntreprises()}
                        {activeSection === 'apropos' && renderAPropos()}
                        {activeSection === 'blog' && renderBlog()}
                        {activeSection === 'contact' && renderContact()}
                    </div>
                </main>

                {/* Fixed WhatsApp Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <WhatsAppButton
                        phoneNumber="237690000000"
                        message="Bonjour, je souhaite envoyer un colis."
                    />
                </div>
            </div>
        </Layout>
    );
}
