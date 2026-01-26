import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout, adminNavItems } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, User, Listing, ServiceRequest, Subscription, Message } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users, Building2, Package, Flame, Shirt, Trash2, Sparkles,
    CheckCircle, XCircle, Eye, Search, Trash, Phone, Mail, MapPin,
    CreditCard, Clock, AlertTriangle, TrendingUp, RefreshCw, Calendar,
    MessageCircle, ExternalLink, ToggleLeft, Save, Home, Settings, Truck, BarChart2
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { AnalyticsTab } from './AnalyticsTab';

// Labels français pour les champs de demande
const fieldLabels: Record<string, string> = {
    nom: 'Nom',
    prenom: 'Prénom',
    whatsapp: 'WhatsApp',
    quartier: 'Quartier',
    rue: 'Rue / Repère',
    marqueBouteille: 'Marque de bouteille',
    tailleBouteille: 'Taille de bouteille',
    quantite: 'Quantité',
    possedeBouteille: 'Possède une bouteille',
    dateLivraison: 'Date de livraison',
    creneauHoraire: 'Créneau horaire',
    dateIntervention: 'Date d\'intervention',
    details: 'Détails supplémentaires',
    servicesNettoyage: 'Services de nettoyage',
    servicesAntiparasitaires: 'Services antiparasitaires',
    typeVetement: 'Type de vêtement',
    nombrePieces: 'Nombre de pièces',
    typePoubelle: 'Type de poubelle',
    frequence: 'Fréquence',
    adresseRecuperation: 'Adresse de récupération',
    adresseLivraison: 'Adresse de livraison',
    poids: 'Poids estimé',
    contenu: 'Contenu du colis',
    destinataire: 'Destinataire',
    telephoneDestinataire: 'Téléphone destinataire',
    type: 'Type de demande',
    description: 'Description du besoin',
    adresse: 'Adresse / Quartier',
    service_demande: 'Service souhaité',
    // Déménagement fields
    typeService: 'Type de service',
    datePreferee: 'Date préférée',
    depart: 'Adresse de départ',
    arrivee: 'Adresse d\'arrivée',
    original_service: 'Service d\'origine',
    // Logement fields
    logementType: 'Type de logement',
    budget: 'Budget',
    ville: 'Ville',
    rooms: 'Nombre de pièces',
    searchType: 'Type de recherche',
    listing_title: 'Logement sélectionné',
    listing_link: 'Lien du logement',
    dateDebut: 'Date d\'arrivée',
    dateFin: 'Date de départ',
    personnes: 'Nombre de voyageurs',
    email: 'Email',
    landlord_id: 'Propriétaire',
};

// Traductions des valeurs de type de demande
const typeValueLabels: Record<string, string> = {
    reservation_appartement: 'Réservation d\'appartement',
    proposition_proprietaire: 'Proposition de propriétaire',
    contact_appartement: 'Contact appartement',
    demande_gaz: 'Commande de gaz',
    demande_colis: 'Envoi de colis',
    demande_lessive: 'Service de lessive',
    demande_poubelles: 'Collecte de poubelles',
    demande_nettoyage: 'Service de nettoyage',
    demande_demenagement: 'Déménagement',
};

// Labels pour les services de nettoyage
const nettoyageLabels: Record<string, string> = {
    bureaux: 'Nettoyage de bureaux',
    domiciles: 'Nettoyage de domiciles',
    canapes: 'Nettoyage de canapés',
    tapis: 'Nettoyage de tapis',
    chaises: 'Nettoyage de chaises',
    matelas: 'Nettoyage de matelas',
    vehicules: 'Nettoyage de véhicules',
    deratisation: 'Dératisation',
    desinsectisation: 'Désinsectisation',
    fumigation: 'Fumigation',
    desinfection: 'Désinfection',
};

