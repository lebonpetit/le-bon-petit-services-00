import { useState, useEffect } from 'react';
import { supabase, ServiceRequest } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout, landlordNavItems } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Landmark,
    Phone,
    User as UserIcon,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function LandlordRequests() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'processed' | 'cancelled'>('all');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .eq('landlord_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de charger vos demandes.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: 'new' | 'processed' | 'cancelled') => {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
            if (selectedRequest?.id === id) {
                setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
            }

            toast({
                title: 'Statut mis à jour',
                description: `La demande a été marquée comme ${newStatus === 'processed' ? 'traitée' : newStatus === 'cancelled' ? 'non conclue' : 'nouvelle'}.`
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Impossible de mettre à jour le statut.'
            });
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.contact_phone.includes(searchTerm) ||
            (req.payload.listing_title as string)?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout title="Mes Demandes" navItems={landlordNavItems}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, téléphone ou titre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="new">Nouvelles</SelectItem>
                                <SelectItem value="processed">Traitées</SelectItem>
                                <SelectItem value="cancelled">Non conclues</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Requests List */}
                    <Card className="lg:h-[calc(100vh-16rem)] flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Demandes de réservation & visites</CardTitle>
                            <CardDescription>
                                {filteredRequests.length} demande(s) trouvée(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-primary/10">
                            {loading ? (
                                <div className="space-y-4 p-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                                    ))}
                                </div>
                            ) : filteredRequests.length > 0 ? (
                                <div className="divide-y">
                                    {filteredRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${selectedRequest?.id === req.id ? 'bg-primary/5' : ''
                                                }`}
                                            onClick={() => setSelectedRequest(req)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge
                                                    variant={req.status === 'new' ? 'default' : req.status === 'cancelled' ? 'destructive' : 'secondary'}
                                                    className={req.status === 'new' ? 'bg-african-yellow text-primary-foreground' : ''}
                                                >
                                                    {req.status === 'new' ? 'Nouveau' : req.status === 'cancelled' ? 'Non conclue' : 'Traité'}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(req.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-sm mb-1 truncate">
                                                {req.payload.listing_title as string || 'Demande générale'}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <UserIcon className="h-3 w-3" />
                                                <span>{req.contact_name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                    <Landmark className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Aucune demande trouvée</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Request Detail */}
                    <Card className="lg:h-[calc(100vh-16rem)] flex flex-col">
                        {selectedRequest ? (
                            <>
                                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Détails de la demande</CardTitle>
                                        <CardDescription>ID: {selectedRequest.id.split('-')[0]}</CardDescription>
                                    </div>
                                    <Button
                                        variant={selectedRequest.status === 'new' ? 'cta' : 'outline'}
                                        size="sm"
                                        onClick={() => handleUpdateStatus(
                                            selectedRequest.id,
                                            selectedRequest.status === 'new' ? 'processed' : 'new'
                                        )}
                                    >
                                        {selectedRequest.status === 'new' ? (
                                            <><CheckCircle2 className="h-4 w-4 mr-2" /> Conclu</>
                                        ) : (
                                            'Marquer comme nouveau'
                                        )}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="ml-2"
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'cancelled')}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Non conclue
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 overflow-y-auto flex-1 space-y-8">
                                    {/* Listing Info */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Logement concerné</h4>
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <p className="font-bold text-lg mb-1">{selectedRequest.payload.listing_title as string}</p>
                                            {selectedRequest.payload.listing_link && (
                                                <Button variant="link" className="p-0 h-auto text-african-yellow text-xs" asChild>
                                                    <a href={selectedRequest.payload.listing_link as string} target="_blank" rel="noreferrer">
                                                        Voir l'annonce <ArrowRight className="h-3 w-3 ml-1" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Coordonnées prospect</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-muted/20 space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Nom complet</p>
                                                <p className="font-medium">{selectedRequest.contact_name}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-muted/20 space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Téléphone / WhatsApp</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{selectedRequest.contact_phone}</p>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:text-green-500" asChild>
                                                        <a href={`https://wa.me/${selectedRequest.contact_phone.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noreferrer">
                                                            <Phone className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payload Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Détails de la réservation</h4>
                                        <div className="bg-card border rounded-xl divide-y">
                                            {Object.entries(selectedRequest.payload)
                                                .filter(([key]) => !['listing_title', 'listing_link', 'type', 'landlord_id', 'nom', 'prenom', 'whatsapp'].includes(key))
                                                .map(([key, value]) => (
                                                    <div key={key} className="p-4 flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                                                        <span className="font-medium">{String(value)}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 h-full text-center text-muted-foreground">
                                <Eye className="h-12 w-12 mb-4 opacity-20" />
                                <p>Sélectionnez une demande pour voir les détails</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
