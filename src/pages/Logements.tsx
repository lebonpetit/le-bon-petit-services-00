import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CITIES, QUARTIERS_BY_CITY, BUDGET_RANGES } from '@/lib/constants';
import {
    Home,
    Building2,
    CalendarCheck,
    Users,
    Briefcase,
    Info,
    BookOpen,
    Phone,
    MapPin,
    Shield,
    Camera,
    Megaphone,
    FileCheck,
    DollarSign,
    Wifi,
    Wind,
    Tv,
    UtensilsCrossed,
    Car,
    Lock,
    CheckCircle2,
    Send,
    Menu,
    Eye,
    Clock,
    Star,
    Sparkles,
    ArrowRight,
    MessageCircle,
    Filter,
    X as XIcon,
    ChevronDown,
    Search
} from 'lucide-react';

// Import images - African context
import heroImage from '@/assets/apartments/logements-hero.png';
import ownerImage from '@/assets/apartments/owner.png';
import { useQuery } from '@tanstack/react-query';
import { PhoneInputV2 } from '@/components/ui/phone-input-v2';

type Section = 'accueil' | 'appartements' | 'reserver' | 'proprietaires' | 'services' | 'apropos' | 'blog' | 'contact';
type SelectionState = 'none' | 'meuble' | 'habitation'; // New state for initial selection

const navigation: { id: Section; name: string; icon: any }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'appartements', name: 'Nos logements', icon: Building2 },
    { id: 'reserver', name: 'Réserver', icon: CalendarCheck },
    { id: 'proprietaires', name: 'Propriétaires', icon: Users },
    { id: 'services', name: 'Services annexes', icon: Briefcase },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const guarantees = [
    { icon: Shield, text: 'Vérifiés & Sécurisés', desc: 'Chaque appartement est visité et validé par notre équipe.' },
    { icon: Camera, text: 'Photos Réelles', desc: 'Ce que vous voyez est exactement ce que vous aurez.' },
    { icon: Phone, text: 'Support 24h/7j', desc: 'Une équipe disponible pour vous assister à tout moment.' },
    { icon: Lock, text: 'Paiement Sécurisé', desc: 'Transactions fiables sans mauvaises surprises.' },
];

const ownerAdvantages = [
    { icon: Camera, text: 'Shooting Pro', desc: 'Mise en valeur de votre bien par des photos HD.' },
    { icon: Megaphone, text: 'Visibilité Max', desc: 'Publicité ciblée sur réseaux sociaux et Google.' },
    { icon: FileCheck, text: 'Gestion Complète', desc: 'On s\'occupe des visites, états des lieux et contrats.' },
    { icon: DollarSign, text: 'Revenus Optimisés', desc: 'Tarification dynamique pour maximiser vos gains.' },
];

const servicesList = [
    { title: 'Location Courte Durée', description: 'Idéal pour séjours d\'affaires ou vacances.', icon: Clock },
    { title: 'Location Longue Durée', description: 'Pour expatriés et résidents permanents.', icon: Building2 },
    { title: 'Promotion Digitale', description: 'Boostez la visibilité de vos biens immobiliers.', icon: Megaphone },
    { title: 'Photographie Immo', description: 'Shooting professionnel pour vos propriétés.', icon: Camera },
];

const equipments = [
    { icon: Wifi, label: 'Wi-Fi Haut Débit' },
    { icon: Wind, label: 'Climatisation' },
    { icon: Tv, label: 'Smart TV' },
    { icon: UtensilsCrossed, label: 'Cuisine Équipée' },
    { icon: Car, label: 'Parking Sécurisé' },
    { icon: Lock, label: 'Gardiennage' },
];

