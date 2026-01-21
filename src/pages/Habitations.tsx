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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CITIES, QUARTIERS_BY_CITY, TYPES_LOGEMENT, BUDGET_RANGES } from '@/lib/constants';
import {
    Home,
    Building2,
    FileText,
    Briefcase,
    Info,
    BookOpen,
    Phone,
    Mail,
    MapPin,
    Shield,
    Clock,
    FileCheck,
    Users,
    Search,
    CheckCircle2,
    Send,
    Menu,
    X,
    MessageCircle,
    Eye,
    Droplets,
    Zap,
    Car,
    Ruler,
    DoorOpen,
    Instagram,
    Facebook,
    Twitter,
    Filter
} from 'lucide-react';

// Import images - African context
import heroImage from '@/assets/apartments/habitations-hero.png';
import ownerImage from '@/assets/apartments/owner.png';

type Section = 'accueil' | 'biens' | 'deposer' | 'services' | 'apropos' | 'blog' | 'contact';

const navigation: { id: Section; name: string; icon: typeof Home }[] = [
    { id: 'accueil', name: 'Accueil', icon: Home },
    { id: 'biens', name: 'Biens à louer', icon: Building2 },
    { id: 'deposer', name: 'Déposer un bien', icon: FileText },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'apropos', name: 'À propos', icon: Info },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'contact', name: 'Contact', icon: Phone },
];

const guarantees = [
    { icon: Shield, text: 'Logements vérifiés' },
    { icon: Clock, text: 'Gain de temps' },
    { icon: FileCheck, text: 'Accompagnement administratif' },
    { icon: Shield, text: 'Sécurité des transactions' },
    { icon: Users, text: 'Assistance jusqu\'à l\'installation' },
];

const ownerAdvantages = [
    { icon: Eye, text: 'Large visibilité' },
    { icon: Users, text: 'Filtrage des locataires' },
    { icon: Search, text: 'Gestion des visites' },
    { icon: FileCheck, text: 'Contrat clair' },
    { icon: Clock, text: 'Gain de temps' },
];

const servicesList = [
    { title: 'Recherche de logement', description: 'Nous trouvons le logement qui correspond à vos besoins' },
    { title: 'Mise en location', description: 'Nous gérons la mise en location de votre bien' },
    { title: 'Organisation de visites', description: 'Nous organisons et accompagnons les visites' },
    { title: 'Rédaction de contrats', description: 'Nous rédigeons les contrats de location' },
    { title: 'Conseil immobilier', description: 'Nous vous conseillons pour vos investissements' },
];

