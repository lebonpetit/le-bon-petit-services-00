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
    Sparkles,
    Users,
    Building2,
    Calendar,
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
    Car,
    Bed,
    Bug,
    Flame,
    Droplets,
    Brush,
    Hotel,
    GraduationCap,
    ShoppingCart,
    UtensilsCrossed,
    Music,
    PartyPopper,
    Heart,
    Briefcase,
    FileText
} from 'lucide-react';

// Import images
import nettoyageImage from '@/assets/services/nettoyage.png';

type Section = 'accueil' | 'services' | 'particuliers' | 'professionnels' | 'evenementiel' | 'tarifs' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'services', name: 'Nos services', icon: Sparkles },
    { id: 'particuliers', name: 'Particuliers', icon: Users },
    { id: 'professionnels', name: 'Professionnels & établissements', icon: Building2 },
    { id: 'evenementiel', name: 'Événementiel & espaces ouverts', icon: Calendar },
    { id: 'tarifs', name: 'Tarifs & devis', icon: CreditCard },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const avantages = [
    { text: "Personnel qualifié", icon: Users },
    { text: "Matériel professionnel", icon: Sparkles },
    { text: "Produits homologués", icon: ShieldCheck },
    { text: "Respect des normes d'hygiène", icon: CheckCircle2 },
    { text: "Interventions rapides", icon: Zap },
    { text: "Respect des délais", icon: Clock },
    { text: "Résultats visibles et durables", icon: Award },
];

const servicesNettoyage = [
    {
        title: "Nettoyage de domiciles",
        description: "Appartements & maisons - Nettoyage général ou approfondi",
        icon: Home
    },
    {
        title: "Nettoyage de bureaux",
        description: "Entretien quotidien - Désinfection des postes de travail",
        icon: Building2
    },
    {
        title: "Nettoyage de canapés & chaises",
        description: "Tissu, cuir, similicuir - Traitement anti-taches",
        icon: Sofa
    },
    {
        title: "Entretien du cuir",
        description: "Nettoyage, nourrissage, protection",
        icon: Brush
    },
    {
        title: "Nettoyage de tapis & moquettes",
        description: "Aspiration & lavage profond",
        icon: Droplets
    },
    {
        title: "Nettoyage de matelas",
        description: "Anti-acariens - Désinfection antibactérienne",
        icon: Bed
    },
    {
        title: "Nettoyage de véhicules",
        description: "Intérieur & extérieur - Désinfection habitacle",
        icon: Car
    },
    {
        title: "Nettoyage d'espaces ouverts",
        description: "Cours, parkings, espaces publics, terrasses",
        icon: MapPin
    },
    {
        title: "Nettoyage avant & après événement",
        description: "Préparation des sites - Remise en état post-événement",
        icon: Calendar
    },
];

const servicesAntiparasitaires = [
    {
        title: "Dératisation",
        description: "Rats & souris - Prévention durable",
        icon: Bug
    },
    {
        title: "Désinsectisation",
        description: "Cafards, moustiques, fourmis",
        icon: Bug
    },
    {
        title: "Fumigation",
        description: "Espaces sensibles - Traitement intensif",
        icon: Flame
    },
    {
        title: "Désinfection",
        description: "Locaux professionnels, établissements publics, véhicules",
        icon: ShieldCheck
    },
];

const etablissementsDesservis = [
    { name: "Restaurants & snacks", icon: UtensilsCrossed },
    { name: "Boîtes de nuit", icon: Music },
    { name: "Hôtels & auberges", icon: Hotel },
    { name: "Hôpitaux & cliniques", icon: Heart },
    { name: "Écoles & universités", icon: GraduationCap },
    { name: "Supermarchés & grandes surfaces", icon: ShoppingCart },
    { name: "Bureaux & entreprises", icon: Briefcase },
];

const servicesPro = [
    "Nettoyage quotidien",
    "Désinfection",
    "Traitement anti-nuisibles",
    "Entretien sols & surfaces",
    "Interventions nocturnes possibles",
];

const typesEvenements = [
    { name: "Mariages", icon: Heart },
    { name: "Concerts", icon: Music },
    { name: "Foires", icon: ShoppingCart },
    { name: "Séminaires", icon: Briefcase },
    { name: "Soirées privées", icon: PartyPopper },
    { name: "Événements d'entreprise", icon: Building2 },
];

