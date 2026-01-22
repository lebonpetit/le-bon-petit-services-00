import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout, landlordNavItems } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Plus, Home, MapPin, Eye, Edit, Trash2, Building2, TrendingUp } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SEO } from '@/components/SEO';

export default function LandlordDashboard() {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalListings: 0, totalViews: 0, activeListings: 0 });
    const { toast } = useToast();

    useEffect(() => {
        if (user) {
            fetchListings();
        }
    }, [user]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('owner_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setListings(data || []);

            // Calculate stats
            const totalViews = data?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;
            const activeListings = data?.filter((l) => l.available).length || 0;
            setStats({
                totalListings: data?.length || 0,
                totalViews,
                activeListings,
            });
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger vos logements",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteListing = async (listingId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

            if (error) throw error;

            setListings(listings.filter((l) => l.id !== listingId));
            toast({
                title: "Logement supprimé",
                description: "Le logement a été supprimé avec succès",
            });
        } catch (error) {
            console.error('Error deleting listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de supprimer le logement",
            });
        }
    };

    const toggleAvailability = async (listing: Listing) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ available: !listing.available })
                .eq('id', listing.id);

            if (error) throw error;

            setListings(listings.map((l) =>
                l.id === listing.id ? { ...l, available: !l.available } : l
            ));

            toast({
                title: listing.available ? "Logement désactivé" : "Logement activé",
                description: listing.available
                    ? "Le logement n'est plus visible par les locataires"
                    : "Le logement est maintenant visible",
            });
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de modifier le statut",
            });
        }
    };

    return (
        <DashboardLayout
            title="Tableau de bord"
            subtitle="Gérez vos logements en toute simplicité"
            navItems={landlordNavItems}
        >
            <SEO title="Espace Bailleur | Le Bon Petit" />
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-african-green/10 to-african-green/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-african-green/20 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-african-green" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total logements</p>
                                <p className="font-heading text-2xl font-bold">{stats.totalListings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-african-yellow/10 to-african-yellow/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-african-yellow/20 flex items-center justify-center">
                                <Eye className="h-6 w-6 text-african-yellow" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vues totales</p>
                                <p className="font-heading text-2xl font-bold">{stats.totalViews}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Logements actifs</p>
                                <p className="font-heading text-2xl font-bold">{stats.activeListings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Listing Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold">Mes logements</h2>
                <Link to="/landlord/add-listing">
                    <Button variant="cta">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un logement
                    </Button>
                </Link>
            </div>

            {/* Listings */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="h-48 bg-secondary rounded-t-lg" />
                            <CardContent className="p-4">
                                <div className="h-6 bg-secondary rounded mb-2" />
                                <div className="h-4 bg-secondary rounded w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-heading text-xl font-semibold mb-2">Aucun logement publié</h3>
                        <p className="text-muted-foreground mb-4">
                            Commencez par ajouter votre premier logement
                        </p>
                        <Link to="/landlord/add-listing">
                            <Button variant="cta">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un logement
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-shadow duration-300 group">
                            <Link to={`/listings/${listing.id}`} className="block">
                                <div className="relative h-48 bg-secondary cursor-pointer hover:opacity-90 transition-opacity">
                                    {listing.photos && listing.photos.length > 0 ? (
                                        <img
                                            src={listing.photos[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Home className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}
                                    <Badge
                                        className={`absolute top-3 right-3 ${listing.available ? 'bg-african-green' : 'bg-muted'}`}
                                    >
                                        {listing.available ? 'Actif' : 'Inactif'}
                                    </Badge>
                                    {listing.photos && listing.photos.length > 1 && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                                            +{listing.photos.length - 1} photos
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <CardContent className="p-4">
                                <Link to={`/listings/${listing.id}`} className="hover:text-primary transition-colors">
                                    <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">
                                        {listing.title}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{listing.quartier}</span>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-primary font-heading font-bold text-xl">
                                        {listing.price?.toLocaleString()} FCFA
                                    </p>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Eye className="h-4 w-4" />
                                        {listing.views} vues
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => toggleAvailability(listing)}
                                    >
                                        {listing.available ? 'Désactiver' : 'Activer'}
                                    </Button>
                                    <Link to={`/landlord/edit-listing/${listing.id}`}>
                                        <Button variant="outline" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer ce logement ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. Le logement sera définitivement supprimé.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                                                    Supprimer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