export default function Habitations() {
    // URL-based navigation
    const getInitialSection = (): Section => {
        const hash = window.location.hash.replace('#', '') as Section;
        return navigation.some(nav => nav.id === hash) ? hash : 'accueil';
    };

    const [activeSection, setActiveSection] = useState<Section>(getInitialSection);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Navigate to section and update URL
    const navigateToSection = useCallback((section: Section) => {
        if (section === 'deposer' && !user) {
            navigate(`/login?redirect=${encodeURIComponent('/habitations#deposer')}`);
            return;
        }
        window.location.hash = section;
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
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Filters state
    const [filters, setFilters] = useState({
        city: 'all',
        quartier: 'all',
        budget: 'all',
        typeBien: 'all',
        rooms: 'all',
    });

    // Visit request form state
    const [visitForm, setVisitForm] = useState({
        nom: '',
        telephone: '',
        email: '',
        villeRecherchee: '',
        budget: '',
        listing_title: '',
        listing_link: '',
        landlord_id: '',
    });
    const [visitLoading, setVisitLoading] = useState(false);

    // Owner form state
    const [ownerForm, setOwnerForm] = useState({
        nom: '',
        telephone: '',
        ville: '',
        typeBien: '',
        loyer: '',
        meuble: 'non',
    });
    const [ownerLoading, setOwnerLoading] = useState(false);

    // Contact form state
    const [contactForm, setContactForm] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });
    const [contactLoading, setContactLoading] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, listings]);

    // Reset neighborhood when city changes
    useEffect(() => {
        if (filters.city === 'all') {
            setFilters(prev => ({ ...prev, quartier: 'all' }));
        } else {
            setFilters(prev => ({ ...prev, quartier: 'all' }));
        }
    }, [filters.city]);

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('available', true)
                .eq('furnished', false) // Only unfurnished listings
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
            setFilteredListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            // Fallback to all listings if furnished column doesn't exist yet
            try {
                const { data } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('available', true)
                    .order('created_at', { ascending: false });
                setListings(data || []);
                setFilteredListings(data || []);
            } catch (e) {
                console.error('Fallback also failed:', e);
            }
        } finally {
            setLoadingListings(false);
        }
    };

    const applyFilters = () => {
        let result = [...listings];

        if (filters.city && filters.city !== "all") {
            result = result.filter(l => l.city?.toLowerCase() === filters.city.toLowerCase());
        }
        if (filters.quartier && filters.quartier !== "all") {
            result = result.filter(l => l.quartier?.toLowerCase().includes(filters.quartier.toLowerCase()));
        }
        if (filters.typeBien && filters.typeBien !== "all") {
            result = result.filter(l => l.type_logement?.toLowerCase() === filters.typeBien.toLowerCase());
        }
        if (filters.rooms && filters.rooms !== "all") {
            result = result.filter(l => l.rooms === parseInt(filters.rooms));
        }
        if (filters.budget && filters.budget !== "all") {
            const [min, max] = filters.budget.split('-').map(v => v.replace('+', ''));
            result = result.filter(l => {
                if (max) {
                    return l.price >= parseInt(min) && l.price <= parseInt(max);
                }
                return l.price >= parseInt(min);
            });
        }

        setFilteredListings(result);
    };

    const resetFilters = () => {
        setFilters({ city: 'all', quartier: 'all', budget: 'all', typeBien: 'all', rooms: 'all' });
    };

    const handleSelectListing = (listing: Listing) => {
        const link = window.location.origin + '/habitations/' + listing.id;
        setVisitForm(prev => ({
            ...prev,
            listing_title: listing.title,
            listing_link: link,
            landlord_id: listing.owner_id || ''
        }));

        // Scroll to form
        const formElement = document.getElementById('visit-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (visitLoading) return;

        setVisitLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...visitForm, type: 'demande_visite_habitation' },
                contact_name: visitForm.nom,
                contact_phone: visitForm.telephone,
                status: 'new',
                landlord_id: visitForm.landlord_id || null,
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Un agent ou le propriétaire vous contactera pour organiser une visite.",
            });
            setVisitForm({ nom: '', telephone: '', email: '', villeRecherchee: '', budget: '', listing_title: '', listing_link: '', landlord_id: '' });
        } catch (error) {
            console.error('Error submitting visit request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre demande. Réessayez.",
            });
        } finally {
            setVisitLoading(false);
        }
    };

    const handleOwnerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (ownerLoading) return;

        setOwnerLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...ownerForm, type: 'depot_bien_habitation' },
                contact_name: ownerForm.nom,
                contact_phone: ownerForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Bien déposé !",
                description: "Notre équipe vous contactera pour les prochaines étapes.",
            });
            setOwnerForm({ nom: '', telephone: '', ville: '', typeBien: '', loyer: '', meuble: 'non' });
        } catch (error) {
            console.error('Error submitting owner form:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre proposition. Réessayez.",
            });
        } finally {
            setOwnerLoading(false);
        }
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (contactLoading) return;

        setContactLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: { ...contactForm, type: 'contact_habitation' },
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
            <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-african-earth/90 to-african-earth">
                <div className="absolute inset-0">
                    <img src={heroImage} alt="Logement" className="w-full h-full object-cover opacity-30" />
                </div>
                <div className="relative z-10 px-6 py-16 md:py-24 text-center text-white">
                    <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                        Trouvez rapidement un logement fiable et sécurisé au Cameroun
                    </h1>
                    <p className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                        Maisons, appartements, studios et locaux commerciaux à louer partout au Cameroun, sans perte de temps ni mauvaises surprises.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-white text-african-earth hover:bg-white/90"
                            onClick={() => navigateToSection('biens')}
                        >
                            🔘 Trouver un logement
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/20"
                            onClick={() => navigateToSection('deposer')}
                        >
                            🔘 Propriétaire ? Déposer un bien
                        </Button>
                    </div>
                </div>
            </section>

            {/* Qui sommes-nous */}
            <section className="bg-secondary/50 rounded-2xl p-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-center">
                    Qui sommes-nous ?
                </h2>
                <p className="text-muted-foreground text-center max-w-3xl mx-auto text-lg">
                    Nous sommes une agence immobilière spécialisée dans la location de domiciles au Cameroun.
                    Notre rôle est de mettre en relation des propriétaires sérieux et des locataires fiables, en toute transparence.
                </p>
            </section>

            {/* Pourquoi passer par nous */}
            <section>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
                    Pourquoi passer par nous ?
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {guarantees.map((item, index) => (
                        <Card key={index} className="text-center hover:shadow-card transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-14 h-14 mx-auto rounded-full bg-african-earth/10 flex items-center justify-center mb-4">
                                    <item.icon className="h-7 w-7 text-african-earth" />
                                </div>
                                <p className="font-medium text-sm">{item.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );

    const renderBiens = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                    Biens à Louer
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Découvrez une large sélection de logements disponibles à la location : studios, appartements, maisons et locaux professionnels.
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtrer les biens
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            {showFilters ? 'Masquer' : 'Afficher'}
                        </Button>
                    </div>
                </CardHeader>
                {showFilters && (
                    <CardContent className="pt-4">
                        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label>Ville</Label>
                                <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })}>
                                    <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
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
                                    <SelectTrigger><SelectValue placeholder={filters.city === 'all' ? "Choisir une ville" : "Tous"} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les quartiers</SelectItem>
                                        {filters.city !== 'all' && QUARTIERS_BY_CITY[filters.city]?.map((q) => (
                                            <SelectItem key={q} value={q}>{q}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Budget</Label>
                                <Select value={filters.budget} onValueChange={(v) => setFilters({ ...filters, budget: v })}>
                                    <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les budgets</SelectItem>
                                        {BUDGET_RANGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Type de bien</Label>
                                <Select value={filters.typeBien} onValueChange={(v) => setFilters({ ...filters, typeBien: v })}>
                                    <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les types</SelectItem>
                                        {TYPES_LOGEMENT.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Chambres</Label>
                                <Select value={filters.rooms} onValueChange={(v) => setFilters({ ...filters, rooms: v })}>
                                    <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes</SelectItem>
                                        <SelectItem value="1">1 chambre</SelectItem>
                                        <SelectItem value="2">2 chambres</SelectItem>
                                        <SelectItem value="3">3 chambres</SelectItem>
                                        <SelectItem value="4">4+ chambres</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" onClick={resetFilters}>
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Listings */}
            {loadingListings ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-secondary rounded-t-xl" />
                            <CardContent className="p-4">
                                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                                <div className="h-4 bg-secondary rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredListings.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-all group">
                            <div className="relative h-48 bg-secondary">
                                {listing.photos && listing.photos.length > 0 ? (
                                    <img
                                        src={listing.photos[0]}
                                        alt={listing.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Building2 className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                )}
                                <Badge className="absolute top-3 right-3 bg-african-earth text-white">
                                    {listing.type_logement}
                                </Badge>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                                <div className="flex items-center text-muted-foreground text-sm mb-2">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {listing.city || 'Douala'} - {listing.quartier}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                    {listing.rooms && (
                                        <span className="flex items-center gap-1">
                                            <DoorOpen className="h-4 w-4" />
                                            {listing.rooms} ch.
                                        </span>
                                    )}
                                    {listing.surface && (
                                        <span className="flex items-center gap-1">
                                            <Ruler className="h-4 w-4" />
                                            {listing.surface}m²
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {listing.views}
                                    </span>
                                </div>
                                <p className="text-african-earth font-bold text-xl mb-4">
                                    {listing.price?.toLocaleString()} FCFA
                                    <span className="text-muted-foreground text-sm font-normal"> / mois</span>
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/habitations/${listing.id}`}>Détails</Link>
                                    </Button>
                                    <Button variant="cta" size="sm" onClick={() => handleSelectListing(listing)}>
                                        Visiter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-heading text-xl font-semibold mb-2">Aucun bien trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                        Aucun logement ne correspond à vos critères. Essayez de modifier les filtres.
                    </p>
                    <Button variant="outline" onClick={resetFilters}>
                        Réinitialiser les filtres
                    </Button>
                </div>
            )
            }

            {/* Visit Request Form */}
            <div id="visit-form">
                <Card className="mt-8 bg-gradient-to-r from-african-earth/5 to-accent/5">
                    <CardHeader>
                        <CardTitle>Demander une visite</CardTitle>
                        <CardDescription>
                            Remplissez le formulaire ci-dessous et un agent vous contactera rapidement pour organiser une visite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVisitSubmit} className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="visitNom">Nom *</Label>
                                <Input
                                    id="visitNom"
                                    placeholder="Jean Dupont"
                                    value={visitForm.nom}
                                    onChange={(e) => setVisitForm({ ...visitForm, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visitTel">Téléphone *</Label>
                                <Input
                                    id="visitTel"
                                    placeholder="+237 6XX XXX XXX"
                                    value={visitForm.telephone}
                                    onChange={(e) => setVisitForm({ ...visitForm, telephone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visitEmail">Email</Label>
                                <Input
                                    id="visitEmail"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={visitForm.email}
                                    onChange={(e) => setVisitForm({ ...visitForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visitVille">Ville recherchée</Label>
                                <Select
                                    value={visitForm.villeRecherchee}
                                    onValueChange={(v) => setVisitForm({ ...visitForm, villeRecherchee: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="visitBudget">Budget</Label>
                                <Select
                                    value={visitForm.budget}
                                    onValueChange={(v) => setVisitForm({ ...visitForm, budget: v })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Sélectionner votre budget" /></SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_RANGES.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {visitForm.listing_title && (
                                <div className="md:col-span-2 p-3 bg-white/50 rounded-lg border border-african-earth/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Logement sélectionné</p>
                                        <p className="font-medium text-african-earth">{visitForm.listing_title}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setVisitForm(prev => ({ ...prev, listing_title: '', listing_link: '', landlord_id: '' }))}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <Button type="submit" variant="cta" className="w-full" disabled={visitLoading}>
                                    {visitLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Envoi...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Envoyer ma demande
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderDeposer = () => (
        <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                        Confiez-nous votre bien, trouvez rapidement un locataire sérieux
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Vous êtes propriétaire d'une maison, d'un appartement ou d'un local commercial ?
                        Nous vous aidons à trouver un locataire fiable et à sécuriser votre location.
                    </p>
                    <div className="space-y-4">
                        {ownerAdvantages.map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                    <item.icon className="h-5 w-5 text-african-earth" />
                                </div>
                                <span className="font-medium">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hidden lg:block">
                    <img src={ownerImage} alt="Propriétaire" className="rounded-2xl shadow-card" />
                </div>
            </div>

            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Déposer votre bien</CardTitle>
                    <CardDescription>Remplissez ce formulaire et nous vous contacterons</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleOwnerSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ownerNom">Nom complet *</Label>
                                <Input
                                    id="ownerNom"
                                    placeholder="Jean Dupont"
                                    value={ownerForm.nom}
                                    onChange={(e) => setOwnerForm({ ...ownerForm, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerTel">Téléphone *</Label>
                                <Input
                                    id="ownerTel"
                                    placeholder="+237 6XX XXX XXX"
                                    value={ownerForm.telephone}
                                    onChange={(e) => setOwnerForm({ ...ownerForm, telephone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ownerVille">Ville</Label>
                            <Select
                                value={ownerForm.ville}
                                onValueChange={(v) => setOwnerForm({ ...ownerForm, ville: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une ville" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="typeBien">Type de bien</Label>
                                <Select
                                    value={ownerForm.typeBien}
                                    onValueChange={(v) => setOwnerForm({ ...ownerForm, typeBien: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPES_LOGEMENT.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meuble">État (Meublé ?)</Label>
                                <Select
                                    value={ownerForm.meuble}
                                    onValueChange={(v) => setOwnerForm({ ...ownerForm, meuble: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="oui">Meublé</SelectItem>
                                        <SelectItem value="non">Non meublé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="loyer">Loyer souhaité (FCFA/mois)</Label>
                            <Input
                                id="loyer"
                                type="number"
                                placeholder="100000"
                                value={ownerForm.loyer}
                                onChange={(e) => setOwnerForm({ ...ownerForm, loyer: e.target.value })}
                            />
                        </div>
                        <Button type="submit" variant="cta" className="w-full" disabled={ownerLoading}>
                            {ownerLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Envoi en cours...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    Déposer mon bien
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    const renderServices = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Nos Services</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Une gamme complète de services immobiliers pour vous accompagner
                </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesList.map((service, index) => (
                    <Card key={index} className="hover:shadow-card transition-shadow">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-african-earth to-african-earth/80 flex items-center justify-center mb-4">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-heading font-semibold text-lg mb-2">{service.title}</h3>
                            <p className="text-muted-foreground text-sm">{service.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderAPropos = () => (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">À Propos</h2>
            </div>
            <Card className="shadow-card">
                <CardContent className="p-8">
                    <div className="prose prose-lg max-w-none text-center">
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            Notre ambition est de <strong>simplifier l'accès au logement au Cameroun</strong> grâce à un service immobilier moderne, fiable et professionnel.
                        </p>
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
                Nos articles et conseils immobiliers arrivent bientôt.
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2 inline" />
                Bientôt disponible
            </Badge>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">Contactez-nous</h2>
                <p className="text-muted-foreground">Nous sommes à votre écoute</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <a href="tel:+237690000000" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                                <div className="w-12 h-12 rounded-full bg-african-earth/10 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-african-earth" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-medium">+237 690 000 000</p>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                                    <p className="font-medium">+237 690 000 000</p>
                                </div>
                            </div>
                            <a href="mailto:contact@lebonpetit.cm" className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">contact@lebonpetit.cm</p>
                                </div>
                            </a>
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Adresse</p>
                                    <p className="font-medium">Douala, Cameroun</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-heading font-semibold mb-4">Suivez-nous</h3>
                            <div className="flex gap-4">
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Facebook className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Instagram className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Twitter className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Envoyez-nous un message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactNom">Nom complet *</Label>
                                <Input
                                    id="contactNom"
                                    placeholder="Jean Dupont"
                                    value={contactForm.nom}
                                    onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactSujet">Sujet</Label>
                                <Input
                                    id="contactSujet"
                                    placeholder="Demande d'information"
                                    value={contactForm.sujet}
                                    onChange={(e) => setContactForm({ ...contactForm, sujet: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactMessage">Message *</Label>
                                <Textarea
                                    id="contactMessage"
                                    placeholder="Votre message..."
                                    className="min-h-[120px]"
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="cta" className="w-full" disabled={contactLoading}>
                                {contactLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Envoi...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Envoyer le message
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
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
          `}
                >
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="font-heading text-2xl font-bold text-african-earth">
                                Le Bon Petit <span className="text-secondary-foreground block text-sm font-normal">Logement Non Meublé</span>
                            </h2>
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
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive
                                                ? 'bg-african-earth text-white shadow-md'
                                                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                            }
                    `}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t bg-secondary/30">
                            <p className="text-xs text-center text-muted-foreground">
                                © 2024 Le Bon Petit Services
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Mobile Header */}
                    <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between">
                        <span className="font-heading font-bold text-lg">Menu</span>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeSection === 'accueil' && renderAccueil()}
                            {activeSection === 'biens' && renderBiens()}
                            {activeSection === 'deposer' && renderDeposer()}
                            {activeSection === 'services' && renderServices()}
                            {activeSection === 'apropos' && renderAPropos()}
                            {activeSection === 'blog' && renderBlog()}
                            {activeSection === 'contact' && renderContact()}
                        </div>
                    </div>
                </main>
            </div>
            <WhatsAppButton
                phoneNumber="+237690000000"
                message="Bonjour, je cherche un logement non meublé"
            />
        </Layout>
    );
}
