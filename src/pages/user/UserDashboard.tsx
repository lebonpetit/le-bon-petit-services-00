import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase, ServiceRequest } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import {
    ClipboardList, History, Star, Gift, Send, XCircle, CheckCircle2,
    Clock, Flame, Package, Shirt, Trash2, Sparkles, Truck, Users,
    AlertCircle, PartyPopper, Percent
} from 'lucide-react';
import type { NavItem } from '@/components/DashboardLayout';

// Nav items for user dashboard
export const userNavItems: NavItem[] = [
    { label: 'Mon espace', href: '/user/dashboard', icon: ClipboardList },
];

const SERVICE_TYPES = [
    { value: 'gaz', label: 'Livraison de gaz', icon: Flame },
    { value: 'colis', label: 'Expédition de colis', icon: Package },
    { value: 'lessive', label: 'Ramassage de lessive', icon: Shirt },
    { value: 'poubelles', label: "Gestion d'ordures", icon: Trash2 },
    { value: 'nettoyage', label: 'Nettoyage & Entretien', icon: Sparkles },
    { value: 'demenagement', label: 'Déménagement', icon: Truck },
    { value: 'personnel', label: 'Personnel à domicile', icon: Users },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    new: { label: 'En attente', color: 'bg-blue-500', icon: Clock },
    processed: { label: 'Traité', color: 'bg-green-500', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-red-500', icon: XCircle },
};

export default function UserDashboard() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('request');
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // Service request form
    const [requestForm, setRequestForm] = useState({
        service_type: '',
        details: '',
        contact_name: user?.name || '',
        contact_phone: user?.phone || '',
        location: '',
    });
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // Fetch user requests
    const fetchRequests = async () => {
        if (!user) return;
        setLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        refreshUser();
    }, [user?.id]);

    // Update form defaults when user loads
    useEffect(() => {
        if (user) {
            setRequestForm(prev => ({
                ...prev,
                contact_name: prev.contact_name || user.name || '',
                contact_phone: prev.contact_phone || user.phone || '',
            }));
        }
    }, [user]);

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || submittingRequest) return;

        if (!requestForm.service_type) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez choisir un type de service" });
            return;
        }

        setSubmittingRequest(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: requestForm.service_type,
                payload: {
                    details: requestForm.details,
                    location: requestForm.location,
                    source: 'user_dashboard',
                },
                contact_name: requestForm.contact_name,
                contact_phone: requestForm.contact_phone,
                user_id: user.id,
                status: 'new',
            });

            if (error) throw error;

            toast({
                title: "Demande envoyée ! ✅",
                description: "Notre équipe traitera votre demande rapidement.",
            });

            setRequestForm({
                service_type: '',
                details: '',
                contact_name: user.name || '',
                contact_phone: user.phone || '',
                location: '',
            });

            fetchRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer votre demande. Réessayez.",
            });
        } finally {
            setSubmittingRequest(false);
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ status: 'cancelled' })
                .eq('id', requestId)
                .eq('user_id', user?.id)
                .eq('status', 'new');

            if (error) throw error;

            toast({
                title: "Demande annulée",
                description: "Votre demande a été annulée avec succès.",
            });

            fetchRequests();
        } catch (error) {
            console.error('Error cancelling request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'annuler cette demande.",
            });
        }
    };

    const handleRedeemDiscount = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('redeem_loyalty_discount', {
                p_user_id: user.id
            });

            if (error) throw error;

            if (data) {
                toast({
                    title: "🎉 Réduction activée !",
                    description: "Votre réduction de 30% sera appliquée à votre prochaine commande.",
                });
                refreshUser();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Vous n'avez pas assez de points.",
                });
            }
        } catch (error) {
            console.error('Error redeeming discount:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'utiliser la réduction.",
            });
        }
    };

    const loyaltyPoints = user?.loyalty_points || 0;
    const discountAvailable = user?.discount_available || false;
    const progressPercent = Math.min((loyaltyPoints % 10) * 10, 100);
    const pointsToNext = 10 - (loyaltyPoints % 10);

    const pendingRequests = requests.filter(r => r.status === 'new');
    const processedRequests = requests.filter(r => r.status === 'processed');
    const cancelledRequests = requests.filter(r => r.status === 'cancelled');

    const getServiceIcon = (type: string) => {
        const service = SERVICE_TYPES.find(s => s.value === type);
        return service?.icon || Package;
    };

    const getServiceLabel = (type: string) => {
        const service = SERVICE_TYPES.find(s => s.value === type);
        return service?.label || type;
    };

    return (
        <DashboardLayout
            title="Mon Espace"
            subtitle="Gérez vos services et suivez votre fidélité"
            navItems={userNavItems}
        >
            <SEO title="Mon Espace | Le Bon Petit" />

            {/* Loyalty Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-african-yellow/10 to-african-gold/5 border-african-yellow/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-african-yellow/20 flex items-center justify-center">
                            <Star className="h-6 w-6 text-african-yellow" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-heading">{loyaltyPoints}</p>
                            <p className="text-xs text-muted-foreground">Points de fidélité</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-blue-500/20">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <ClipboardList className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-heading">{pendingRequests.length}</p>
                            <p className="text-xs text-muted-foreground">Demandes en cours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border ${discountAvailable
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-400/5 border-green-500/30 ring-2 ring-green-500/20'
                    : 'bg-gradient-to-br from-gray-500/10 to-gray-400/5 border-gray-500/20'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${discountAvailable ? 'bg-green-500/20' : 'bg-gray-500/10'}`}>
                            <Gift className={`h-6 w-6 ${discountAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold font-heading ${discountAvailable ? 'text-green-600' : ''}`}>
                                {discountAvailable ? '-30%' : `${pointsToNext} pts`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {discountAvailable ? 'Réduction disponible !' : 'avant la réduction'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Discount Banner */}
            {discountAvailable && (
                <div className="mb-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-glow">
                    <div className="flex items-center gap-3">
                        <PartyPopper className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="font-bold text-green-700 dark:text-green-400">
                                🎉 Félicitations ! Réduction de 30% disponible !
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Vous avez atteint 10 points de fidélité. Utilisez votre réduction sur votre prochaine commande.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleRedeemDiscount}
                        className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                    >
                        <Percent className="h-4 w-4 mr-2" />
                        Utiliser ma réduction
                    </Button>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-lg">
                    <TabsTrigger value="request" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Send className="h-4 w-4" />
                        <span className="hidden sm:inline">Demande</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2 text-xs sm:text-sm">
                        <History className="h-4 w-4" />
                        <span className="hidden sm:inline">Historique</span>
                    </TabsTrigger>
                    <TabsTrigger value="loyalty" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">Fidélité</span>
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: Service Request */}
                <TabsContent value="request" className="space-y-6">
                    {/* Active Requests */}
                    {pendingRequests.length > 0 && (
                        <Card className="border-blue-500/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    Demandes en cours ({pendingRequests.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pendingRequests.map((req) => {
                                    const ServiceIcon = getServiceIcon(req.service_type);
                                    return (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <ServiceIcon className="h-5 w-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{getServiceLabel(req.service_type)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(req.created_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleCancelRequest(req.id)}
                                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Annuler
                                            </Button>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* New Request Form */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" />
                                Nouvelle demande de service
                            </CardTitle>
                            <CardDescription>
                                Remplissez le formulaire ci-dessous pour demander un service
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Type de service *</Label>
                                    <Select
                                        value={requestForm.service_type}
                                        onValueChange={(v) => setRequestForm(prev => ({ ...prev, service_type: v }))}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Choisir un service..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SERVICE_TYPES.map((service) => (
                                                <SelectItem key={service.value} value={service.value}>
                                                    <span className="flex items-center gap-2">
                                                        <service.icon className="h-4 w-4" />
                                                        {service.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="req-name">Nom *</Label>
                                        <Input
                                            id="req-name"
                                            value={requestForm.contact_name}
                                            onChange={(e) => setRequestForm(prev => ({ ...prev, contact_name: e.target.value }))}
                                            placeholder="Votre nom"
                                            required
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="req-phone">Téléphone *</Label>
                                        <PhoneInput
                                            id="req-phone"
                                            value={requestForm.contact_phone}
                                            onValueChange={(val) => setRequestForm(prev => ({ ...prev, contact_phone: val }))}
                                            placeholder="+237 6XX XXX XXX"
                                            required
                                            className="bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="req-location">Localisation *</Label>
                                    <Input
                                        id="req-location"
                                        value={requestForm.location}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Quartier, rue, repère..."
                                        required
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="req-details">Détails supplémentaires</Label>
                                    <Textarea
                                        id="req-details"
                                        value={requestForm.details}
                                        onChange={(e) => setRequestForm(prev => ({ ...prev, details: e.target.value }))}
                                        placeholder="Précisez votre demande (quantité, horaire souhaité, etc.)"
                                        className="bg-background min-h-[100px]"
                                    />
                                </div>

                                {discountAvailable && (
                                    <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <Gift className="h-5 w-5 text-green-500" />
                                        <p className="text-sm text-green-700 dark:text-green-400">
                                            Votre réduction de 30% sera appliquée à cette commande !
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" variant="cta" className="w-full" disabled={submittingRequest}>
                                    {submittingRequest ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Envoi...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="h-4 w-4" />
                                            Envoyer la demande
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: Service History */}
                <TabsContent value="history" className="space-y-6">
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Historique des services
                            </CardTitle>
                            <CardDescription>
                                Consultez l'historique de toutes vos demandes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingRequests ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="font-heading text-lg font-semibold mb-2">Aucune demande</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Vous n'avez pas encore effectué de demande de service.
                                    </p>
                                    <Button variant="cta" className="mt-4" onClick={() => setActiveTab('request')}>
                                        Faire une demande
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((req) => {
                                        const ServiceIcon = getServiceIcon(req.service_type);
                                        const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.new;
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <div key={req.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                                        <ServiceIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{getServiceLabel(req.service_type)}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(req.created_at).toLocaleDateString('fr-FR', {
                                                                day: 'numeric', month: 'long', year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats summary */}
                    {requests.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-500">{pendingRequests.length}</p>
                                    <p className="text-xs text-muted-foreground">En attente</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-green-500">{processedRequests.length}</p>
                                    <p className="text-xs text-muted-foreground">Traités</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-red-500">{cancelledRequests.length}</p>
                                    <p className="text-xs text-muted-foreground">Annulés</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* TAB 3: Loyalty Points */}
                <TabsContent value="loyalty" className="space-y-6">
                    {/* Main loyalty card */}
                    <Card className="shadow-card overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-african-yellow via-african-gold to-african-yellow" />
                        <CardHeader className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-african-yellow/20 to-african-gold/10 flex items-center justify-center mb-2">
                                <Star className="h-10 w-10 text-african-yellow fill-african-yellow" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Programme de Fidélité</CardTitle>
                            <CardDescription>Accumulez des points et profitez de réductions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pb-8">
                            {/* Points count */}
                            <div className="text-center">
                                <p className="text-6xl font-extrabold font-heading text-african-yellow">
                                    {loyaltyPoints}
                                </p>
                                <p className="text-muted-foreground mt-1">points accumulés</p>
                            </div>

                            {/* Progress bar */}
                            <div className="max-w-md mx-auto space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Progression</span>
                                    <span className="font-medium">
                                        {loyaltyPoints % 10} / 10 points
                                    </span>
                                </div>
                                <div className="relative">
                                    <Progress value={progressPercent} className="h-4 bg-secondary" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white drop-shadow-sm">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                </div>
                                {!discountAvailable && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        Encore <strong className="text-african-yellow">{pointsToNext} commande{pointsToNext > 1 ? 's' : ''} traitée{pointsToNext > 1 ? 's' : ''}</strong> avant votre réduction de 30%
                                    </p>
                                )}
                            </div>

                            {/* Discount Available */}
                            {discountAvailable && (
                                <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto">
                                    <PartyPopper className="h-12 w-12 mx-auto text-green-500" />
                                    <div>
                                        <h3 className="font-heading text-xl font-bold text-green-700 dark:text-green-400">
                                            Réduction de 30% disponible !
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Cliquez ci-dessous pour activer votre réduction sur la prochaine commande
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleRedeemDiscount}
                                        size="lg"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Gift className="h-5 w-5 mr-2" />
                                        Utiliser ma réduction de 30%
                                    </Button>
                                </div>
                            )}

                            {/* How it works */}
                            <div className="border-t pt-6 max-w-lg mx-auto">
                                <h4 className="font-heading font-bold text-center mb-4">Comment ça marche ?</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-african-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-sm font-bold text-african-yellow">1</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Commandez un service</p>
                                            <p className="text-xs text-muted-foreground">Via le formulaire ou les pages de services</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-african-yellow/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-sm font-bold text-african-yellow">2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Gagnez 1 point par commande traitée</p>
                                            <p className="text-xs text-muted-foreground">Les points s'ajoutent automatiquement</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-sm font-bold text-green-500">3</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Atteignez 10 points = -30% sur la prochaine commande</p>
                                            <p className="text-xs text-muted-foreground">La réduction est automatiquement débloquée</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points history info */}
                    <Card>
                        <CardContent className="p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                Les points de fidélité sont attribués automatiquement lorsqu'une commande est traitée par notre équipe.
                                Assurez-vous d'être connecté lors de vos commandes pour accumuler des points.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
