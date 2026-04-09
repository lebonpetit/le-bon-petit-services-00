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
import { submitServiceRequest } from '@/lib/serviceRequest';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
    Home,
    Users,
    Sparkles,
    Building2,
    CreditCard,
    Info,
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
    FileText,
    Heart,
    Briefcase,
    Hotel,
    Wrench,
    ChefHat,
    Plug,
    Droplets,
    Snowflake,
    UserCheck,
    RefreshCw,
    Scale,
    HandHeart,
} from 'lucide-react';

// Images
import heroImage from '@/assets/services/nettoyage-hero.png';
import cuisiniereImage from '@/assets/services/gaz-cooking.png';
import menagereImage from '@/assets/services/pressing-ironing.png';

type Section = 'accueil' | 'services' | 'pourquoi' | 'pour-qui' | 'tarifs' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'services', name: 'Nos services', icon: Users },
    { id: 'pourquoi', name: 'Pourquoi nous choisir', icon: ShieldCheck },
    { id: 'pour-qui', name: 'Pour qui ?', icon: Heart },
    { id: 'tarifs', name: 'Tarifs & devis', icon: CreditCard },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Personnel vérifié et formé", icon: UserCheck },
    { text: "Sélection rigoureuse", icon: ShieldCheck },
    { text: "Suivi et remplacement garanti", icon: RefreshCw },
    { text: "Flexibilité (temps plein, partiel, ponctuel)", icon: Clock },
    { text: "Contrats clairs et sécurisés", icon: Scale },
];

const servicesAideDomicile = [
    {
        title: "Nounous & Baby-sitters",
        description: "Garde d'enfants bienveillante et expérimentée pour vos tout-petits",
        icon: HandHeart,
    },
    {
        title: "Ménagères & Techniciens de surface",
        description: "Nettoyage, rangement et entretien impeccable de votre domicile ou bureau",
        icon: Sparkles,
    },
    {
        title: "Gouvernantes",
        description: "Gestion complète de votre maison — organisation, supervision et intendance",
        icon: Users,
    },
    {
        title: "Cuisinières",
        description: "Préparation de repas à domicile — cuisine camerounaise et internationale",
        icon: ChefHat,
    },
];

const servicesPersonnelTechnique = [
    {
        title: "Électriciens",
        description: "Installation, dépannage et mise aux normes électriques",
        icon: Plug,
    },
    {
        title: "Frigoristes",
        description: "Entretien et réparation de climatiseurs, réfrigérateurs et systèmes de froid",
        icon: Snowflake,
    },
    {
        title: "Plombiers",
        description: "Réparation de fuites, installation sanitaire et débouchage",
        icon: Droplets,
    },
    {
        title: "Techniciens polyvalents",
        description: "Petits travaux, montage, réparations diverses et maintenance générale",
        icon: Wrench,
    },
];

const clientTypes = [
    { name: "Familles", emoji: "👨‍👩‍👧‍👦", description: "Personnel pour accompagner votre quotidien familial", gradient: "from-blue-500 to-indigo-500" },
    { name: "Particuliers", emoji: "🏠", description: "Aide à domicile adaptée à vos besoins personnels", gradient: "from-violet-500 to-purple-500" },
    { name: "Résidences", emoji: "🏢", description: "Personnel pour copropriétés et résidences", gradient: "from-african-green to-teal-500" },
    { name: "Hôtels & maisons d'hôtes", emoji: "🏨", description: "Équipes qualifiées pour l'hôtellerie", gradient: "from-african-yellow to-orange-500" },
    { name: "Entreprises", emoji: "🏢", description: "Maintenance légère et entretien de vos locaux", gradient: "from-african-red to-rose-500" },
];

const tarifs = [
    { service: "Aide à domicile (ponctuel)", prix: "à partir de 5 000 FCFA/jour", type: "fixed" },
    { service: "Aide à domicile (mensuel)", prix: "à partir de 50 000 FCFA/mois", type: "fixed" },
    { service: "Personnel technique", prix: "Sur devis", type: "quote" },
    { service: "Contrat entreprise / hôtel", prix: "Sur contrat", type: "contract" },
];

