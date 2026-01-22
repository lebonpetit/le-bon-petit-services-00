import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout, tenantNavItems } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Search, Home, MapPin, Phone, Eye, Calendar } from 'lucide-react';
import { SEO } from '@/components/SEO';

const quartiersDouala = [
    "Tous les quartiers",
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
];

const typesLogement = [
    "Tous les types",
    "Studio",
    "Appartement",
    "Chambre",
    "Maison",
    "Villa",
];

export default function TenantDashboard() {
    const { user } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuartier, setSearchQuartier] = useState('Tous les quartiers');
    const [searchType, setSearchType] = useState('Tous les types');
    const [maxPrice, setMaxPrice] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchListings();
    }, [searchQuartier, searchType, maxPrice]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('listings')
                .select('*, owner:users(*)')
                .eq('available', true)
                .order('created_at', { ascending: false });

            if (searchQuartier !== 'Tous les quartiers') {
                query = query.eq('quartier', searchQuartier);
            }

            if (searchType !== 'Tous les types') {
                query = query.eq('type_logement', searchType);
            }

            if (maxPrice) {
                query = query.lte('price', parseInt(maxPrice));
            }

            const { data, error } = await query;

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger les logements",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Tableau de bord"
            subtitle="Trouvez le logement de vos rêves"
            navItems={tenantNavItems}
        >
            <SEO title="Espace Locataire | Le Bon Petit" />
            {/* Search Filters */}
            <Card className="mb-6 shadow-soft">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Search className="h-5 w-5" />
                        Rechercher un logement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">
                                Quartier
                            </label>
                            <Select value={searchQuartier} onValueChange={setSearchQuartier}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {quartiersDouala.map((q) => (
                                        <SelectItem key={q} value={q}>{q}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">
                                Type de logement
                            </label>
                            <Select value={searchType} onValueChange={setSearchType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {typesLogement.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">
                                Prix max (FCFA)
                            </label>
                            <Input
                                type="number"
                                placeholder="Ex: 100000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button variant="cta" className="w-full" onClick={fetchListings}>
                                <Search className="h-4 w-4 mr-2" />
                                Rechercher
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-muted-foreground">
                    {listings.length} logement{listings.length !== 1 ? 's' : ''} trouvé{listings.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Results */}
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
                        <h3 className="font-heading text-xl font-semibold mb-2">Aucun logement trouvé</h3>
                        <p className="text-muted-foreground">
                            Essayez de modifier vos critères de recherche
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-shadow duration-300 group">
                            <div className="relative h-48 bg-secondary">
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
                                <Badge className="absolute top-3 right-3 bg-african-green text-white">
                                    {listing.type_logement}
                                </Badge>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-heading font-semibold text-lg mb-1 line-clamp-1">
                                    {listing.title}
                                </h3>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{listing.quartier}</span>
                                </div>
                                <p className="text-primary font-heading font-bold text-xl mb-3">
                                    {listing.price?.toLocaleString()} FCFA<span className="text-sm font-normal text-muted-foreground">/mois</span>
                                </p>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {listing.views} vues
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link to={`/listings/${listing.id}`}>
                                            Voir détails
                                        </Link>
                                    </Button>
                                    <Button variant="cta" size="sm" asChild>
                                        <a href={`https://wa.me/${listing.owner?.phone?.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                                            <Phone className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