export default function Logements() {
    // URL-based navigation helper
    const getInitialSection = (): Section => {
        const hash = window.location.hash.replace('#', '') as Section;
        return navigation.some(nav => nav.id === hash) ? hash : 'accueil';
    };

    const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const checkShowChoicePage = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') !== 'meubles';
    };

    const [showChoicePage, setShowChoicePage] = useState(checkShowChoicePage);

    useEffect(() => {
        const handleUrlChange = () => {
            setShowChoicePage(checkShowChoicePage());
        };
        // Listen to popstate for back/forward
        window.addEventListener('popstate', handleUrlChange);
        // Also check on location change (if using React Router's location, we might need a useEffect on that, but this covers browser nav)
        return () => window.removeEventListener('popstate', handleUrlChange);
    }, []);

    // Also update on location change from React Router
    const location = useLocation();
    useEffect(() => {
        setShowChoicePage(checkShowChoicePage());
    }, [location]);


    const landingImages = [heroImage, ownerImage];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showChoicePage) {
            timer = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % landingImages.length);
            }, 5000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showChoicePage]);

    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    // location is already imported

    const { data: listings = [], isLoading: loadingListings } = useQuery({
        queryKey: ['listings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('available', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as Listing[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // Check for navigation state/params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const action = params.get('action');

        if (action === 'reserver') {
            setActiveSection('reserver');
            window.location.hash = 'reserver';

            // Check state for pre-fill
            if (location.state) {
                const { listing_title, listing_link, landlord_id } = location.state as any;
                if (listing_title) {
                    setReservationForm(prev => ({
                        ...prev,
                        listing_title: listing_title,
                        listing_link: listing_link || '',
                        landlord_id: landlord_id || ''
                    }));
                }
            }

            // Allow smooth scroll to kick in after render
            setTimeout(() => {
                const el = document.getElementById('reserver');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [location]);

    // Navigate to section and update URL
    const navigateToSection = useCallback((section: Section) => {
        if (section === 'proprietaires' && !user) {
            navigate(`/login?redirect=${encodeURIComponent('/logements?view=meubles#proprietaires')}`);
            return;
        }

        // Ensure we keep the view param
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get('view') !== 'meubles') {
            // If we are navigating to a section within "meubles" but not in that view, switch view
            navigate(`/logements?view=meubles#${section}`);
        } else {
            window.location.hash = section;
        }

        setActiveSection(section);
        setSidebarOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [user, navigate]);

    // Handle hash changes (browser back/forward)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '') as Section;
            if (navigation.some(nav => nav.id === hash)) {
                setActiveSection(hash);
            }
        };
        // Initial check too
        const initialHash = window.location.hash.replace('#', '') as Section;
        if (initialHash && navigation.some(nav => nav.id === initialHash)) {
            setActiveSection(initialHash);
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Restricted types for furnished rentals
    const TYPES_MEUBLES = ["Appartement", "Studio", "Chambre"];

    // Filters state
    const [filters, setFilters] = useState({
        city: 'all',
        quartier: 'all',
        budget: 'all',
        typeBien: 'all',
        furnished: 'all', // 'all', 'true', 'false'
    });

    // Form States
    const [reservationForm, setReservationForm] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        email: '',
        dateDebut: '',
        dateFin: '',
        personnes: '1',
        listing_title: '',
        listing_link: '',
        landlord_id: ''
    });
    const [reservationLoading, setReservationLoading] = useState(false);
    const [ownerForm, setOwnerForm] = useState({ nom: '', telephone: '', ville: '', typeBien: '', chambres: '', meuble: 'non' });
    const [ownerLoading, setOwnerLoading] = useState(false);
    const [contactForm, setContactForm] = useState({ nom: '', email: '', sujet: '', message: '' });
    const [contactLoading, setContactLoading] = useState(false);

    const handleSelectListing = useCallback((listing: Listing) => {
        const link = `${window.location.origin}/appartements/${listing.id}`;
        setReservationForm(prev => ({
            ...prev,
            listing_title: listing.title,
            listing_link: link,
            landlord_id: listing.owner_id
        }));
        navigateToSection('reserver');
    }, [navigateToSection]);



    useEffect(() => {
        applyFilters();
    }, [filters, listings]);

    // Reset neighborhood when city changes
    useEffect(() => {
        setFilters(prev => ({ ...prev, quartier: 'all' }));
    }, [filters.city]);

    const applyFilters = () => {
        let result = [...listings];

        if (filters.city !== 'all') {
            result = result.filter(l => l.city === filters.city);
        }

        if (filters.quartier !== 'all') {
            result = result.filter(l => l.quartier === filters.quartier);
        }

        if (filters.typeBien !== 'all') {
            result = result.filter(l => l.type_logement === filters.typeBien);
        }

        if (filters.furnished !== 'all') {
            const isFurnished = filters.furnished === 'true';
            result = result.filter(l => l.furnished === isFurnished);
        }

        if (filters.budget !== 'all') {
            const [min, max] = filters.budget.split('-').map(Number);
            if (max) {
                result = result.filter(l => l.price >= min && l.price <= max);
            } else if (filters.budget.endsWith('+')) {
                const minPlus = parseInt(filters.budget);
                result = result.filter(l => l.price >= minPlus);
            }
        }

        setFilteredListings(result);
    };



    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReservationLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...reservationForm, type: 'reservation_appartement' },
                contact_name: `${reservationForm.prenom} ${reservationForm.nom}`,
                contact_phone: reservationForm.whatsapp,
                status: 'new',
                landlord_id: reservationForm.landlord_id || null,
            });
            if (error) throw error;
            toast({ title: "Demande envoyée !", description: "On vous contacte très vite pour confirmer." });
            setReservationForm({
                nom: '',
                prenom: '',
                whatsapp: '',
                email: '',
                dateDebut: '',
                dateFin: '',
                personnes: '1',
                listing_title: '',
                listing_link: '',
                landlord_id: ''
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Oups, réessayez plus tard." });
        } finally {
            setReservationLoading(false);
        }
    };

    const handleOwnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOwnerLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...ownerForm, type: 'depot_bien_meuble' },
                contact_name: ownerForm.nom,
                contact_phone: ownerForm.telephone,
                status: 'new',
                landlord_id: ownerForm.landlord_id || null, // Best effort
            });
            if (error) throw error;
            toast({ title: "Proposition reçue !", description: "Un agent va étudier votre bien et vous rappeler." });
            setOwnerForm({ nom: '', telephone: '', ville: '', typeBien: '', chambres: '', meuble: 'non' });
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer." });
        } finally {
            setOwnerLoading(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...contactForm, type: 'contact_appartement' },
                contact_name: contactForm.nom,
                contact_phone: 'N/A',
                status: 'new',
                landlord_id: null,
            });
            if (error) throw error;
            toast({ title: "Message envoyé !", description: "Nous vous répondrons par email." });
            setContactForm({ nom: '', email: '', sujet: '', message: '' });
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Échec de l'envoi." });
        } finally {
            setContactLoading(false);
        }
    };



    // Handle hash changes moved to navigateToSection block

    // If choice page is active (no hash)
    if (showChoicePage) {
        return (
            <Layout>
                <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4">
                    {/* Background Carousel */}
                    <div className="absolute inset-0 overflow-hidden z-0">
                        {landingImages.map((img, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <div className="absolute inset-0 bg-black/60 z-10" />
                                <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover scale-105 animate-slow-zoom" />
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 w-full max-w-5xl mx-auto space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-4">
                            <Badge className="bg-african-yellow text-primary-foreground border-none px-6 py-2 text-sm font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                                Bienvenue chez Le Bon Petit
                            </Badge>
                            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
                                Que cherchez-vous <br />
                                <span className="text-african-yellow">aujourd'hui ?</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                                Découvrez nos solutions de logement adaptées à tous vos besoins, pour un jour ou pour la vie.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto">
                            {/* Option 1: Logement Meublé */}
                            <button
                                onClick={() => navigate('/logements?view=meubles')}
                                className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover:bg-african-yellow hover:border-african-yellow transition-all duration-300 hover:scale-[1.02] shadow-2xl text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-african-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-african-yellow text-white transition-colors">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl font-bold text-white mb-2">Logement Meublé</h3>
                                        <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90">
                                            Appartements, studios et chambres équipés pour vos séjours courts et moyens. Confort immédiat.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-african-yellow group-hover:text-white font-bold text-sm uppercase tracking-wider">
                                        Explorer les offres <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>

                            {/* Option 2: Domicile Habitation */}
                            <button
                                onClick={() => window.location.href = '/habitations'}
                                className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 hover:bg-african-earth hover:border-african-earth transition-all duration-300 hover:scale-[1.02] shadow-2xl text-left"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-african-earth/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-african-earth text-white transition-colors">
                                        <Home className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl font-bold text-white mb-2">Domicile pour Habitation</h3>
                                        <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90">
                                            Maisons et appartements nus à louer pour votre résidence principale. Installez-vous durablement.
                                        </p>
                                    </div>
                                    <div className="flex items-center text-african-earth group-hover:text-white font-bold text-sm uppercase tracking-wider">
                                        Voir les annonces <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex min-h-screen bg-background relative selection:bg-african-yellow/30">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 h-[100dvh] w-72 bg-card/95 backdrop-blur border-r shadow-2xl lg:shadow-none
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col flex-shrink-0
                `}>
                    <div className="p-6 border-b">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-african-yellow flex items-center justify-center text-primary-foreground font-bold shadow-lg group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading font-bold text-xl tracking-tight leading-none text-african-yellow text-center">Logement</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Haut de gamme</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                        {navigation.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigateToSection(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${activeSection === item.id
                                        ? 'bg-african-yellow text-primary-foreground shadow-md shadow-african-yellow/20 translate-x-1'
                                        : 'text-muted-foreground hover:bg-african-yellow/10 hover:text-african-yellow'}
                                `}
                            >
                                <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'animate-pulse' : ''}`} />
                                {item.name}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t bg-secondary/30">
                        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-muted-foreground">Service en ligne</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Besoin d'aide pour trouver ?
                            </p>
                            <Button variant="link" className="text-african-yellow p-0 h-auto text-xs font-bold mt-1" onClick={() => navigateToSection('contact')}>
                                Contactez le support
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-secondary/5">
                    {/* Mobile Header */}
                    <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </Button>
                        <span className="font-heading font-bold text-lg">Logement</span>
                        <div className="w-10" /> {/* Spacer */}
                    </header>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-20 min-h-screen">

                        {/* SECTION: ACCUEIL */}
                        {activeSection === 'accueil' && (
                            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <section className="relative rounded-[2.5rem] overflow-hidden bg-african-yellow min-h-[550px] flex items-center text-primary-foreground shadow-2xl ring-1 ring-white/10">
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-black/40 z-10" />
                                        <img src={heroImage} alt="Appartement Luxe" className="w-full h-full object-cover scale-105 animate-slow-zoom" />
                                    </div>
                                    {/* Decorative elements - Clean shapes */}
                                    <div className="absolute top-10 right-10 w-32 h-32 bg-african-yellow/20 rounded-full blur-2xl z-20 animate-pulse" />
                                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-african-yellow/20 rounded-full blur-xl z-20 animate-pulse delay-700" />

                                    <div className="relative z-20 px-6 md:px-12 lg:px-20 py-16 max-w-4xl space-y-8 animate-slide-up">
                                        <Badge className="bg-white/20 text-white border-none py-2 px-4 backdrop-blur-md">
                                            ✨ #1 Service de Location à Douala
                                        </Badge>
                                        <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight text-white">
                                            Votre confort, <br />
                                            <span className="text-african-yellow drop-shadow-sm">
                                                notre priorité.
                                            </span>
                                        </h1>
                                        <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl font-light">
                                            Découvrez des appartements meublés d'exception, vérifiés et prêts à vivre.
                                            Pour 2 jours ou 6 mois, sentez-vous chez vous.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                size="xl"
                                                className="bg-african-yellow text-primary-foreground hover:bg-white hover:text-african-yellow border-none shadow-[0_0_20px_rgba(255,193,3,0.3)] transition-all duration-300"
                                                onClick={() => navigateToSection('appartements')}
                                            >
                                                <Home className="mr-2 h-5 w-5" />
                                                Explorer les résidences
                                            </Button>
                                            <Button
                                                size="xl"
                                                variant="outline"
                                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
                                                onClick={() => navigateToSection('reserver')}
                                            >
                                                Réserver maintenant
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stats overlay */}
                                    <div className="absolute bottom-0 right-0 p-12 hidden lg:flex gap-12 z-20">
                                        <div className="text-white">
                                            <p className="font-heading font-bold text-4xl">500+</p>
                                            <p className="text-sm opacity-80">Voyageurs heureux</p>
                                        </div>
                                        <div className="text-white">
                                            <p className="font-heading font-bold text-4xl">50+</p>
                                            <p className="text-sm opacity-80">Appartements</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Garanties Grid */}
                                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {guarantees.map((item, idx) => (
                                        <div key={idx} className="group bg-card p-8 rounded-3xl border shadow-soft hover:shadow-xl transition-all duration-300">
                                            <div className="w-14 h-14 rounded-2xl bg-african-yellow/10 group-hover:bg-african-yellow flex items-center justify-center mb-6 transition-all duration-300">
                                                <item.icon className="h-7 w-7 text-african-yellow group-hover:text-primary-foreground transition-colors" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 group-hover:text-african-yellow transition-colors">{item.text}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </section>
                            </div>
                        )}

                        {/* SECTION: APPARTEMENTS */}
                        {(activeSection === 'appartements' || activeSection === 'accueil') && (
                            <div id="appartements" className="space-y-8 pt-12">
                                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
                                    <div>
                                        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-foreground">
                                            Nos meilleures adresses 🏢
                                        </h2>
                                        <p className="text-muted-foreground">Sélection exclusive de logements validés.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={showFilters ? "cta" : "outline"}
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2"
                                        >
                                            <Filter className="h-4 w-4" />
                                            {showFilters ? 'Masquer les filtres' : 'Filtrer les adresses'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Dynamic Filters */}
                                {showFilters && (
                                    <Card className="border-african-yellow/20 bg-african-yellow/5 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select value={filters.furnished} onValueChange={(v) => setFilters({ ...filters, furnished: v })}>
                                                        <SelectTrigger className="bg-background border-african-yellow/20"><SelectValue placeholder="Tous" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Tous les logements</SelectItem>
                                                            <SelectItem value="true">Meublé</SelectItem>
                                                            <SelectItem value="false">Non meublé</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Ville</Label>
                                                    <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                                                        <SelectTrigger className="bg-background border-african-yellow/20"><SelectValue placeholder="Toutes" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Toutes les villes</SelectItem>
                                                            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Quartier</Label>
                                                    <Select
                                                        value={filters.quartier}
                                                        onValueChange={(v) => setFilters({ ...filters, quartier: v })}
                                                        disabled={filters.city === 'all'}
                                                    >
                                                        <SelectTrigger className="bg-background border-african-yellow/20">
                                                            <SelectValue placeholder={filters.city === 'all' ? "Choisir une ville" : "Tous"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Tous les quartiers</SelectItem>
                                                            {filters.city !== 'all' && QUARTIERS_BY_CITY[filters.city]?.map((q) => (
                                                                <SelectItem key={q} value={q}>{q}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Type de bien</Label>
                                                    <Select value={filters.typeBien} onValueChange={(v) => setFilters({ ...filters, typeBien: v })}>
                                                        <SelectTrigger className="bg-background border-african-yellow/20"><SelectValue placeholder="Tous" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Tous les types</SelectItem>
                                                            {TYPES_MEUBLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Prix</Label>
                                                    <Select value={filters.budget} onValueChange={(v) => setFilters({ ...filters, budget: v })}>
                                                        <SelectTrigger className="bg-background border-african-yellow/20"><SelectValue placeholder="Tous les prix" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Tous les prix</SelectItem>
                                                            {BUDGET_RANGES.map((b) => (
                                                                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {loadingListings ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-[400px] rounded-3xl bg-secondary/50 animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredListings.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredListings.map((listing) => (
                                            <Card key={listing.id} className="group overflow-hidden rounded-3xl border shadow-soft hover:shadow-2xl transition-all duration-500 bg-card">
                                                <div className="relative h-64 overflow-hidden">
                                                    <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <img
                                                        src={listing.photos?.[0] || heroImage}
                                                        alt={listing.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-4 left-4 z-20">
                                                        <Badge className="bg-african-yellow text-primary-foreground shadow-lg border-none">
                                                            {listing.type_logement}
                                                        </Badge>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4 right-4 z-20">
                                                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg flex justify-between items-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                            <p className="font-bold text-african-yellow text-lg">
                                                                {listing.price?.toLocaleString()} <span className="text-[10px] uppercase font-bold text-african-earth opacity-70">FCFA {listing.furnished ? '/ Jour' : '/ Mois'}</span>
                                                            </p>
                                                            <div className="flex gap-1">
                                                                <Star className="w-3 h-3 text-african-yellow fill-african-yellow" />
                                                                <Star className="w-3 h-3 text-african-yellow fill-african-yellow" />
                                                                <Star className="w-3 h-3 text-african-yellow fill-african-yellow" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardContent className="p-6">
                                                    <h3 className="font-heading font-bold text-xl mb-2 line-clamp-1 group-hover:text-african-yellow transition-colors uppercase tracking-tight">{listing.title}</h3>
                                                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                                                        <div className="w-8 h-8 rounded-full bg-african-yellow/10 flex items-center justify-center mr-2">
                                                            <MapPin className="h-4 w-4 text-african-yellow" />
                                                        </div>
                                                        {listing.quartier}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {[
                                                            listing.furnished ? 'Meublé' : 'Non meublé',
                                                            listing.has_parking ? 'Parking' : null,
                                                            listing.has_water ? 'Eau H24' : null,
                                                            listing.has_electricity ? 'Électricité' : null,
                                                            listing.rooms ? `${listing.rooms} Pièces` : null
                                                        ].filter(Boolean).slice(0, 3).map((feat, i) => (
                                                            <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-secondary/80 px-3 py-1.5 rounded-full text-muted-foreground">
                                                                {feat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            className="flex-1 bg-african-yellow hover:bg-african-earth text-primary-foreground font-bold h-12 rounded-xl transition-all"
                                                            onClick={() => handleSelectListing(listing)}
                                                        >
                                                            Réserver 📅
                                                        </Button>
                                                        <Button variant="outline" className="h-12 w-12 rounded-xl border-african-yellow/20 hover:bg-african-yellow/10" asChild>
                                                            <Link to={`/appartements/${listing.id}`}><Eye className="h-5 w-5 text-african-yellow" /></Link>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-african-yellow/20">
                                        <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                                        <h3 className="font-heading text-xl font-bold mb-2">Aucun résultat 🔍</h3>
                                        <p className="text-muted-foreground">Nous n'avons trouvé aucun logement correspondant à vos critères de recherche.</p>
                                        <Button
                                            variant="link"
                                            className="mt-4 text-african-yellow"
                                            onClick={() => setFilters({ city: 'all', quartier: 'all', typeBien: 'all', budget: 'all', furnished: 'all' })}
                                        >
                                            Réinitialiser les filtres
                                        </Button>
                                    </div>
                                )}

                                {/* Equipements Banner */}
                                <div className="bg-card border shadow-xl rounded-[2.5rem] p-12 mt-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-african-yellow/5 rounded-full blur-3xl" />
                                    <h3 className="text-center font-heading font-bold text-2xl mb-12">Tout le confort, inclus.</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                                        {equipments.map((eq, i) => (
                                            <div key={i} className="flex flex-col items-center gap-4 text-center group">
                                                <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center group-hover:bg-african-yellow group-hover:text-primary-foreground group-hover:rotate-12 transition-all duration-300 shadow-sm group-hover:shadow-lg">
                                                    <eq.icon className="h-7 w-7" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{eq.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION: RESERVER */}
                        {(activeSection === 'reserver') && (
                            <div id="reserver" className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                                <div className="text-center mb-10">
                                    <span className="bg-african-yellow/10 text-african-yellow px-3 py-1 rounded-full text-sm font-bold tracking-wide">ÉTAPE 1/2</span>
                                    <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-2">Dites-nous tout 📝</h2>
                                    <p className="text-muted-foreground">Remplissez ce formulaire pour recevoir une confirmation rapide.</p>
                                </div>
                                <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white dark:bg-card">
                                    <div className="h-3 bg-african-yellow w-full" />
                                    <CardHeader className="bg-secondary/20 border-b pb-8">
                                        <CardTitle className="text-center font-heading text-2xl text-african-yellow flex items-center justify-center gap-2">
                                            <CalendarCheck className="h-7 w-7" />
                                            Réservation Express
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 md:p-12 space-y-8">
                                        {reservationForm.listing_title && (
                                            <div className="p-4 bg-african-yellow/5 border border-african-yellow/20 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
                                                <div className="w-12 h-12 rounded-xl bg-african-yellow flex items-center justify-center text-white shrink-0">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-african-yellow/60">Logement sélectionné</p>
                                                    <p className="font-bold text-lg truncate">{reservationForm.listing_title}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full hover:bg-african-yellow/10"
                                                    onClick={() => setReservationForm(prev => ({ ...prev, listing_title: '', listing_link: '' }))}
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Prénom *</Label>
                                                <Input placeholder="Jean" className="h-12 bg-secondary/30 border-transparent focus:border-african-yellow" value={reservationForm.prenom} onChange={(e) => setReservationForm({ ...reservationForm, prenom: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nom *</Label>
                                                <Input placeholder="Dupont" className="h-12 bg-secondary/30 border-transparent focus:border-african-yellow" value={reservationForm.nom} onChange={(e) => setReservationForm({ ...reservationForm, nom: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>WhatsApp *</Label>
                                            <PhoneInputV2
                                                value={reservationForm.whatsapp}
                                                onValueChange={(val) => setReservationForm({ ...reservationForm, whatsapp: val })}
                                                placeholder="69X XX XX XX"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Arrivée *</Label>
                                                <Input type="date" className="h-12 bg-secondary/30 border-transparent focus:border-african-yellow" value={reservationForm.dateDebut} onChange={(e) => setReservationForm({ ...reservationForm, dateDebut: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Départ *</Label>
                                                <Input type="date" className="h-12 bg-secondary/30 border-transparent focus:border-african-yellow" value={reservationForm.dateFin} onChange={(e) => setReservationForm({ ...reservationForm, dateFin: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Voyageurs</Label>
                                            <Select value={reservationForm.personnes} onValueChange={(v) => setReservationForm({ ...reservationForm, personnes: v })}>
                                                <SelectTrigger className="h-12 bg-secondary/30 border-transparent focus:border-african-yellow"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6].map(n => <SelectItem key={n} value={n.toString()}>{n} personne{n > 1 ? 's' : ''}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handleReservationSubmit}
                                            disabled={reservationLoading}
                                            className="w-full h-14 bg-african-yellow hover:bg-african-yellow/90 text-primary-foreground text-lg font-bold shadow-lg hover:shadow-xl transition-all rounded-xl mt-4"
                                        >
                                            {reservationLoading ? 'Envoi...' : 'Valider ma demande 🚀'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* SECTION: PROPRIETAIRES */}
                        {(activeSection === 'proprietaires') && (
                            <div id="proprietaires" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-primary rounded-[3.5rem] p-10 md:p-20 text-white text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="relative z-10 max-w-3xl mx-auto space-y-10 animate-fade-in">
                                        <div className="flex flex-col items-center gap-4">
                                            <Badge className="bg-african-yellow text-primary-foreground border-none py-2 px-6 text-sm font-bold uppercase tracking-widest shadow-lg">Espace Propriétaire</Badge>
                                            <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight">Monétisez votre bien <br /><span className="text-african-yellow">sans effort 💸</span></h2>
                                        </div>
                                        <p className="text-lg md:text-2xl opacity-90 leading-relaxed font-light">
                                            Vous avez un appartement meublé ? Confiez-le à des experts.
                                            On gère tout, vous maximisez vos revenus.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {ownerAdvantages.map((adv, i) => (
                                        <div key={i} className="text-center p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                                            <div className="w-14 h-14 mx-auto bg-african-yellow/10 text-african-yellow rounded-full flex items-center justify-center mb-4">
                                                <adv.icon className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-lg mb-2">{adv.text}</h4>
                                            <p className="text-sm text-muted-foreground">{adv.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <Card className="max-w-xl mx-auto border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-card">
                                    <div className="p-8">
                                        <h3 className="text-center font-heading font-bold text-2xl mb-8">Proposer mon bien</h3>
                                        <form className="space-y-5">
                                            <Input placeholder="Votre nom" className="h-12 bg-secondary/30 border-transparent" value={ownerForm.nom} onChange={(e) => setOwnerForm({ ...ownerForm, nom: e.target.value })} />
                                            <PhoneInput
                                                value={ownerForm.telephone}
                                                onValueChange={(val) => setOwnerForm({ ...ownerForm, telephone: val })}
                                                placeholder="Votre téléphone"
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Select value={ownerForm.ville} onValueChange={(v) => setOwnerForm({ ...ownerForm, ville: v })}>
                                                    <SelectTrigger className="h-12 bg-secondary/30 border-transparent"><SelectValue placeholder="Ville" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="douala">Douala</SelectItem>
                                                        <SelectItem value="yaounde">Yaoundé</SelectItem>
                                                        <SelectItem value="kribi">Kribi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select value={ownerForm.typeBien} onValueChange={(v) => setOwnerForm({ ...ownerForm, typeBien: v })}>
                                                    <SelectTrigger className="h-12 bg-secondary/30 border-transparent"><SelectValue placeholder="Type" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="studio">Studio</SelectItem>
                                                        <SelectItem value="appartement">Appartement</SelectItem>
                                                        <SelectItem value="villa">Villa</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm text-muted-foreground ml-1">État du logement</Label>
                                                <Select value={ownerForm.meuble} onValueChange={(v) => setOwnerForm({ ...ownerForm, meuble: v })}>
                                                    <SelectTrigger className="h-12 bg-secondary/30 border-transparent"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="oui">Meublé</SelectItem>
                                                        <SelectItem value="non">Non meublé</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={handleOwnerSubmit} disabled={ownerLoading} className="w-full h-14 bg-primary text-lg font-bold">
                                                {ownerLoading ? 'Envoi...' : 'Envoyer ma proposition'}
                                            </Button>
                                        </form>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* SECTION: SERVICES */}
                        {(activeSection === 'services') && (
                            <div id="services" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center mb-12">
                                    <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Plus qu'un simple logement</h2>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        Nous accompagnons votre expérience avec des services sur-mesure.
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                    {servicesList.map((svc, i) => (
                                        <div key={i} className="flex gap-5 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                                            <div className="w-16 h-16 shrink-0 bg-secondary rounded-xl flex items-center justify-center text-primary">
                                                <svc.icon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl mb-2">{svc.title}</h3>
                                                <p className="text-muted-foreground">{svc.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SECTION: A PROPOS */}
                        {(activeSection === 'apropos') && (
                            <div id="apropos" className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto text-center space-y-8">
                                <h2 className="font-heading text-3xl md:text-4xl font-bold">Notre Vision 🌍</h2>
                                <p className="text-xl leading-relaxed text-muted-foreground">
                                    "Le Bon Petit" est né d'un constat simple : trouver un logement propre, sécurisé et bien équipé au Cameroun est souvent un parcours du combattant.
                                </p>
                                <p className="text-xl leading-relaxed text-muted-foreground">
                                    Nous avons digitalisé l'expérience pour vous offrir <strong>la tranquillité d'esprit</strong> que vous méritez. Que vous veniez pour les affaires ou pour voir la famille, nous vous garantissons un atterrissage en douceur.
                                </p>
                                <div className="grid grid-cols-3 gap-6 pt-8">
                                    <div className="p-4 bg-african-green/10 rounded-2xl text-african-green font-bold">Fiabilité</div>
                                    <div className="p-4 bg-african-yellow/10 rounded-2xl text-african-yellow font-bold">Confort</div>
                                    <div className="p-4 bg-african-red/10 rounded-2xl text-african-red font-bold">Sécurité</div>
                                </div>
                            </div>
                        )}

                        {/* SECTION: BLOG */}
                        {(activeSection === 'blog') && (
                            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                                <BookOpen className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
                                <h2 className="font-heading text-3xl font-bold mb-4">Le Blog Immo</h2>
                                <p className="text-muted-foreground mb-8">Conseils, astuces et bons plans pour se loger au Cameroun.</p>
                                <Badge variant="secondary" className="px-4 py-2 text-base">🚧 Bientôt disponible</Badge>
                            </div>
                        )}

                        {/* SECTION: CONTACT */}
                        {(activeSection === 'contact') && (
                            <div id="contact" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="font-heading text-3xl font-bold mb-4">On discute ? 💬</h2>
                                            <p className="text-muted-foreground text-lg">
                                                Une question sur un appartement ? Un besoin spécifique ?
                                                Écrivez-nous ou appelez-nous directement.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <a href="https://wa.me/237690547084" className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 hover:shadow-md transition-all">
                                                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                                                    <MessageCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">WhatsApp</p>
                                                    <p className="text-primary">Réponse immédiate</p>
                                                </div>
                                            </a>
                                            <a href="tel:+237690547084" className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all">
                                                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                                    <Phone className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-blue-900">Appel Direct</p>
                                                    <p className="text-blue-700">+237 690 547 084</p>
                                                </div>
                                            </a>
                                        </div>
                                    </div>

                                    <Card className="rounded-3xl shadow-lg border-none">
                                        <CardContent className="p-8 space-y-4">
                                            <h3 className="font-bold text-xl mb-4">Envoyer un message</h3>
                                            <Input placeholder="Votre email" className="h-12 bg-secondary/30 border-transparent" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                                            <Input placeholder="Sujet" className="h-12 bg-secondary/30 border-transparent" value={contactForm.sujet} onChange={(e) => setContactForm({ ...contactForm, sujet: e.target.value })} />
                                            <Textarea placeholder="Votre message..." className="min-h-[120px] bg-secondary/30 border-transparent" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
                                            <Button onClick={handleContactSubmit} disabled={contactLoading} className="w-full h-12 bg-foreground text-background font-bold">
                                                {contactLoading ? '...' : 'Envoyer'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <WhatsAppButton
                phoneNumber="+237690547084"
                message="Bonjour, je suis intéressé par un appartement."
            />
        </Layout>
    );
}
