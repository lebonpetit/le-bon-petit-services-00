import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Wifi,
    Wind,
    Tv,
    UtensilsCrossed,
    Car,
    Lock,
    MessageCircle,
    Phone,
} from 'lucide-react';
import { SEO } from '@/components/SEO';

const equipments = [
    { icon: Wifi, label: 'Wi-Fi' },
    { icon: Wind, label: 'Climatisation' },
    { icon: Tv, label: 'TV écran plat' },
    { icon: UtensilsCrossed, label: 'Cuisine équipée' },
    { icon: Car, label: 'Parking' },
    { icon: Lock, label: 'Sécurité' },
];

export default function ApartmentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const { toast } = useToast();

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
                description: "Impossible de charger l'appartement",
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
                    <h2 className="font-heading text-2xl font-bold mb-2">Appartement introuvable</h2>
                    <p className="text-muted-foreground mb-4">Cet appartement n'existe pas ou a été supprimé</p>
                    <Link to="/logements">
                        <Button variant="cta">Retour aux appartements</Button>
                    </Link>
                </div>
                <WhatsAppButton />
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={listing.title}
                description={listing.description?.slice(0, 160) || `Appartement meublé à louer à ${listing.quartier}, Douala`}
                image={listing.photos?.[0]}
                type="article"
            />
            <div className="african-pattern min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/logements')}
                            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour aux appartements
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
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className="bg-white/90 backdrop-blur text-primary border-none">
                                {listing.furnished ? 'Meublé' : 'Non meublé'}
                            </Badge>
                            <Badge className="bg-primary text-white border-none">
                                {listing.type_logement}
                            </Badge>
                        </div>
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
                                        {listing.quartier}{listing.rue && `, ${listing.rue}`}
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
                                            "Cet appartement meublé moderne est idéal pour les séjours professionnels, touristiques ou familiaux. Il offre un cadre calme, sécurisé et confortable."}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Equipments */}
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-heading text-xl font-semibold mb-4">Équipements</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {equipments.map((eq, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <eq.icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <span className="font-medium">{eq.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Card */}
                        <div className="space-y-4">
                            <Card className="shadow-card sticky top-24">
                                <CardContent className="p-6">
                                    <p className="text-primary font-heading font-bold text-3xl mb-1">
                                        {listing.price?.toLocaleString()} FCFA
                                    </p>
                                    <p className="text-muted-foreground mb-6">par nuit</p>

                                    {listing.owner && (
                                        <div className="p-4 rounded-xl bg-secondary mb-4">
                                            <p className="text-sm text-muted-foreground">Propriétaire</p>
                                            <p className="font-medium">{listing.owner.name}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Button variant="cta" className="w-full" asChild>
                                            <a
                                                href={`https://wa.me/${listing.owner?.phone?.replace(/\s/g, '')}?text=Bonjour, je suis intéressé par votre appartement "${listing.title}" sur Le Bon Petit`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Réserver maintenant
                                            </a>
                                        </Button>

                                        <Button variant="outline" className="w-full" asChild>
                                            <a
                                                href={`https://wa.me/${listing.owner?.phone?.replace(/\s/g, '')}?text=Bonjour, j'aimerais avoir plus d'informations sur l'appartement "${listing.title}"`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                WhatsApp – Parler à un agent
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
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppButton
                phoneNumber={listing.owner?.phone || '+237690547084'}
                message={`Bonjour, je souhaite réserver l'appartement "${listing.title}"`}
            />
        </Layout>
    );
}
