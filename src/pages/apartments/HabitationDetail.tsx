import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    MapPin,
    Eye,
    Calendar,
    Home,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Phone,
    Droplets,
    Zap,
    Car,
    Ruler,
    DoorOpen,
    Send,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { SEO } from '@/components/SEO';

const budgetRanges = [
    { value: "0-50000", label: "Moins de 50 000 FCFA" },
    { value: "50000-100000", label: "50 000 - 100 000 FCFA" },
    { value: "100000-200000", label: "100 000 - 200 000 FCFA" },
    { value: "200000-500000", label: "200 000 - 500 000 FCFA" },
    { value: "500000+", label: "Plus de 500 000 FCFA" },
];

export default function HabitationDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const { toast } = useToast();

    // Visit request form
    const [visitForm, setVisitForm] = useState({
        nom: '',
        telephone: '',
        email: '',
        budget: '',
    });
    const [visitLoading, setVisitLoading] = useState(false);
    const [showVisitForm, setShowVisitForm] = useState(false);

    useEffect(() => {
        if (id) {
            fetchListing();
        }
    }, [id]);

    useEffect(() => {
        if (listing) {
            incrementViews();
        }
    }, [listing?.id]);

    const fetchListing = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*, owner:users(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setListing(data);
        } catch (error) {
            console.error('Error fetching listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger le logement",
            });
        } finally {
            setLoading(false);
        }
    };

    const incrementViews = async () => {
        try {
            await supabase.rpc('increment_listing_views', { listing_id: id });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };

    const handleVisitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (visitLoading) return;

        setVisitLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'logement',
                payload: {
                    ...visitForm,
                    type: 'demande_visite_habitation',
                    listing_id: listing?.id,
                    listing_title: listing?.title,
                },
                contact_name: visitForm.nom,
                contact_phone: visitForm.telephone,
                status: 'new',
                landlord_id: listing?.owner_id || null,
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée !",
                description: "Un agent vous contactera pour organiser la visite.",
            });
            setVisitForm({ nom: '', telephone: '', email: '', budget: '' });
            setShowVisitForm(false);
        } catch (error) {
            console.error('Error submitting visit request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer la demande.",
            });
        } finally {
            setVisitLoading(false);
        }
    };

    const nextPhoto = () => {
        if (listing?.photos) {
            setCurrentPhoto((prev) => (prev + 1) % listing.photos.length);
        }
    };

    const prevPhoto = () => {
        if (listing?.photos) {
            setCurrentPhoto((prev) => (prev - 1 + listing.photos.length) % listing.photos.length);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-96 bg-secondary rounded-xl mb-6" />
                        <div className="h-8 bg-secondary rounded w-1/2 mb-4" />
                        <div className="h-4 bg-secondary rounded w-1/4" />
                    </div>
                </div>
                <WhatsAppButton />
            </Layout>
        );
    }

    if (!listing) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8 text-center">
                    <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-heading text-2xl font-bold mb-2">Logement introuvable</h2>
                    <p className="text-muted-foreground mb-4">Ce logement n'existe pas ou a été supprimé</p>
                    <Button variant="cta" onClick={() => navigate('/habitations')}>
                        Retour aux logements
                    </Button>
                </div>
                <WhatsAppButton />
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={listing.title}
                description={listing.description?.slice(0, 160) || `Logement non-meublé à louer à ${listing.quartier}, Douala`}
                image={listing.photos?.[0]}
                type="article"
            />
            <div className="toghu-pattern min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/habitations')}
                            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux logements
                        </button>
                    </div>

                    {/* Photo Gallery */}
                    <div className="relative h-72 md:h-96 bg-secondary rounded-2xl overflow-hidden mb-6 group">
                        {listing.photos && listing.photos.length > 0 ? (
                            <>
                                <img
                                    src={listing.photos[currentPhoto]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                />
                                {listing.photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevPhoto}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={nextPhoto}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {listing.photos.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentPhoto(index)}
                                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentPhoto ? 'bg-white' : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Home className="h-24 w-24 text-muted-foreground" />
                            </div>
                        )}
                        <Badge className="absolute top-4 right-4 bg-african-earth text-white">
                            {listing.type_logement}
                        </Badge>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                                    {listing.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {listing.city || 'Douala'} - {listing.quartier}{listing.rue && `, ${listing.rue}`}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {listing.views} vues
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-semibold mb-4">Description</h2>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {listing.description ||
                                            "Ce logement offre un cadre calme et sécurisé, idéal pour une habitation familiale ou professionnelle."}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Key Information */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-semibold mb-4">Informations clés</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                            <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                <Home className="h-5 w-5 text-african-earth" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">État</p>
                                                <p className="font-medium">{listing.furnished ? 'Meublé' : 'Non meublé'}</p>
                                            </div>
                                        </div>
                                        {listing.surface && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                                <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                    <Ruler className="h-5 w-5 text-african-earth" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Surface</p>
                                                    <p className="font-medium">{listing.surface} m²</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                            <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                <DoorOpen className="h-5 w-5 text-african-earth" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Chambres</p>
                                                <p className="font-medium">{listing.rooms || 1}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                            <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                <Droplets className="h-5 w-5 text-african-earth" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Eau</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    {listing.has_water !== false ? (
                                                        <><CheckCircle className="h-4 w-4 text-green-500" /> Disponible</>
                                                    ) : (
                                                        <><XCircle className="h-4 w-4 text-red-500" /> Non disponible</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                            <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-african-earth" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Électricité</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    {listing.has_electricity !== false ? (
                                                        <><CheckCircle className="h-4 w-4 text-green-500" /> Disponible</>
                                                    ) : (
                                                        <><XCircle className="h-4 w-4 text-red-500" /> Non disponible</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                            <div className="w-10 h-10 rounded-full bg-african-earth/10 flex items-center justify-center">
                                                <Car className="h-5 w-5 text-african-earth" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Parking</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    {listing.has_parking ? (
                                                        <><CheckCircle className="h-4 w-4 text-green-500" /> Disponible</>
                                                    ) : (
                                                        <><XCircle className="h-4 w-4 text-red-500" /> Non disponible</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Card */}
                        <div className="space-y-4">
                            <Card className="shadow-card sticky top-24">
                                <CardContent className="p-6">
                                    <p className="text-african-earth font-heading font-bold text-3xl mb-1">
                                        {listing.price?.toLocaleString()} FCFA
                                    </p>
                                    <p className="text-muted-foreground mb-6">par mois</p>

                                    {listing.owner && (
                                        <div className="p-4 rounded-xl bg-secondary mb-4">
                                            <p className="text-sm text-muted-foreground">Propriétaire</p>
                                            <p className="font-medium">{listing.owner.name}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Button
                                            variant="cta"
                                            className="w-full"
                                            onClick={() => setShowVisitForm(!showVisitForm)}
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Demander une visite
                                        </Button>

                                        <Button variant="outline" className="w-full" asChild>
                                            <a
                                                href={`https://wa.me/${listing.owner?.phone?.replace(/\s/g, '')}?text=Bonjour, je suis intéressé par le logement "${listing.title}" sur Le Bon Petit`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                WhatsApp - Contacter un agent
                                            </a>
                                        </Button>

                                        {listing.owner?.phone && (
                                            <Button variant="outline" className="w-full" asChild>
                                                <a href={`tel:${listing.owner.phone}`}>
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Appeler
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Visit Request Form */}
                            {showVisitForm && (
                                <Card className="shadow-card">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Demander une visite</CardTitle>
                                        <CardDescription>Remplissez ce formulaire pour planifier une visite</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleVisitSubmit} className="space-y-4">
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
                                                <Label>Budget mensuel</Label>
                                                <Select
                                                    value={visitForm.budget}
                                                    onValueChange={(v) => setVisitForm({ ...visitForm, budget: v })}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                                    <SelectContent>
                                                        {budgetRanges.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button type="submit" variant="cta" className="w-full" disabled={visitLoading}>
                                                {visitLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        Envoi...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Send className="h-4 w-4" />
                                                        Envoyer
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppButton
                phoneNumber={listing.owner?.phone || '+237690547084'}
                message={`Bonjour, je souhaite visiter le logement "${listing.title}"`}
            />
        </Layout>
    );
}