export default function Personnel() {
    const getInitialSection = (): Section => {
        const hash = window.location.hash.replace('#', '') as Section;
        return navigation.some(nav => nav.id === hash) ? hash : 'accueil';
    };

    const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

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
        email: '',
        typeService: '',
        typePersonnel: '',
        duree: '',
        description: '',
        localisation: '',
    });
    const [devisLoading, setDevisLoading] = useState(false);

    const [contactForm, setContactForm] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);

    const handleDevisSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (devisLoading) return;

        setDevisLoading(true);
        try {
            const { error } = await submitServiceRequest(
                'personnel',
                { ...devisForm, type: 'demande_personnel', source: 'page_personnel' },
                devisForm.nom,
                devisForm.telephone,
                user,
            );

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Nous vous contacterons sous 24h avec des profils adaptés.",
            });
            setDevisForm({
                nom: '', telephone: '', email: '', typeService: '', typePersonnel: '', duree: '', description: '', localisation: '',
            });
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

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contactLoading) return;

        setContactLoading(true);
        try {
            const { error } = await submitServiceRequest(
                'personnel',
                { ...contactForm, type: 'contact_personnel' },
                contactForm.nom,
                'N/A',
                user,
            );

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
            <section className="relative rounded-3xl overflow-hidden min-h-[600px] flex items-center shadow-2xl">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt="Personnel de maison africain professionnel"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-violet-800/80 to-transparent" />
                </div>

                <div className="relative z-20 px-8 py-20 md:py-28 text-white max-w-4xl mx-auto md:mx-0 md:ml-12 space-y-8 animate-slide-up text-left">
                    <Badge className="bg-white/20 text-white border-none py-2 px-4 backdrop-blur-md">
                        👥 Nounous • Ménagères • Techniciens
                    </Badge>
                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                        Vous cherchez une <span className="text-african-yellow">Nounou</span> ?<br />
                        Un <span className="text-african-yellow">Électricien</span> ?
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-xl leading-relaxed font-light">
                        Nous mettons à votre disposition : gouvernantes, nounous, ménagères, techniciens de surface, électriciens, frigoristes...
                        <br /><br />
                        <span className="font-semibold text-white">Disponible à l'heure, à la journée ou au mois.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-start">
                        <Button
                            size="lg"
                            className="bg-african-yellow text-black hover:bg-white font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:shadow-xl transition-all duration-300"
                            onClick={() => {
                                navigateToSection('tarifs');
                                setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
                            }}
                        >
                            <Users className="mr-2 h-5 w-5" />
                            Trouver mon personnel
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white/10 font-semibold h-14 px-8 rounded-full"
                            onClick={() => navigateToSection('services')}
                        >
                            <Info className="mr-2 h-5 w-5" />
                            Voir les profils
                        </Button>
                    </div>
                </div>
            </section>

            {/* Notre mission */}
            <section className="bg-white dark:bg-card rounded-3xl p-10 shadow-xl border border-border/50">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-1 w-12 bg-violet-600 rounded-full" />
                    <Users className="h-8 w-8 text-violet-600" />
                    <div className="h-1 w-12 bg-violet-600 rounded-full" />
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center text-violet-600">
                    Notre mission
                </h2>
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Nous simplifions la recherche de personnel qualifié pour vos besoins domestiques et techniques. Chaque candidat est soigneusement sélectionné, formé et suivi pour vous garantir un service fiable et de qualité.
                    </p>
                </div>
            </section>

            {/* Pourquoi nous faire confiance */}
            <section>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10 text-center">
                    Pourquoi nous <span className="text-violet-600">faire confiance</span> ?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {avantages.map((item, index) => (
                        <Card key={index} className="group text-center hover:-translate-y-2 transition-all duration-300 border shadow-soft hover:shadow-xl bg-card">
                            <CardContent className="p-6">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-600/10 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                                    <item.icon className="h-8 w-8 text-violet-600 group-hover:text-white transition-colors" />
                                </div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-violet-600 transition-colors text-sm">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Formules / Modes d'intervention */}
            <section className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-3xl p-10 border border-violet-100 dark:border-violet-800">
                <div className="text-center mb-10">
                    <h2 className="font-heading text-3xl font-bold mb-4">À chacun sa formule</h2>
                    <p className="text-muted-foreground text-lg">Choisissez le mode d'intervention qui vous convient</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="border-2 border-transparent hover:border-violet-500 transition-all shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4 text-violet-600">
                                <Clock className="h-6 w-6" />
                            </div>
                            <CardTitle>À l'heure ou à la journée</CardTitle>
                            <CardDescription>Pour des besoins ponctuels ou urgents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Idéal pour un grand nettoyage</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Dépannage garde d'enfants</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Réparations techniques</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Remplacement temporaire</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-2 border-transparent hover:border-indigo-500 transition-all shadow-lg">
                        <CardHeader>
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <CardTitle>Au mois (Abonnement)</CardTitle>
                            <CardDescription>Pour une tranquillité d'esprit au quotidien</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Personnel de maison stable</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Nounou à temps plein</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Gestion continue de résidence</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tarifs préférentiels</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-14 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-violet-600 text-white mb-4">Nos Profils</Badge>
                <h2 className="font-heading text-4xl font-bold mb-4">Nos <span className="text-violet-600">Services</span></h2>
                <p className="text-muted-foreground text-lg">Du personnel qualifié pour tous vos besoins domestiques et techniques</p>
            </div>

            {/* Visual Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl group">
                    <img src={menagereImage} alt="Ménagère africaine" className="rounded-3xl w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <p className="text-white font-bold text-xl">Ménage & Entretien</p>
                    </div>
                </div>
                <div className="relative rounded-3xl overflow-hidden h-64 shadow-xl group">
                    <img src={cuisiniereImage} alt="Cuisinière africaine" className="rounded-3xl w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <p className="text-white font-bold text-xl">Cuisine Camerounaise & Internationale</p>
                    </div>
                </div>
            </div>

            {/* Aide à domicile */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
                        <HandHeart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold">🧹 Aide à domicile</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {servicesAideDomicile.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                                <div className="h-1 bg-violet-600 w-0 group-hover:w-full transition-all duration-500" />
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600 group-hover:scale-110 transition-all duration-300">
                                            <Icon className="h-7 w-7 text-violet-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-violet-600 transition-colors">{service.title}</h4>
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Personnel technique */}
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                        <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold">🔧 Personnel technique</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {servicesPersonnelTechnique.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                                <div className="h-1 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500" />
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
                                            <Icon className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-indigo-600 transition-colors">{service.title}</h4>
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-14 px-10 rounded-xl shadow-lg" onClick={() => navigateToSection('tarifs')}>
                    Voir tous les profils disponibles
                </Button>
            </div>
        </div>
    );

    const renderPourquoi = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-violet-600 text-white mb-4">Nos Engagements</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-violet-600">Pourquoi nous choisir ?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Nous nous engageons à vous fournir un service irréprochable, de la sélection à la mise en poste.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "Personnel vérifié et formé", description: "Chaque candidat passe un processus de vérification rigoureux incluant vérification d'identité, références et tests de compétences.", icon: UserCheck, color: "violet" },
                    { title: "Sélection rigoureuse", description: "Entretiens approfondis, évaluation des compétences techniques et comportementales, vérification des antécédents.", icon: ShieldCheck, color: "indigo" },
                    { title: "Suivi et remplacement garanti", description: "Un suivi régulier est assuré. En cas d'insatisfaction, nous proposons un remplacement rapide et sans frais.", icon: RefreshCw, color: "violet" },
                    { title: "Flexibilité totale", description: "Temps plein, temps partiel ou ponctuel — nous adaptons notre offre à votre rythme de vie et vos besoins.", icon: Clock, color: "indigo" },
                    { title: "Contrats clairs et sécurisés", description: "Des contrats transparents qui protègent à la fois l'employeur et le personnel. Pas de surprise, pas d'ambiguïté.", icon: Scale, color: "violet" },
                    { title: "Accompagnement personnalisé", description: "Un conseiller dédié vous accompagne de la définition de vos besoins à la mise en poste de votre personnel.", icon: HandHeart, color: "indigo" },
                ].map((item, index) => {
                    const Icon = item.icon;
                    const colorClass = item.color === 'violet' ? 'violet-600' : 'indigo-600';
                    return (
                        <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-none shadow-lg bg-white dark:bg-card overflow-hidden">
                            <div className={`h-1 bg-${colorClass} w-0 group-hover:w-full transition-all duration-500`} />
                            <CardContent className="p-6">
                                <div className={`w-14 h-14 rounded-2xl bg-${colorClass}/10 flex items-center justify-center mb-4 group-hover:bg-${colorClass} group-hover:scale-110 transition-all duration-300`}>
                                    <Icon className={`h-7 w-7 text-${colorClass} group-hover:text-white transition-colors`} />
                                </div>
                                <h4 className={`font-bold text-lg mb-2 group-hover:text-${colorClass} transition-colors`}>{item.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="text-center">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-14 px-10 rounded-xl shadow-lg" onClick={() => navigateToSection('tarifs')}>
                    Demander un agent maintenant
                </Button>
            </div>
        </div>
    );

    const renderPourQui = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center">
                <Badge className="bg-violet-600 text-white mb-4">Nos Clients</Badge>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Pour <span className="text-violet-600">qui</span> ?</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Notre service s'adresse à tous ceux qui ont besoin de personnel de confiance
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientTypes.map((client, index) => (
                    <div
                        key={index}
                        className="group relative p-8 rounded-2xl bg-card border border-border hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${client.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        <div className="relative z-10 text-center">
                            <div className="text-5xl mb-4 group-hover:animate-bounce">{client.emoji}</div>
                            <h4 className="font-heading font-bold text-xl text-foreground mb-2">{client.name}</h4>
                            <p className="text-muted-foreground text-sm">{client.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA final */}
            <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 border-none shadow-2xl overflow-hidden">
                <CardContent className="p-10 md:p-14 text-white text-center">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 flex items-center justify-center mb-6">
                        <HandHeart className="h-10 w-10" />
                    </div>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                        Confiez votre maison à des professionnels de confiance.
                    </h3>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                        Qu'il s'agisse de ménage, de cuisine, de plomberie ou d'électricité — nous avons le profil qu'il vous faut.
                    </p>
                    <Button
                        size="lg"
                        className="bg-african-yellow text-black hover:bg-white font-bold h-14 px-10 rounded-full shadow-lg"
                        onClick={() => navigateToSection('tarifs')}
                    >
                        Recruter maintenant
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderTarifs = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-violet-600">Tarifs & Devis</h2>
                <p className="text-muted-foreground text-lg">Tarification transparente et devis gratuit sous 24h</p>
            </div>

            {/* Grille des tarifs */}
            <div className="grid md:grid-cols-2 gap-6">
                {tarifs.map((item, index) => (
                    <Card key={index} className={`relative overflow-hidden ${item.type === 'fixed' ? 'border-violet-600 shadow-violet-100 shadow-xl' : 'border-indigo-600 shadow-indigo-100 shadow-xl'} border-2 bg-card`}>
                        <div className={`absolute top-0 left-0 w-full h-2 ${item.type === 'fixed' ? 'bg-violet-600' : 'bg-indigo-600'}`} />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-heading text-xl font-bold">{item.service}</h3>
                                <Badge variant="secondary" className={`text-lg px-4 py-2 dark:text-white ${item.type === 'fixed' ? 'bg-violet-600/10 text-violet-600' : 'bg-indigo-600/10 text-indigo-600'}`}>
                                    {item.prix}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Note */}
            <Card className="bg-violet-600/10 border-2 border-violet-600/20">
                <CardContent className="p-10 text-center">
                    <Zap className="h-14 w-14 mx-auto text-violet-600 mb-4" />
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-3">Devis gratuit sous 24h</h3>
                    <p className="text-muted-foreground text-lg">Remplissez le formulaire ci-dessous et recevez des profils adaptés rapidement</p>
                </CardContent>
            </Card>

            {/* Formulaire de devis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-heading text-2xl text-violet-600 flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6" />
                        Demande de personnel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleDevisSubmit} className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom complet</Label>
                            <Input id="nom" value={devisForm.nom} onChange={e => setDevisForm({ ...devisForm, nom: e.target.value })} placeholder="Votre nom" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone / WhatsApp</Label>
                            <PhoneInput value={devisForm.telephone} onValueChange={(v) => setDevisForm({ ...devisForm, telephone: v || '' })} defaultCountryCode="+237" placeholder="6XX XX XX XX" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (optionnel)</Label>
                            <Input id="email" type="email" value={devisForm.email} onChange={e => setDevisForm({ ...devisForm, email: e.target.value })} placeholder="votre@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type de service</Label>
                            <Select value={devisForm.typeService} onValueChange={v => setDevisForm({ ...devisForm, typeService: v })}>
                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aide_domicile">Aide à domicile</SelectItem>
                                    <SelectItem value="personnel_technique">Personnel technique</SelectItem>
                                    <SelectItem value="les_deux">Les deux</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type de personnel</Label>
                            <Select value={devisForm.typePersonnel} onValueChange={v => setDevisForm({ ...devisForm, typePersonnel: v })}>
                                <SelectTrigger><SelectValue placeholder="Quel profil ?" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nounou">Nounou / Baby-sitter</SelectItem>
                                    <SelectItem value="menagere">Ménagère</SelectItem>
                                    <SelectItem value="technicien_surface">Technicien de surface</SelectItem>
                                    <SelectItem value="gouvernante">Gouvernante</SelectItem>
                                    <SelectItem value="cuisiniere">Cuisinière</SelectItem>
                                    <SelectItem value="electricien">Électricien</SelectItem>
                                    <SelectItem value="frigoriste">Frigoriste</SelectItem>
                                    <SelectItem value="plombier">Plombier</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Durée souhaitée</Label>
                            <Select value={devisForm.duree} onValueChange={v => setDevisForm({ ...devisForm, duree: v })}>
                                <SelectTrigger><SelectValue placeholder="Quelle durée ?" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ponctuel">Ponctuel (quelques jours)</SelectItem>
                                    <SelectItem value="temps_partiel">Temps partiel</SelectItem>
                                    <SelectItem value="temps_plein">Temps plein</SelectItem>
                                    <SelectItem value="contrat">Contrat longue durée</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Localisation</Label>
                            <Input value={devisForm.localisation} onChange={e => setDevisForm({ ...devisForm, localisation: e.target.value })} placeholder="Quartier, ville..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description de vos besoins</Label>
                            <Textarea className="min-h-[120px]" value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} placeholder="Décrivez vos besoins : nombre de pièces, tâches attendues, horaires souhaités..." />
                        </div>
                        <div className="md:col-span-2">
                            <Button type="submit" size="lg" className="w-full bg-violet-600 hover:bg-violet-700 text-white h-14 font-bold" disabled={devisLoading}>
                                {devisLoading ? "Envoi en cours..." : "Envoyer ma demande"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-violet-600">Contactez-nous</h2>
                <p className="text-muted-foreground text-lg">Une question ? Besoin d'un renseignement ? Nous sommes là pour vous.</p>
            </div>

            {/* Info cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                        <div className="w-14 h-14 mx-auto rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
                            <Phone className="h-7 w-7 text-violet-600" />
                        </div>
                        <h4 className="font-bold mb-2">Téléphone</h4>
                        <p className="text-muted-foreground text-sm">+237 690 547 084</p>
                    </CardContent>
                </Card>
                <Card className="text-center hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                        <div className="w-14 h-14 mx-auto rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
                            <MessageCircle className="h-7 w-7 text-violet-600" />
                        </div>
                        <h4 className="font-bold mb-2">WhatsApp</h4>
                        <p className="text-muted-foreground text-sm">+237 690 547 084</p>
                    </CardContent>
                </Card>
                <Card className="text-center hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                        <div className="w-14 h-14 mx-auto rounded-full bg-violet-600/10 flex items-center justify-center mb-4">
                            <Mail className="h-7 w-7 text-violet-600" />
                        </div>
                        <h4 className="font-bold mb-2">Email</h4>
                        <p className="text-muted-foreground text-sm">contact@lebonpetit.com</p>
                    </CardContent>
                </Card>
            </div>

            {/* Social */}
            <div className="flex items-center justify-center gap-6">
                <a href="#" className="w-12 h-12 rounded-full bg-violet-600/10 flex items-center justify-center hover:bg-violet-600 hover:text-white text-violet-600 transition-all">
                    <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-violet-600/10 flex items-center justify-center hover:bg-violet-600 hover:text-white text-violet-600 transition-all">
                    <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-violet-600/10 flex items-center justify-center hover:bg-violet-600 hover:text-white text-violet-600 transition-all">
                    <Twitter className="h-5 w-5" />
                </a>
            </div>

            {/* Contact Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-heading text-2xl text-violet-600 flex items-center justify-center gap-2">
                        <Mail className="h-6 w-6" />
                        Envoyez-nous un message
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleContactSubmit} className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nom complet</Label>
                            <Input value={contactForm.nom} onChange={e => setContactForm({ ...contactForm, nom: e.target.value })} placeholder="Votre nom" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="votre@email.com" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Sujet</Label>
                            <Input value={contactForm.sujet} onChange={e => setContactForm({ ...contactForm, sujet: e.target.value })} placeholder="Objet de votre message" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Message</Label>
                            <Textarea className="min-h-[150px]" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} placeholder="Votre message..." required />
                        </div>
                        <div className="md:col-span-2">
                            <Button type="submit" size="lg" className="w-full bg-violet-600 hover:bg-violet-700 text-white h-14 font-bold" disabled={contactLoading}>
                                {contactLoading ? "Envoi en cours..." : "Envoyer le message"}
                            </Button>
                        </div>
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
                        <h2 className="font-heading text-xl font-bold text-violet-600 flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            Personnel
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Aide à Domicile</p>
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
                                            ? 'bg-violet-600 text-white shadow-md font-medium'
                                            : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }
                                    `}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                    <span className="text-sm">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="bg-violet-600/10 p-4 rounded-lg">
                            <p className="font-bold text-violet-600 text-sm mb-1">Besoin d'un agent ?</p>
                            <p className="text-xs text-muted-foreground mb-3">Demandez maintenant par WhatsApp.</p>
                            <Button size="sm" variant="outline" className="w-full text-xs border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white" onClick={() => navigateToSection('tarifs')}>
                                Demander un agent
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-secondary/10">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-violet-600" />
                            <span className="font-heading font-bold text-lg">Personnel</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeSection === 'accueil' && renderAccueil()}
                            {activeSection === 'services' && renderServices()}
                            {activeSection === 'pourquoi' && renderPourquoi()}
                            {activeSection === 'pour-qui' && renderPourQui()}
                            {activeSection === 'tarifs' && renderTarifs()}
                            {activeSection === 'contact' && renderContact()}
                        </div>
                    </div>
                </main>
            </div>

            <WhatsAppButton
                phoneNumber="+237690547084"
                message="Bonjour, je souhaite obtenir des informations sur le service de personnel à domicile."
            />
        </Layout>
    );
}