const serviceTypeLabels: Record<string, string> = {
    colis: 'Colis',
    gaz: 'Gaz',
    lessive: 'Lessive',
    poubelles: 'Poubelles',
    nettoyage: 'Nettoyage',
    logement: 'Logement',
    demenagement: 'Déménagement',
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [tenants, setTenants] = useState<(User & { subscription?: Subscription })[]>([]);
    const [landlords, setLandlords] = useState<(User & { listingsCount?: number })[]>([]);
    const [listings, setListings] = useState<Listing[]>([]);
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [messages, setMessages] = useState<(Message & { sender?: User; receiver?: User; listing?: Listing })[]>([]);
    const [requestTab, setRequestTab] = useState('all');
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        pendingTenants: 0,
        totalLandlords: 0,
        totalListings: 0,
        activeListings: 0,
        totalRequests: 0,
        newRequests: 0,
        totalMessages: 0,
        unreadMessages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tenantsSearchTerm, setTenantsSearchTerm] = useState('');
    const [landlordsSearchTerm, setLandlordsSearchTerm] = useState('');
    const [listingsSearchTerm, setListingsSearchTerm] = useState('');
    const [serviceFilter, setServiceFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [landlordFilter, setLandlordFilter] = useState<string>('all');
    const [destinationFilter, setDestinationFilter] = useState<string>('admin');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

    // Settings states
    const [platformSettings, setPlatformSettings] = useState({
        company_name: 'Le Bon Petit',
        contact_phone: '+237 6XX XXX XXX',
        contact_email: 'contact@lebonpetit237.com',
        whatsapp: '+237 6XX XXX XXX',
        address: 'Douala, Cameroun',
    });
    const [servicesSettings, setServicesSettings] = useState<Record<string, boolean>>({
        colis: true,
        gaz: true,
        lessive: true,
        poubelles: true,
        nettoyage: true,
    });
    const [subscriptionSettings, setSubscriptionSettings] = useState({
        price: 2000,
        duration_days: 30,
        trial_days: 0,
    });
    const [savingSettings, setSavingSettings] = useState(false);
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

            // Fetch landlords with listings count
            const { data: landlordsData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'landlord')
                .order('created_at', { ascending: false });

            // Fetch listings
            const { data: listingsData } = await supabase
                .from('listings')
                .select('*, owner:users(*)')
                .order('created_at', { ascending: false });

            // Fetch requests
            const { data: requestsData } = await supabase
                .from('requests')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch messages with sender and receiver info
            const { data: messagesData } = await supabase
                .from('messages')
                .select('*, sender:from_user(id, name, email, role), receiver:to_user(id, name, email, role)')
                .order('created_at', { ascending: false })
                .limit(100);

            // Process tenants with their latest subscription
            const processedTenants = tenantsData?.map(t => ({
                ...t,
                subscription: t.subscriptions?.[0]
            })) || [];

            // Process landlords with listings count
            const processedLandlords = landlordsData?.map(l => ({
                ...l,
                listingsCount: listingsData?.filter(listing => listing.owner_id === l.id).length || 0
            })) || [];

            setTenants(processedTenants);
            setLandlords(processedLandlords);
            setListings(listingsData || []);
            setRequests(requestsData || []);
            setMessages(messagesData || []);

            // Calculate stats
            setStats({
                totalTenants: processedTenants.length,
                activeTenants: processedTenants.filter(t => t.status === 'active').length,
                pendingTenants: processedTenants.filter(t => t.status === 'pending').length,
                totalLandlords: processedLandlords.length,
                totalListings: listingsData?.length || 0,
                activeListings: listingsData?.filter(l => l.available).length || 0,
                totalRequests: requestsData?.length || 0,
                newRequests: requestsData?.filter(r => r.status === 'new').length || 0,
                totalMessages: messagesData?.length || 0,
                unreadMessages: messagesData?.filter(m => !m.read).length || 0,
            });

            // Load settings from Supabase
            const { data: settingsData } = await supabase
                .from('settings')
                .select('*');

            if (settingsData) {
                settingsData.forEach(setting => {
                    if (setting.key === 'platform' && setting.value) {
                        setPlatformSettings(prev => ({ ...prev, ...setting.value }));
                    }
                    if (setting.key === 'services' && setting.value) {
                        setServicesSettings(prev => ({ ...prev, ...setting.value }));
                    }
                    if (setting.key === 'subscription' && setting.value) {
                        setSubscriptionSettings(prev => ({ ...prev, ...setting.value }));
                    }
                });
            }
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

    const updateUserStatus = async (userId: string, status: 'active' | 'blocked' | 'pending', userType: 'tenant' | 'landlord') => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ status })
                .eq('id', userId);

            if (error) throw error;

            if (userType === 'tenant') {
                setTenants(tenants.map(t => t.id === userId ? { ...t, status } : t));
            } else {
                setLandlords(landlords.map(l => l.id === userId ? { ...l, status } : l));
            }

            toast({
                title: "Statut mis à jour",
                description: `Le compte a été ${status === 'active' ? 'activé' : status === 'blocked' ? 'bloqué' : 'mis en attente'}`,
            });
        } catch (error) {
            console.error('Error updating user status:', error);
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

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            // Upsert platform settings
            const { error: platformError } = await supabase
                .from('settings')
                .upsert({
                    key: 'platform',
                    value: platformSettings,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                }, { onConflict: 'key' });

            if (platformError) throw platformError;

            // Upsert services settings
            const { error: servicesError } = await supabase
                .from('settings')
                .upsert({
                    key: 'services',
                    value: servicesSettings,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                }, { onConflict: 'key' });

            if (servicesError) throw servicesError;

            // Upsert subscription settings
            const { error: subscriptionError } = await supabase
                .from('settings')
                .upsert({
                    key: 'subscription',
                    value: subscriptionSettings,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                }, { onConflict: 'key' });

            if (subscriptionError) throw subscriptionError;

            toast({
                title: "Paramètres sauvegardés",
                description: "Vos modifications ont été enregistrées avec succès.",
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de sauvegarder les paramètres. Vérifiez que la table 'settings' existe dans Supabase.",
            });
        } finally {
            setSavingSettings(false);
        }
    };

    const deleteRequest = async (requestId: string) => {
        try {
            // First try hard delete
            const { error, data } = await supabase
                .from('requests')
                .delete()
                .eq('id', requestId)
                .select();

            // If success
            if (!error && data && data.length > 0) {
                setRequests(requests.filter(r => r.id !== requestId));
                toast({
                    title: "Demande supprimée",
                    description: "La demande a été supprimée définitivement.",
                });
                return;
            }

            // If hard delete failed (likely permissions), try soft delete (archive)
            const { error: updateError } = await supabase
                .from('requests')
                .update({ status: 'cancelled' })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Update local state to show as cancelled
            setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r));

            toast({
                title: "Demande archivée",
                description: "Suppression définitive bloquée par la sécurité. La demande a été annulée/archivée.",
                variant: "default", // Changed from successful green to default/info to signal difference
            });

        } catch (error: any) {
            console.error('Error handling request deletion:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Action refusée. Vérifiez vos permissions.",
            });
        }
    };

    const toggleListingAvailability = async (listingId: string, available: boolean) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ available })
                .eq('id', listingId);

            if (error) throw error;

            setListings(listings.map(l => l.id === listingId ? { ...l, available } : l));
            toast({
                title: "Logement mis à jour",
                description: `Le logement a été ${available ? 'activé' : 'désactivé'}`,
            });
        } catch (error) {
            console.error('Error updating listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de mettre à jour le logement",
            });
        }
    };

    const deleteListing = async (listingId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId);

            if (error) throw error;

            setListings(listings.filter(l => l.id !== listingId));
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

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'colis': return <Package className="h-4 w-4" />;
            case 'gaz': return <Flame className="h-4 w-4" />;
            case 'lessive': return <Shirt className="h-4 w-4" />;
            case 'poubelles': return <Trash2 className="h-4 w-4" />;
            case 'nettoyage': return <Sparkles className="h-4 w-4" />;
            case 'logement': return <Building2 className="h-4 w-4" />;
            case 'demenagement': return <Truck className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getServiceColor = (type: string) => {
        switch (type) {
            case 'colis': return 'bg-african-green';
            case 'gaz': return 'bg-african-red';
            case 'lessive': return 'bg-african-yellow text-foreground';
            case 'poubelles': return 'bg-primary';
            case 'nettoyage': return 'bg-cyan-500';
            case 'logement': return 'bg-purple-500';
            case 'demenagement': return 'bg-amber-500';
            default: return 'bg-muted';
        }
    };

    // Format request payload for display
    const formatPayloadValue = (key: string, value: unknown): string => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
        if (Array.isArray(value)) {
            if (value.length === 0) return '-';
            return value.map(v => nettoyageLabels[v] || v).join(', ');
        }
        const strValue = String(value);

        // Translate type values
        if (key === 'type' && typeValueLabels[strValue]) {
            return typeValueLabels[strValue];
        }

        // Handle landlord_id - just show that it's assigned
        if (key === 'landlord_id') {
            return 'Assigné à un propriétaire';
        }

        // Format dates nicely
        if ((key.toLowerCase().includes('date') || key === 'dateDebut' || key === 'dateFin') && strValue.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
                return new Date(strValue).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch {
                return strValue;
            }
        }

        return strValue;
    };

    // Filter functions
    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(tenantsSearchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(tenantsSearchTerm.toLowerCase()) ||
        (t.phone && t.phone.includes(tenantsSearchTerm))
    );

    const filteredLandlords = landlords.filter(l =>
        l.name.toLowerCase().includes(landlordsSearchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(landlordsSearchTerm.toLowerCase()) ||
        (l.phone && l.phone.includes(landlordsSearchTerm))
    );

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(listingsSearchTerm.toLowerCase()) ||
        l.quartier.toLowerCase().includes(listingsSearchTerm.toLowerCase()) ||
        (l.owner?.name && l.owner.name.toLowerCase().includes(listingsSearchTerm.toLowerCase()))
    );

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.contact_phone.includes(searchTerm) ||
            r.service_type.includes(searchTerm.toLowerCase());
        const matchesService = serviceFilter === 'all' || r.service_type === serviceFilter;
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesLandlord = landlordFilter === 'all' || r.landlord_id === landlordFilter;
        // Destination filter: for logement, separate admin (no landlord_id) from landlords (has landlord_id)
        const matchesDestination = destinationFilter === 'all' ||
            (destinationFilter === 'admin' && !r.landlord_id) ||
            (destinationFilter === 'landlords' && r.landlord_id);
        return matchesSearch && matchesService && matchesStatus && matchesLandlord && matchesDestination;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const myRequests = filteredRequests.filter(r => r.landlord_id === user?.id);
    // const otherRequests = filteredRequests.filter(r => r.landlord_id !== user?.id); // Unused for now
    const requestsToDisplay = requestTab === 'mine' ? myRequests : filteredRequests;

    const pathToTab = (pathname: string) => {
        if (pathname === '/admin/landlords') return 'landlords';
        if (pathname === '/admin/listings') return 'listings';
        if (pathname === '/admin/requests') return 'requests';
        if (pathname === '/admin/messages') return 'messages';
        if (pathname === '/admin/analytics') return 'analytics';
        if (pathname === '/admin/settings') return 'settings';
        if (pathname === '/admin/tenants') return 'tenants';
        return 'overview';
    };

    const tabToPath = (tab: string) => {
        switch (tab) {
            case 'landlords': return '/admin/landlords';
            case 'listings': return '/admin/listings';
            case 'requests': return '/admin/requests';
            case 'messages': return '/admin/messages';
            case 'analytics': return '/admin/analytics';
            case 'settings': return '/admin/settings';
            case 'tenants': return '/admin/tenants';
            case 'overview':
            default: return '/admin/dashboard';
        }
    };

    const activeTab = pathToTab(location.pathname);

    const handleTabChange = (nextTab: string) => {
        const nextPath = tabToPath(nextTab);
        if (nextPath !== location.pathname) {
            navigate(nextPath);
        }
    };

    // Component for displaying request details
    const RequestDetailsDialog = ({ request }: { request: ServiceRequest }) => {
        const payload = request.payload as Record<string, unknown>;
        // Admin can only manipulate requests destined for admin (no landlord_id)
        const isAdminRequest = !request.landlord_id;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Détails</span>
                        <span className="sm:hidden">Voir</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                            <Badge className={`${getServiceColor(request.service_type)} w-fit`}>
                                {getServiceIcon(request.service_type)}
                                <span className="ml-1">{serviceTypeLabels[request.service_type] || request.service_type}</span>
                            </Badge>
                            <span className="text-muted-foreground text-xs sm:text-sm font-normal">
                                {new Date(request.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-left">
                            Demande de <span className="font-semibold">{request.contact_name}</span>
                            {!isAdminRequest && (
                                <Badge variant="outline" className="ml-2 text-xs">Destinée au propriétaire</Badge>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Contact Info */}
                        <div className="bg-secondary/50 rounded-lg p-3 sm:p-4 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Informations de contact
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs">Nom complet</span>
                                    <p className="font-medium">{request.contact_name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs">Téléphone</span>
                                    <p className="font-medium">
                                        <a
                                            href={`https://wa.me/${request.contact_phone.replace(/\s/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-african-green hover:underline flex items-center gap-1"
                                        >
                                            <MessageCircle className="h-3 w-3" />
                                            {request.contact_phone}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Request Details */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Détails de la demande</h4>
                            <div className="grid gap-1">
                                {Object.entries(payload).map(([key, value]) => {
                                    // Skip empty values and contact info already shown
                                    if (key === 'nom' || key === 'prenom' || key === 'whatsapp') return null;
                                    const formattedValue = formatPayloadValue(key, value);
                                    if (formattedValue === '-') return null;

                                    // Special handling for links
                                    const isLink = key === 'listing_link' && typeof value === 'string' && value.startsWith('http');

                                    return (
                                        <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border last:border-0 gap-1">
                                            <span className="text-muted-foreground text-xs sm:text-sm">
                                                {fieldLabels[key] || key}
                                            </span>
                                            {isLink ? (
                                                <a
                                                    href={value as string}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline text-xs sm:text-sm font-medium truncate max-w-full sm:max-w-[60%]"
                                                >
                                                    Voir le logement →
                                                </a>
                                            ) : (
                                                <span className="font-medium text-xs sm:text-sm sm:text-right break-words max-w-full sm:max-w-[60%]">
                                                    {formattedValue}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                        <a
                            href={`https://wa.me/${request.contact_phone.replace(/\s/g, '')}?text=Bonjour ${request.contact_name}, concernant votre demande de ${serviceTypeLabels[request.service_type] || request.service_type}...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:flex-1"
                        >
                            <Button variant="outline" className="w-full text-african-green border-african-green hover:bg-african-green hover:text-white">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Contacter sur WhatsApp</span>
                                <span className="sm:hidden">WhatsApp</span>
                            </Button>
                        </a>
                        {/* Only show action button for admin-destined requests */}
                        {isAdminRequest && request.status === 'new' && (
                            <Button
                                variant="cta"
                                onClick={() => updateRequestStatus(request.id, 'processed')}
                                className="w-full sm:flex-1"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme traité
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <DashboardLayout
            title="Administration"
            subtitle="Gérez la plateforme Le Bon Petit"
            navItems={adminNavItems}
        >
            <SEO title="Administration | Le Bon Petit" />
            {/* Refresh Button */}
            <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                </Button>
            </div>





            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsContent value="overview">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto mb-8">
                        <TabsTrigger value="tenants" className="relative h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <Users className="h-6 w-6" />
                            <span>Locataires</span>
                            {stats.pendingTenants > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-african-red text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                    {stats.pendingTenants}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="landlords" className="h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <Building2 className="h-6 w-6" />
                            <span>Bailleurs</span>
                        </TabsTrigger>
                        <TabsTrigger value="listings" className="h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <Home className="h-6 w-6" />
                            <span>Logements</span>
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="relative h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <Package className="h-6 w-6" />
                            <span>Demandes</span>
                            {stats.newRequests > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-african-red text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                    {stats.newRequests}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="relative h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <MessageCircle className="h-6 w-6" />
                            <span>Messages</span>
                            {stats.unreadMessages > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-african-red text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                    {stats.unreadMessages}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <BarChart2 className="h-6 w-6" />
                            <span>Analytic</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="h-24 flex flex-col gap-2 bg-card hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                            <Settings className="h-6 w-6" />
                            <span>Paramètres</span>
                        </TabsTrigger>
                    </TabsList>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-african-green/10 to-african-green/5 cursor-pointer hover:bg-african-green/10 transition-colors" onClick={() => handleTabChange('tenants')}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-african-green/20 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-african-green" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Locataires</p>
                                        <p className="font-heading text-xl font-bold">{stats.totalTenants}</p>
                                        <p className="text-xs text-muted-foreground">{stats.activeTenants} actifs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => handleTabChange('landlords')}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Bailleurs</p>
                                        <p className="font-heading text-xl font-bold">{stats.totalLandlords}</p>
                                        <p className="text-xs text-muted-foreground">{stats.activeListings} logements actifs</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-african-yellow/10 to-african-yellow/5 cursor-pointer hover:bg-african-yellow/10 transition-colors" onClick={() => handleTabChange('tenants')}>
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
                        <Card className="bg-gradient-to-br from-african-red/10 to-african-red/5 cursor-pointer hover:bg-african-red/10 transition-colors" onClick={() => handleTabChange('requests')}>
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

                    {/* Pending Tenants Alert */}
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
                                            Ces locataires attendent que vous validiez leur paiement pour activer leur compte.
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
                                                        onClick={() => updateUserStatus(tenant.id, 'active', 'tenant')}
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
                </TabsContent>

                {/* Tenants Tab */}
                <TabsContent value="tenants">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Gestion des Locataires ({filteredTenants.length})
                                </CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={tenantsSearchTerm}
                                        onChange={(e) => setTenantsSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Inscription</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">{tenant.name}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {tenant.email}
                                                    </div>
                                                    {tenant.phone && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <a
                                                                href={`https://wa.me/${tenant.phone.replace(/\s/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-african-green hover:underline"
                                                            >
                                                                {tenant.phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
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
                                                            onClick={() => updateUserStatus(tenant.id, 'active', 'tenant')}
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
                                                            onClick={() => updateUserStatus(tenant.id, 'blocked', 'tenant')}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Bloquer
                                                        </Button>
                                                    )}
                                                    {tenant.status === 'blocked' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateUserStatus(tenant.id, 'active', 'tenant')}
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
                            {filteredTenants.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Aucun locataire trouvé</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Landlords Tab */}
                <TabsContent value="landlords">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Gestion des Bailleurs ({filteredLandlords.length})
                                </CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={landlordsSearchTerm}
                                        onChange={(e) => setLandlordsSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Logements</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Inscription</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLandlords.map((landlord) => (
                                        <TableRow key={landlord.id}>
                                            <TableCell className="font-medium">{landlord.name}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {landlord.email}
                                                    </div>
                                                    {landlord.phone && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            <a
                                                                href={`https://wa.me/${landlord.phone.replace(/\s/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-african-green hover:underline"
                                                            >
                                                                {landlord.phone}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {landlord.listingsCount} logement(s)
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={landlord.status === 'active' ? 'default' : 'destructive'}>
                                                    {landlord.status === 'active' ? 'Actif' : 'Bloqué'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(landlord.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {landlord.status === 'active' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive"
                                                            onClick={() => updateUserStatus(landlord.id, 'blocked', 'landlord')}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Bloquer
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateUserStatus(landlord.id, 'active', 'landlord')}
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
                            {filteredLandlords.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Aucun bailleur trouvé</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Listings Tab */}
                <TabsContent value="listings">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Gestion des Logements ({filteredListings.length})
                                </CardTitle>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={listingsSearchTerm}
                                        onChange={(e) => setListingsSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Titre</TableHead>
                                            <TableHead className="hidden md:table-cell">Quartier</TableHead>
                                            <TableHead>Prix</TableHead>
                                            <TableHead className="hidden md:table-cell">Vues</TableHead>
                                            <TableHead className="hidden md:table-cell">Propriétaire</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredListings.map((listing) => (
                                            <TableRow key={listing.id}>
                                                <TableCell className="font-medium max-w-[150px] truncate">{listing.title}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {listing.quartier}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{listing.price?.toLocaleString()} FCFA</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        {listing.views}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">{listing.owner?.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={listing.available ? 'default' : 'secondary'}>
                                                        {listing.available ? 'Actif' : 'Inactif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleListingAvailability(listing.id, !listing.available)}
                                                        >
                                                            <ToggleLeft className="h-4 w-4 mr-1" />
                                                            {listing.available ? 'Désactiver' : 'Activer'}
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="outline" className="text-destructive">
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Supprimer ce logement ?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Cette action est irréversible. Le logement "{listing.title}" sera définitivement supprimé.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => deleteListing(listing.id)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Supprimer
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {filteredListings.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Aucun logement trouvé</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex flex-col gap-2">
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Demandes de Services ({filteredRequests.length})
                                        </CardTitle>
                                    </div>
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
                                {/* Filters */}
                                <div className="flex flex-wrap gap-3">
                                    <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Type de service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les services</SelectItem>
                                            <SelectItem value="colis">Colis</SelectItem>
                                            <SelectItem value="gaz">Gaz</SelectItem>
                                            <SelectItem value="lessive">Lessive</SelectItem>
                                            <SelectItem value="poubelles">Poubelles</SelectItem>
                                            <SelectItem value="nettoyage">Nettoyage</SelectItem>
                                            <SelectItem value="logement">Logement</SelectItem>
                                            <SelectItem value="demenagement">Déménagement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous</SelectItem>
                                            <SelectItem value="new">Nouveaux</SelectItem>
                                            <SelectItem value="processed">Traités</SelectItem>
                                            <SelectItem value="cancelled">Non conclues</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={landlordFilter} onValueChange={setLandlordFilter}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Par Propriétaire" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les propriétaires</SelectItem>
                                            {landlords.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes destinations</SelectItem>
                                            <SelectItem value="admin">Pour l'admin</SelectItem>
                                            <SelectItem value="landlords">Pour les bailleurs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                                            <TableHead className="hidden md:table-cell">Date</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requestsToDisplay.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <Badge className={getServiceColor(request.service_type)}>
                                                        <span className="flex items-center gap-1">
                                                            {getServiceIcon(request.service_type)}
                                                            <span className="hidden lg:inline">{serviceTypeLabels[request.service_type] || request.service_type}</span>
                                                            <span className="lg:hidden">{serviceTypeLabels[request.service_type]?.slice(0, 3) || request.service_type.slice(0, 3)}</span>
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{request.contact_name}</span>
                                                        <span className="text-xs text-muted-foreground md:hidden">{request.contact_phone}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <a
                                                        href={`https://wa.me/${request.contact_phone.replace(/\s/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-african-green hover:underline flex items-center gap-1"
                                                    >
                                                        <MessageCircle className="h-3 w-3" />
                                                        {request.contact_phone}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex flex-col text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-4">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(request.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={request.status === 'new' ? 'destructive' : request.status === 'cancelled' ? 'secondary' : 'default'}>
                                                        {request.status === 'new' ? 'Nouv' : request.status === 'cancelled' ? 'Annul' : 'Fait'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <RequestDetailsDialog request={request} />
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
                                                        {!request.landlord_id && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="sm" variant="outline" className="text-destructive">
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Cette action est irréversible. La demande de {request.contact_name} sera définitivement supprimée.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteRequest(request.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Supprimer
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {requestsToDisplay.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Aucune demande trouvée</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <div className="grid gap-6">
                        {/* Platform Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Informations de la plateforme
                                </CardTitle>
                                <CardDescription>
                                    Configurez les informations générales de votre entreprise
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">Nom de l'entreprise</Label>
                                        <Input
                                            id="company-name"
                                            value={platformSettings.company_name}
                                            onChange={(e) => setPlatformSettings(prev => ({ ...prev, company_name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-phone">Téléphone de contact</Label>
                                        <Input
                                            id="contact-phone"
                                            value={platformSettings.contact_phone}
                                            onChange={(e) => setPlatformSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact-email">Email de contact</Label>
                                        <Input
                                            id="contact-email"
                                            type="email"
                                            value={platformSettings.contact_email}
                                            onChange={(e) => setPlatformSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">WhatsApp Business</Label>
                                        <Input
                                            id="whatsapp"
                                            value={platformSettings.whatsapp}
                                            onChange={(e) => setPlatformSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse</Label>
                                    <Textarea
                                        id="address"
                                        value={platformSettings.address}
                                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, address: e.target.value }))}
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Gestion des services
                                </CardTitle>
                                <CardDescription>
                                    Activez ou désactivez les services disponibles sur la plateforme
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { id: 'colis', name: 'Expédition de Colis', icon: Package },
                                        { id: 'gaz', name: 'Livraison de Gaz', icon: Flame },
                                        { id: 'lessive', name: 'Ramassage Lessive', icon: Shirt },
                                        { id: 'poubelles', name: "Gestion d'ordure", icon: Trash2 },
                                        { id: 'nettoyage', name: 'Nettoyage & Antiparasitaire', icon: Sparkles },
                                    ].map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${getServiceColor(service.id)} flex items-center justify-center text-white`}>
                                                    <service.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{service.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {requests.filter(r => r.service_type === service.id).length} demandes totales
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={servicesSettings[service.id] ?? true}
                                                onCheckedChange={(checked) => setServicesSettings(prev => ({ ...prev, [service.id]: checked }))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Paramètres d'abonnement
                                </CardTitle>
                                <CardDescription>
                                    Configurez les tarifs et durées d'abonnement pour les locataires
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subscription-price">Prix mensuel (FCFA)</Label>
                                        <Input
                                            id="subscription-price"
                                            type="number"
                                            value={subscriptionSettings.price}
                                            onChange={(e) => setSubscriptionSettings(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subscription-duration">Durée (jours)</Label>
                                        <Input
                                            id="subscription-duration"
                                            type="number"
                                            value={subscriptionSettings.duration_days}
                                            onChange={(e) => setSubscriptionSettings(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trial-period">Période d'essai (jours)</Label>
                                        <Input
                                            id="trial-period"
                                            type="number"
                                            value={subscriptionSettings.trial_days}
                                            onChange={(e) => setSubscriptionSettings(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button variant="cta" onClick={saveSettings} disabled={savingSettings}>
                                {savingSettings ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Sauvegarde en cours...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Sauvegarder les paramètres
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5" />
                                    Messages entre Locataires et Bailleurs ({messages.length})
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{stats.unreadMessages} non lus</span>
                                </div>
                            </div>
                            <CardDescription>
                                Aperçu des conversations sur la plateforme (lecture seule)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Expéditeur</TableHead>
                                            <TableHead>Destinataire</TableHead>
                                            <TableHead className="hidden md:table-cell">Message</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Lu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.map((msg) => (
                                            <TableRow key={msg.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{msg.sender?.name || 'Inconnu'}</span>
                                                        <span className="text-xs text-muted-foreground">{msg.sender?.role === 'tenant' ? 'Locataire' : msg.sender?.role === 'landlord' ? 'Bailleur' : msg.sender?.role}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{msg.receiver?.name || 'Inconnu'}</span>
                                                        <span className="text-xs text-muted-foreground">{msg.receiver?.role === 'tenant' ? 'Locataire' : msg.receiver?.role === 'landlord' ? 'Bailleur' : msg.receiver?.role}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell max-w-[300px]">
                                                    <p className="truncate text-sm text-muted-foreground">{msg.content}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={msg.read ? 'secondary' : 'default'} className={msg.read ? '' : 'bg-african-yellow text-foreground'}>
                                                        {msg.read ? 'Lu' : 'Non lu'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {messages.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">Aucun message trouvé</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary gap-2" onClick={() => handleTabChange('overview')}>
                        <span className="flex items-center gap-2">← Retour au tableau de bord</span>
                    </Button>
                    <AnalyticsTab
                        requests={requests}
                        tenants={tenants}
                        landlords={landlords}
                        listings={listings}
                    />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
