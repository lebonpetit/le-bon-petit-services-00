import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout, adminNavItems } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase, User, Listing, ServiceRequest, Subscription } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users, Building2, Package, Flame, Shirt, Trash2,
    CheckCircle, XCircle, Eye, Search,
    CreditCard, Clock, AlertTriangle, TrendingUp
} from 'lucide-react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<(User & { subscription?: Subscription })[]>([]);
    const [landlords, setLandlords] = useState<(User & { listingsCount?: number })[]>([]);
    const [listings, setListings] = useState<Listing[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        pendingTenants: 0,
        totalLandlords: 0,
        totalListings: 0,
        totalRequests: 0,
        newRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch tenants with subscriptions
            const { data: tenantsData } = await supabase
                .from('users')
                .select('*, subscriptions(*)')
                .eq('role', 'tenant')
                .order('created_at', { ascending: false });

            // Fetch landlords
            const { data: landlordsData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'landlord')
                .order('created_at', { ascending: false });

            // Fetch listings
            const { data: listingsData } = await supabase
                .from('listings')
                .select('*, owner:users(*)')
                .order('views', { ascending: false });

            // Fetch requests
            const { data: requestsData } = await supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false });

            // Process tenants with their latest subscription
            const processedTenants = tenantsData?.map(t => ({
                ...t,
                subscription: t.subscriptions?.[0]
            })) || [];

            setTenants(processedTenants);
            setLandlords(landlordsData || []);
            setListings(listingsData || []);
            setRequests(requestsData || []);

            // Calculate stats
            setStats({
                totalTenants: processedTenants.length,
                activeTenants: processedTenants.filter(t => t.status === 'active').length,
                pendingTenants: processedTenants.filter(t => t.status === 'pending').length,
                totalLandlords: landlordsData?.length || 0,
                totalListings: listingsData?.length || 0,
                totalRequests: requestsData?.length || 0,
                newRequests: requestsData?.filter(r => r.status === 'new').length || 0,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger les données",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateTenantStatus = async (tenantId: string, status: 'active' | 'blocked' | 'pending') => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ status })
                .eq('id', tenantId);

            if (error) throw error;

            setTenants(tenants.map(t => t.id === tenantId ? { ...t, status } : t));
            toast({
                title: "Statut mis à jour",
                description: `Le compte a été ${status === 'active' ? 'activé' : status === 'blocked' ? 'bloqué' : 'mis en attente'}`,
            });
        } catch (error) {
            console.error('Error updating tenant status:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de mettre à jour le statut",
            });
        }
    };

    const updateRequestStatus = async (requestId: string, status: 'processed') => {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ status })
                .eq('id', requestId);

            if (error) throw error;

            setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
            toast({
                title: "Demande traitée",
                description: "La demande a été marquée comme traitée",
            });
        } catch (error) {
            console.error('Error updating request status:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de mettre à jour le statut",
            });
        }
    };

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'colis': return <Package className="h-4 w-4" />;
            case 'gaz': return <Flame className="h-4 w-4" />;
            case 'lessive': return <Shirt className="h-4 w-4" />;
            case 'poubelles': return <Trash2 className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getServiceColor = (type: string) => {
        switch (type) {
            case 'colis': return 'bg-african-green';
            case 'gaz': return 'bg-african-red';
            case 'lessive': return 'bg-african-yellow text-foreground';
            case 'poubelles': return 'bg-primary';
            default: return 'bg-muted';
        }
    };

    const filteredRequests = requests.filter(r =>
        r.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact_phone.includes(searchTerm) ||
        r.service_type.includes(searchTerm.toLowerCase())
    );

    const pathToTab = (pathname: string) => {
        if (pathname === '/admin/landlords') return 'landlords';
        if (pathname === '/admin/listings') return 'listings';
        if (pathname === '/admin/requests') return 'requests';
        if (pathname === '/admin/settings') return 'settings';
        if (pathname === '/admin/tenants') return 'tenants';
        return 'tenants';
    };

    const tabToPath = (tab: string) => {
        switch (tab) {
            case 'landlords':
                return '/admin/landlords';
            case 'listings':
                return '/admin/listings';
            case 'requests':
                return '/admin/requests';
            case 'settings':
                return '/admin/settings';
            case 'tenants':
            default:
                return '/admin/tenants';
        }
    };

    const activeTab = pathToTab(location.pathname);

    const handleTabChange = (nextTab: string) => {
        const nextPath = tabToPath(nextTab);
        if (nextPath !== location.pathname) {
            navigate(nextPath);
        }
    };

    return (
        <DashboardLayout
            title="Administration"
            subtitle="Gérez la plateforme Le Bon Petit"
            navItems={adminNavItems}
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-african-green/10 to-african-green/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-african-green/20 flex items-center justify-center">
                                <Users className="h-5 w-5 text-african-green" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Locataires</p>
                                <p className="font-heading text-xl font-bold">{stats.totalTenants}</p>
                                <p className="text-xs text-african-green">{stats.activeTenants} actifs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Bailleurs</p>
                                <p className="font-heading text-xl font-bold">{stats.totalLandlords}</p>
                                <p className="text-xs text-muted-foreground">{stats.totalListings} logements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-african-yellow/10 to-african-yellow/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-african-yellow/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-african-yellow" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">En attente</p>
                                <p className="font-heading text-xl font-bold">{stats.pendingTenants}</p>
                                <p className="text-xs text-african-yellow">paiements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-african-red/10 to-african-red/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-african-red/20 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-african-red" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Demandes</p>
                                <p className="font-heading text-xl font-bold">{stats.totalRequests}</p>
                                <p className="text-xs text-african-red">{stats.newRequests} nouvelles</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Tenants Alert - Show prominently if there are pending tenants */}
            {stats.pendingTenants > 0 && (
                <Card className="mb-6 border-african-yellow bg-african-yellow/10">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-african-yellow/20 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="h-6 w-6 text-african-yellow" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                                    {stats.pendingTenants} locataire(s) en attente de validation
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Ces locataires se sont inscrits et attendent que vous validiez leur paiement pour activer leur compte.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {tenants.filter(t => t.status === 'pending').slice(0, 5).map(tenant => (
                                        <div key={tenant.id} className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                                            <div>
                                                <p className="text-sm font-medium">{tenant.name}</p>
                                                <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-african-green border-african-green hover:bg-african-green hover:text-white"
                                                onClick={() => updateTenantStatus(tenant.id, 'active')}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Valider
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="tenants" className="relative">
                        Locataires
                        {stats.pendingTenants > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-african-red text-white text-xs rounded-full flex items-center justify-center">
                                {stats.pendingTenants}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="landlords">Bailleurs</TabsTrigger>
                    <TabsTrigger value="listings">Logements</TabsTrigger>
                    <TabsTrigger value="requests" className="relative">
                        Demandes
                        {stats.newRequests > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-african-red text-white text-xs rounded-full flex items-center justify-center">
                                {stats.newRequests}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>

                {/* Tenants Tab */}
                <TabsContent value="tenants">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Gestion des Locataires
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Inscription</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">{tenant.name}</TableCell>
                                            <TableCell>{tenant.email}</TableCell>
                                            <TableCell>{tenant.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    tenant.status === 'active' ? 'default' :
                                                        tenant.status === 'pending' ? 'secondary' : 'destructive'
                                                }>
                                                    {tenant.status === 'active' ? 'Actif' :
                                                        tenant.status === 'pending' ? 'En attente' : 'Bloqué'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(tenant.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {tenant.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-african-green"
                                                            onClick={() => updateTenantStatus(tenant.id, 'active')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Valider
                                                        </Button>
                                                    )}
                                                    {tenant.status === 'active' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive"
                                                            onClick={() => updateTenantStatus(tenant.id, 'blocked')}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Bloquer
                                                        </Button>
                                                    )}
                                                    {tenant.status === 'blocked' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateTenantStatus(tenant.id, 'active')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Débloquer
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Landlords Tab */}
                <TabsContent value="landlords">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Gestion des Bailleurs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Inscription</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {landlords.map((landlord) => (
                                        <TableRow key={landlord.id}>
                                            <TableCell className="font-medium">{landlord.name}</TableCell>
                                            <TableCell>{landlord.email}</TableCell>
                                            <TableCell>{landlord.phone}</TableCell>
                                            <TableCell>{new Date(landlord.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Listings Tab */}
                <TabsContent value="listings">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Logements les plus vus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Quartier</TableHead>
                                        <TableHead>Prix</TableHead>
                                        <TableHead>Vues</TableHead>
                                        <TableHead>Propriétaire</TableHead>
                                        <TableHead>Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listings.slice(0, 20).map((listing) => (
                                        <TableRow key={listing.id}>
                                            <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
                                            <TableCell>{listing.quartier}</TableCell>
                                            <TableCell>{listing.price?.toLocaleString()} FCFA</TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-4 w-4" />
                                                    {listing.views}
                                                </span>
                                            </TableCell>
                                            <TableCell>{listing.owner?.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={listing.available ? 'default' : 'secondary'}>
                                                    {listing.available ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Demandes de Services
                                </CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <Badge className={getServiceColor(request.service_type)}>
                                                    <span className="flex items-center gap-1">
                                                        {getServiceIcon(request.service_type)}
                                                        {request.service_type.charAt(0).toUpperCase() + request.service_type.slice(1)}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{request.contact_name}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={`https://wa.me/${request.contact_phone.replace(/\s/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    {request.contact_phone}
                                                </a>
                                            </TableCell>
                                            <TableCell>{new Date(request.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>
                                                <Badge variant={request.status === 'new' ? 'destructive' : 'default'}>
                                                    {request.status === 'new' ? 'Nouveau' : 'Traité'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Détails
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-lg">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Détails de la demande</AlertDialogTitle>
                                                                <AlertDialogDescription asChild>
                                                                    <div className="text-left space-y-2 mt-4">
                                                                        <pre className="bg-secondary p-4 rounded-lg text-sm overflow-auto max-h-64">
                                                                            {JSON.stringify(request.payload, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Fermer</AlertDialogCancel>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    {request.status === 'new' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-african-green"
                                                            onClick={() => updateRequestStatus(request.id, 'processed')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Traiter
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Paramètres
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Cette section sera disponible bientôt.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