const tarifs = [
    { service: "Domiciles", prix: "à partir de 15 000 FCFA", type: "fixed" },
    { service: "Canapés / matelas", prix: "à partir de 8 000 FCFA", type: "fixed" },
    { service: "Bureaux & établissements", prix: "Sur contrat", type: "contract" },
    { service: "Événementiel & grands espaces", prix: "Sur devis", type: "quote" },
];

export default function Nettoyage() {
    const [activeSection, setActiveSection] = useState<Section>('accueil');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    // Form states
    const [devisForm, setDevisForm] = useState({
        nom: '',
        telephone: '',
        email: '',
        typeService: '',
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
            const { error } = await supabase.from('requests').insert({
                service_type: 'nettoyage',
                payload: { ...devisForm, type: 'demande_devis' },
                contact_name: devisForm.nom,
                contact_phone: devisForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Nous vous enverrons un devis sous 24h.",
            });
            setDevisForm({ nom: '', telephone: '', email: '', typeService: '', description: '', localisation: '' });
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
            const { error } = await supabase.from('requests').insert({
                service_type: 'nettoyage',
                payload: { ...contactForm, type: 'contact_nettoyage' },
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
                    <img src={nettoyageImage} alt="Service de nettoyage" className="w-full h-full object-cover opacity-20" />
                </div>
                <div className="relative z-10 px-6 py-16 md:py-24 text-center text-white">
                    <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                        La propreté qui protège votre image et votre santé.
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                        Solutions professionnelles de nettoyage, désinfection et salubrité pour domiciles, entreprises, établissements recevant du public et événements.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-african-green hover:bg-white/90 font-semibold"
                            onClick={() => {
                                setActiveSection('tarifs');
                                setTimeout(() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }, 100);
                            }}
                        >
                            🔘 Demander un devis
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => setActiveSection('contact')}
                        >
                            🔘 Intervention rapide
                        </Button>
                    </div>
                </div>
            </section>

            {/* Notre expertise */}
            <section className="bg-secondary/50 rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-center text-african-green">
                    Notre expertise
                </h2>
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <p className="text-muted-foreground text-lg">
                        Nous accompagnons particuliers, entreprises et établissements professionnels avec des solutions de nettoyage, d'hygiène et de désinfection conformes aux exigences sanitaires et aux normes de qualité.
                    </p>
                </div>
            </section>

            {/* Pourquoi nous faire confiance */}
            <section>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
                    Pourquoi nous faire confiance ?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {avantages.map((item, index) => (
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

            {/* CTA Section */}
            <section className="text-center bg-gradient-to-r from-african-green/10 to-african-earth/10 rounded-2xl p-8">
                <h3 className="font-heading text-xl md:text-2xl font-bold mb-4">Besoin d'un devis gratuit ?</h3>
                <p className="text-muted-foreground mb-6">Recevez votre devis sous 24h</p>
                <Button size="lg" variant="cta" className="bg-african-green hover:bg-african-green/90" onClick={() => setActiveSection('tarifs')}>
                    Demander un devis gratuit
                </Button>
            </section>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-african-green">Nos Services</h2>
                <p className="text-muted-foreground text-lg">Des solutions complètes pour tous vos besoins de nettoyage et d'hygiène</p>
            </div>

            {/* Services de Nettoyage */}
            <div>
                <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-african-green" />
                    Services de Nettoyage
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesNettoyage.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-african-green">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-african-green/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-african-green" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">{service.title}</h4>
                                            <p className="text-sm text-muted-foreground">{service.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Services Antiparasitaires */}
            <div>
                <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                    <Bug className="h-6 w-6 text-african-earth" />
                    Traitement Antiparasitaire
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {servicesAntiparasitaires.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-african-earth">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-african-earth/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-african-earth" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg mb-1">{service.title}</h4>
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
                <Button size="lg" variant="cta" className="bg-african-green hover:bg-african-green/90" onClick={() => setActiveSection('tarifs')}>
                    Demander un devis
                </Button>
            </div>
        </div>
    );

    const renderParticuliers = () => (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-african-green">Espace Particuliers</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Des services de nettoyage professionnels pour votre maison et vos biens personnels
                </p>
            </div>

            {/* Image hero */}
            <Card className="overflow-hidden">
                <div className="relative h-64 md:h-80">
                    <img src={nettoyageImage} alt="Nettoyage à domicile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-6 text-white">
                            <h3 className="font-heading text-2xl font-bold mb-2">Votre maison mérite le meilleur</h3>
                            <p className="opacity-90">Nettoyage professionnel adapté à vos besoins</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Services pour particuliers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesNettoyage.slice(0, 6).map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <Card key={index} className="hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto rounded-full bg-african-green/10 flex items-center justify-center mb-4 group-hover:bg-african-green group-hover:text-white transition-colors">
                                    <Icon className="h-8 w-8 text-african-green group-hover:text-white" />
                                </div>
                                <h4 className="font-semibold text-lg mb-2">{service.title}</h4>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tarifs indicatifs */}
            <Card className="bg-african-green/5 border-african-green/20">
                <CardHeader>
                    <CardTitle className="text-center text-african-green">Tarifs indicatifs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-4 bg-background rounded-lg">
                            <span className="font-medium">Domiciles</span>
                            <Badge variant="secondary" className="text-african-green">à partir de 15 000 FCFA</Badge>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-background rounded-lg">
                            <span className="font-medium">Canapés / matelas</span>
                            <Badge variant="secondary" className="text-african-green">à partir de 8 000 FCFA</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center">
                <Button size="lg" variant="cta" className="bg-african-green hover:bg-african-green/90" onClick={() => setActiveSection('tarifs')}>
                    Demander un devis gratuit
                </Button>
            </div>
        </div>
    );

    const renderProfessionnels = () => (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-african-green">
                    Professionnels & Établissements
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Des environnements propres pour des activités en toute sérénité
                </p>
            </div>

            {/* Établissements desservis */}
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-center">Établissements desservis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {etablissementsDesservis.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <Icon className="h-5 w-5 text-african-green flex-shrink-0" />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Services adaptés */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-african-green">Services adaptés</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {servicesPro.map((service, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg hover:border-african-green hover:bg-african-green/5 transition-colors">
                                <CheckCircle2 className="h-5 w-5 text-african-green flex-shrink-0" />
                                <span className="font-medium">{service}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Avantages Pro */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-african-green/5 border-none hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-6">
                        <ShieldCheck className="h-10 w-10 mx-auto text-african-green mb-4" />
                        <h4 className="font-semibold">Normes respectées</h4>
                        <p className="text-sm text-muted-foreground">Conformité aux standards d'hygiène</p>
                    </CardContent>
                </Card>
                <Card className="bg-african-green/5 border-none hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-6">
                        <Clock className="h-10 w-10 mx-auto text-african-green mb-4" />
                        <h4 className="font-semibold">Horaires flexibles</h4>
                        <p className="text-sm text-muted-foreground">Interventions nocturnes possibles</p>
                    </CardContent>
                </Card>
                <Card className="bg-african-green/5 border-none hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-6">
                        <FileText className="h-10 w-10 mx-auto text-african-green mb-4" />
                        <h4 className="font-semibold">Contrats personnalisés</h4>
                        <p className="text-sm text-muted-foreground">Adaptés à vos besoins</p>
                    </CardContent>
                </Card>
                <Card className="bg-african-green/5 border-none hover:shadow-lg transition-shadow text-center">
                    <CardContent className="p-6">
                        <Award className="h-10 w-10 mx-auto text-african-green mb-4" />
                        <h4 className="font-semibold">Qualité garantie</h4>
                        <p className="text-sm text-muted-foreground">Résultats durables</p>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center">
                <Button size="lg" variant="cta" className="bg-african-green hover:bg-african-green/90" onClick={() => setActiveSection('contact')}>
                    Demander un devis entreprise
                </Button>
            </div>
        </div>
    );

    const renderEvenementiel = () => (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-african-green">
                    Événementiel & Espaces Ouverts
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Avant l'événement : propre. Après l'événement : impeccable.
                </p>
            </div>

            {/* Image hero */}
            <Card className="overflow-hidden bg-gradient-to-r from-african-green/90 to-african-earth">
                <CardContent className="p-8 md:p-12 text-white text-center">
                    <PartyPopper className="h-16 w-16 mx-auto mb-6 opacity-80" />
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                        Vos événements méritent un cadre impeccable
                    </h3>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        Nous préparons et remettons en état vos espaces événementiels pour que vous puissiez vous concentrer sur l'essentiel.
                    </p>
                </CardContent>
            </Card>

            {/* Types d'événements */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Types d'interventions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {typesEvenements.map((event, idx) => {
                            const Icon = event.icon;
                            return (
                                <div key={idx} className="text-center p-6 rounded-xl bg-secondary/50 hover:bg-african-green/10 transition-colors">
                                    <Icon className="h-10 w-10 mx-auto text-african-green mb-3" />
                                    <h4 className="font-semibold">{event.name}</h4>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Services */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-african-green">
                    <CardHeader>
                        <Badge className="w-fit mb-2 bg-african-green">Avant l'événement</Badge>
                        <CardTitle>Préparation des sites</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-green" />
                                Nettoyage complet des espaces
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-green" />
                                Désinfection des surfaces
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-green" />
                                Mise en condition des locaux
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-2 border-african-earth">
                    <CardHeader>
                        <Badge className="w-fit mb-2 bg-african-earth">Après l'événement</Badge>
                        <CardTitle>Remise en état</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-earth" />
                                Nettoyage post-événement
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-earth" />
                                Évacuation des déchets
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-african-earth" />
                                Remise à neuf des espaces
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center">
                <Button size="lg" variant="cta" className="bg-african-green hover:bg-african-green/90" onClick={() => setActiveSection('tarifs')}>
                    Demander un devis événementiel
                </Button>
            </div>
        </div>
    );

    const renderTarifs = () => (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="font-heading text-3xl font-bold mb-4 text-african-green">Tarifs & Devis</h2>
                <p className="text-muted-foreground text-lg">Tarification transparente et devis gratuit sous 24h</p>
            </div>

            {/* Grille des tarifs */}
            <div className="grid md:grid-cols-2 gap-6">
                {tarifs.map((item, index) => (
                    <Card key={index} className={`relative overflow-hidden ${item.type === 'fixed' ? 'border-african-green' : 'border-african-earth'} border-2`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${item.type === 'fixed' ? 'bg-african-green' : 'bg-african-earth'}`} />
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-heading text-xl font-bold">{item.service}</h3>
                                <Badge variant="secondary" className={`text-lg px-4 py-2 ${item.type === 'fixed' ? 'bg-african-green/10 text-african-green' : 'bg-african-earth/10 text-african-earth'}`}>
                                    {item.prix}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Note devis gratuit */}
            <Card className="bg-gradient-to-r from-african-green/10 to-african-earth/10 border-none">
                <CardContent className="p-8 text-center">
                    <Zap className="h-12 w-12 mx-auto text-african-green mb-4" />
                    <h3 className="font-heading text-2xl font-bold mb-2">👉 Devis gratuit sous 24h</h3>
                    <p className="text-muted-foreground">Remplissez le formulaire ci-dessous et recevez votre estimation rapidement</p>
                </CardContent>
            </Card>

            {/* Formulaire de devis */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center font-heading text-2xl text-african-green flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6" />
                        Demande de devis
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
                            <Input id="telephone" value={devisForm.telephone} onChange={e => setDevisForm({ ...devisForm, telephone: e.target.value })} placeholder="+237..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (optionnel)</Label>
                            <Input id="email" type="email" value={devisForm.email} onChange={e => setDevisForm({ ...devisForm, email: e.target.value })} placeholder="votre@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type de service</Label>
                            <Select onValueChange={v => setDevisForm({ ...devisForm, typeService: v })}>
                                <SelectTrigger><SelectValue placeholder="Choisir un service..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="domicile">Nettoyage de domicile</SelectItem>
                                    <SelectItem value="bureau">Nettoyage de bureau</SelectItem>
                                    <SelectItem value="canape">Canapés & chaises</SelectItem>
                                    <SelectItem value="matelas">Matelas</SelectItem>
                                    <SelectItem value="vehicule">Véhicule</SelectItem>
                                    <SelectItem value="tapis">Tapis & moquettes</SelectItem>
                                    <SelectItem value="evenement">Événementiel</SelectItem>
                                    <SelectItem value="deratisation">Dératisation</SelectItem>
                                    <SelectItem value="desinsectisation">Désinsectisation</SelectItem>
                                    <SelectItem value="fumigation">Fumigation</SelectItem>
                                    <SelectItem value="desinfection">Désinfection</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="localisation">Localisation</Label>
                            <Input id="localisation" value={devisForm.localisation} onChange={e => setDevisForm({ ...devisForm, localisation: e.target.value })} placeholder="Quartier, ville..." required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description du besoin</Label>
                            <Textarea id="description" value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} placeholder="Décrivez votre besoin (surface, urgence, détails...)..." rows={4} />
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <Button type="submit" variant="cta" className="w-full bg-african-green hover:bg-african-green/90" disabled={devisLoading}>
                                {devisLoading ? "Envoi..." : "Demander un devis gratuit"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-heading text-3xl font-bold mb-6">À Propos</h2>
            <Card className="bg-gradient-to-b from-transparent to-secondary/30">
                <CardContent className="p-10 space-y-6">
                    <Sparkles className="h-16 w-16 mx-auto text-african-green mb-4" />
                    <p className="text-2xl font-light leading-relaxed">
                        "Notre objectif est d'assurer des espaces propres, sains et conformes aux exigences d'hygiène, quel que soit le type d'établissement ou d'événement."
                    </p>
                    <div className="h-1 w-20 bg-african-green mx-auto rounded-full" />
                    <div className="grid md:grid-cols-3 gap-6 pt-6">
                        <div className="text-center">
                            <ShieldCheck className="h-10 w-10 mx-auto text-african-green mb-2" />
                            <p className="font-bold">Qualité</p>
                            <p className="text-sm text-muted-foreground">Résultats garantis</p>
                        </div>
                        <div className="text-center">
                            <Zap className="h-10 w-10 mx-auto text-african-green mb-2" />
                            <p className="font-bold">Rapidité</p>
                            <p className="text-sm text-muted-foreground">Interventions express</p>
                        </div>
                        <div className="text-center">
                            <Award className="h-10 w-10 mx-auto text-african-green mb-2" />
                            <p className="font-bold">Expertise</p>
                            <p className="text-sm text-muted-foreground">Personnel formé</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderBlog = () => (
        <div className="text-center py-16">
            <BookOpen className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Blog</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Nos articles sur le nettoyage, l'hygiène et les bonnes pratiques arrivent bientôt.
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
                            href="https://wa.me/237690000000?text=Bonjour%2C%20je%20souhaite%20demander%20un%20devis%20pour%20un%20service%20de%20nettoyage."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors border border-[#25D366]/20 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">WhatsApp (Cliquable)</p>
                                <p className="font-semibold text-lg text-[#25D366]">Demander un devis</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                <Mail className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold text-lg">nettoyage@lebonpetit.cm</p>
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
                        <Button type="submit" variant="cta" className="w-full bg-african-green hover:bg-african-green/90" disabled={contactLoading}>
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
                            <Sparkles className="h-6 w-6" />
                            Nettoyage Professionnel
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Hygiène & Salubrité</p>
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
                                    <span className="text-sm">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="bg-african-green/10 p-4 rounded-lg">
                            <p className="font-bold text-african-green text-sm mb-1">Besoin d'un devis ?</p>
                            <p className="text-xs text-muted-foreground mb-3">Demandez maintenant par WhatsApp.</p>
                            <Button size="sm" variant="outline" className="w-full text-xs border-african-green text-african-green hover:bg-african-green hover:text-white" onClick={() => setActiveSection('tarifs')}>
                                Demander un devis
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-secondary/10">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-african-green" />
                            <span className="font-heading font-bold text-lg">Nettoyage</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeSection === 'accueil' && renderAccueil()}
                            {activeSection === 'services' && renderServices()}
                            {activeSection === 'particuliers' && renderParticuliers()}
                            {activeSection === 'professionnels' && renderProfessionnels()}
                            {activeSection === 'evenementiel' && renderEvenementiel()}
                            {activeSection === 'tarifs' && renderTarifs()}
                            {activeSection === 'apropos' && renderAPropos()}
                            {activeSection === 'blog' && renderBlog()}
                            {activeSection === 'contact' && renderContact()}
                        </div>
                    </div>
                </main>
            </div>

            <WhatsAppButton
                phoneNumber="+237690000000"
                message="Bonjour, je souhaite demander un devis pour un service de nettoyage."
                label="Demander un devis"
            />
        </Layout>
    );
}
