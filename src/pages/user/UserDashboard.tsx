import { useState, useEffect, useRef } from 'react';
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
    AlertCircle, PartyPopper, Percent, ArrowRight, ArrowLeft, Check,
    MapPin, MessageSquare, Phone, User, Loader, Play, UserCheck, Ban
} from 'lucide-react';
import type { NavItem } from '@/components/DashboardLayout';

// Nav items for user dashboard
export const userNavItems: NavItem[] = [
    { label: 'Mon espace', href: '/user/dashboard', icon: ClipboardList },
];

const SERVICE_TYPES = [
    { value: 'gaz', label: 'Livraison de gaz', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', ring: 'ring-orange-500/30' },
    { value: 'colis', label: 'Expédition de colis', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500/30' },
    { value: 'lessive', label: 'Ramassage de lessive', icon: Shirt, color: 'text-purple-500', bg: 'bg-purple-500/10', ring: 'ring-purple-500/30' },
    { value: 'poubelles', label: "Gestion d'ordures", icon: Trash2, color: 'text-green-500', bg: 'bg-green-500/10', ring: 'ring-green-500/30' },
    { value: 'nettoyage', label: 'Nettoyage & Entretien', icon: Sparkles, color: 'text-cyan-500', bg: 'bg-cyan-500/10', ring: 'ring-cyan-500/30' },
    { value: 'demenagement', label: 'Déménagement', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
    { value: 'personnel', label: 'Personnel à domicile', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10', ring: 'ring-pink-500/30' },
];

const REQUEST_STEPS = [
    { id: 1, title: 'Service', icon: Package, description: 'Quel service souhaitez-vous ?' },
    { id: 2, title: 'Contact', icon: Phone, description: 'Vos coordonnées' },
    { id: 3, title: 'Lieu', icon: MapPin, description: 'Où devons-nous intervenir ?' },
    { id: 4, title: 'Détails', icon: MessageSquare, description: 'Des précisions à ajouter ?' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    new: { label: 'En attente', color: 'bg-blue-500', icon: Clock },
    approved: { label: 'Accepté', color: 'bg-emerald-500', icon: CheckCircle2 },
    rejected: { label: 'Refusé', color: 'bg-red-500', icon: Ban },
    in_progress: { label: 'En cours', color: 'bg-amber-500', icon: Loader },
    completed: { label: 'Traité', color: 'bg-green-600', icon: CheckCircle2 },
    processed: { label: 'Traité', color: 'bg-green-600', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-gray-500', icon: XCircle },
};

export default function UserDashboard() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('request');
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [historyFilter, setHistoryFilter] = useState<string>('all');

    // Service request form
    const [requestForm, setRequestForm] = useState({
        service_types: [] as string[],
        details: '',
        contact_name: user?.name || '',
        contact_phone: user?.phone || '',
        location: '',
    });
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // Multi-step form state
    const [requestStep, setRequestStep] = useState(1);
    const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
    const [stepAnimating, setStepAnimating] = useState(false);
    const requestStepRef = useRef<HTMLDivElement>(null);

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

    // Multi-step navigation
    const validateRequestStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (requestForm.service_types.length === 0) {
                    toast({ variant: "destructive", title: "Service requis", description: "Veuillez choisir au moins un type de service" });
                    return false;
                }
                return true;
            case 2:
                if (!requestForm.contact_name.trim()) {
                    toast({ variant: "destructive", title: "Nom requis", description: "Veuillez entrer votre nom" });
                    return false;
                }
                if (!requestForm.contact_phone.trim()) {
                    toast({ variant: "destructive", title: "Téléphone requis", description: "Veuillez entrer votre numéro" });
                    return false;
                }
                return true;
            case 3:
                if (!requestForm.location.trim()) {
                    toast({ variant: "destructive", title: "Localisation requise", description: "Veuillez indiquer votre localisation" });
                    return false;
                }
                return true;
            case 4:
                return true;
            default:
                return true;
        }
    };

    const goToRequestStep = (targetStep: number) => {
        if (stepAnimating) return;
        if (targetStep > requestStep && !validateRequestStep(requestStep)) return;

        setStepDirection(targetStep > requestStep ? 'forward' : 'backward');
        setStepAnimating(true);

        setTimeout(() => {
            setRequestStep(targetStep);
            setTimeout(() => setStepAnimating(false), 50);
        }, 200);
    };

    const nextRequestStep = () => {
        if (requestStep < REQUEST_STEPS.length) goToRequestStep(requestStep + 1);
    };

    const prevRequestStep = () => {
        if (requestStep > 1) goToRequestStep(requestStep - 1);
    };

    // Auto-focus input on step change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (requestStepRef.current) {
                const input = requestStepRef.current.querySelector('input:not([type="hidden"]), textarea');
                if (input) (input as HTMLInputElement).focus();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [requestStep]);

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || submittingRequest) return;

        if (requestForm.service_types.length === 0) {
            toast({ variant: "destructive", title: "Erreur", description: "Veuillez choisir au moins un type de service" });
            return;
        }

        setSubmittingRequest(true);
        try {
            const requestsData = requestForm.service_types.map(serviceType => ({
                service_type: serviceType,
                payload: {
                    details: requestForm.details,
                    location: requestForm.location,
                    source: 'user_dashboard',
                },
                contact_name: requestForm.contact_name,
                contact_phone: requestForm.contact_phone,
                user_id: user.id,
                status: 'new',
            }));

            const { error } = await supabase.from('requests').insert(requestsData);

            if (error) throw error;

            toast({
                title: "Demande envoyée ! ✅",
                description: "Notre équipe traitera votre demande rapidement.",
            });

            setRequestForm({
                service_types: [],
                details: '',
                contact_name: user.name || '',
                contact_phone: user.phone || '',
                location: '',
            });
            setRequestStep(1);

            fetchRequests();
            setActiveTab('history');
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
    const approvedRequests = requests.filter(r => r.status === 'approved');
    const inProgressRequests = requests.filter(r => r.status === 'in_progress');
    const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'processed');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');
    const cancelledRequests = requests.filter(r => r.status === 'cancelled');
    const activeRequests = requests.filter(r => ['new', 'approved', 'in_progress'].includes(r.status));

    const getProgressStep = (status: string) => {
        const steps = ['new', 'approved', 'in_progress', 'completed'];
        return steps.indexOf(status) + 1;
    };

    const filteredHistoryRequests = historyFilter === 'all'
        ? requests
        : requests.filter(r => r.status === historyFilter || (historyFilter === 'completed' && r.status === 'processed'));

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
                            <p className="text-2xl font-bold font-heading">{activeRequests.length}</p>
                            <p className="text-xs text-muted-foreground">Demandes actives</p>
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

                    {/* New Request Form - Multi-Step Wizard */}
                    <Card className="shadow-card overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" />
                                Nouvelle demande de service
                            </CardTitle>
                            <CardDescription>
                                Suivez les étapes pour envoyer votre demande
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Step Progress */}
                            <div className="mb-8">
                                {/* Progress Bar */}
                                <div className="relative h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-african-green to-african-yellow rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${((requestStep - 1) / (REQUEST_STEPS.length - 1)) * 100}%` }}
                                    />
                                </div>

                                {/* Step Indicators */}
                                <div className="flex justify-between">
                                    {REQUEST_STEPS.map((step) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = requestStep > step.id;
                                        const isCurrent = requestStep === step.id;
                                        return (
                                            <button
                                                key={step.id}
                                                type="button"
                                                onClick={() => {
                                                    if (step.id < requestStep) goToRequestStep(step.id);
                                                }}
                                                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${step.id < requestStep ? 'cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <div
                                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                        isCompleted
                                                            ? 'bg-african-green text-white shadow-md scale-90'
                                                            : isCurrent
                                                            ? 'bg-gradient-to-br from-african-yellow to-african-gold text-foreground shadow-lg scale-110 ring-4 ring-african-yellow/20'
                                                            : 'bg-secondary text-muted-foreground'
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    ) : (
                                                        <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    )}
                                                </div>
                                                <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {step.title}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step Description */}
                            <div className="text-center mb-6">
                                <p className="text-sm text-muted-foreground">
                                    {REQUEST_STEPS[requestStep - 1].description}
                                </p>
                            </div>

                            {/* Form Steps */}
                            <form onSubmit={handleSubmitRequest} autoComplete="off">
                                <div
                                    ref={requestStepRef}
                                    className={`transition-all duration-300 ease-out ${
                                        stepAnimating
                                            ? stepDirection === 'forward'
                                                ? 'opacity-0 translate-x-8'
                                                : 'opacity-0 -translate-x-8'
                                            : 'opacity-100 translate-x-0'
                                    }`}
                                >
                                    {/* Step 1: Service Type */}
                                    {requestStep === 1 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {SERVICE_TYPES.map((service) => {
                                                const isSelected = requestForm.service_types.includes(service.value);
                                                return (
                                                    <button
                                                        key={service.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setRequestForm(prev => {
                                                                const types = prev.service_types.includes(service.value)
                                                                    ? prev.service_types.filter(t => t !== service.value)
                                                                    : [...prev.service_types, service.value];
                                                                return { ...prev, service_types: types };
                                                            });
                                                        }}
                                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.03] ${
                                                            isSelected
                                                                ? `${service.bg} border-current ${service.color} ring-2 ${service.ring} shadow-md`
                                                                : 'border-border/50 hover:border-border hover:bg-secondary/30'
                                                        }`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                                                            <service.icon className={`h-6 w-6 ${service.color}`} />
                                                        </div>
                                                        <span className={`text-xs font-medium text-center leading-tight ${isSelected ? service.color : 'text-foreground'}`}>
                                                            {service.label}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-african-green text-white flex items-center justify-center mt-2 absolute top-2 right-2">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Step 2: Contact Info */}
                                    {requestStep === 2 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="req-name">Nom complet</Label>
                                                <Input
                                                    id="req-name"
                                                    value={requestForm.contact_name}
                                                    onChange={(e) => setRequestForm(prev => ({ ...prev, contact_name: e.target.value }))}
                                                    placeholder="Votre nom"
                                                    required
                                                    className="bg-background h-12 text-base"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="req-phone">Numéro WhatsApp</Label>
                                                <PhoneInput
                                                    id="req-phone"
                                                    value={requestForm.contact_phone}
                                                    onValueChange={(val) => setRequestForm(prev => ({ ...prev, contact_phone: val }))}
                                                    placeholder="6XX XX XX XX"
                                                    required
                                                    className="bg-background"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Nous vous contacterons sur ce numéro pour confirmer votre demande
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Location */}
                                    {requestStep === 3 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="req-location">Adresse / Localisation</Label>
                                                <Input
                                                    id="req-location"
                                                    value={requestForm.location}
                                                    onChange={(e) => setRequestForm(prev => ({ ...prev, location: e.target.value }))}
                                                    placeholder="Quartier, rue, repère..."
                                                    required
                                                    className="bg-background h-12 text-base"
                                                    autoFocus
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Soyez le plus précis possible (quartier, rue, point de repère)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Details + Recap */}
                                    {requestStep === 4 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="req-details">Détails supplémentaires <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                                                <Textarea
                                                    id="req-details"
                                                    value={requestForm.details}
                                                    onChange={(e) => setRequestForm(prev => ({ ...prev, details: e.target.value }))}
                                                    placeholder="Précisez votre demande (quantité, horaire souhaité, etc.)"
                                                    className="bg-background min-h-[100px]"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Recap */}
                                            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-2">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Récapitulatif</p>
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {requestForm.service_types.map(serviceType => {
                                                            const selectedService = SERVICE_TYPES.find(s => s.value === serviceType);
                                                            if (!selectedService) return null;
                                                            return (
                                                                <div key={serviceType} className="flex items-center gap-2 bg-background/50 pr-3 rounded-full border border-border/50">
                                                                    <div className={`w-8 h-8 rounded-full ${selectedService.bg} flex items-center justify-center`}>
                                                                        <selectedService.icon className={`h-4 w-4 ${selectedService.color}`} />
                                                                    </div>
                                                                    <span className="text-sm font-medium">{selectedService.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-3.5 w-3.5 text-african-green" />
                                                        {requestForm.contact_name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-3.5 w-3.5 text-african-green" />
                                                        {requestForm.contact_phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="h-3.5 w-3.5 text-african-green" />
                                                        {requestForm.location}
                                                    </div>
                                                </div>
                                            </div>

                                            {discountAvailable && (
                                                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                                    <Gift className="h-5 w-5 text-green-500" />
                                                    <p className="text-sm text-green-700 dark:text-green-400">
                                                        Votre réduction de 30% sera appliquée à cette commande !
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex gap-3 mt-8">
                                    {requestStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevRequestStep}
                                            disabled={stepAnimating}
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Retour
                                        </Button>
                                    )}

                                    {requestStep < REQUEST_STEPS.length ? (
                                        <Button
                                            type="button"
                                            variant="cta"
                                            onClick={nextRequestStep}
                                            disabled={stepAnimating}
                                            className="flex-1"
                                        >
                                            Continuer
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button type="submit" variant="cta" className="flex-1" disabled={submittingRequest}>
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
                                    )}
                                </div>
                            </form>

                            {/* Step counter */}
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Étape {requestStep} sur {REQUEST_STEPS.length}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: Service History */}
                <TabsContent value="history" className="space-y-6">
                    {/* Active Requests with Progress */}
                    {activeRequests.length > 0 && (
                        <Card className="shadow-card border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Loader className="h-5 w-5 text-amber-500 animate-spin" />
                                    Demandes en cours ({activeRequests.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeRequests.map((req) => {
                                    const ServiceIcon = getServiceIcon(req.service_type);
                                    const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.new;
                                    const step = getProgressStep(req.status);
                                    const progressPercent = Math.min((step / 4) * 100, 100);
                                    return (
                                        <div key={req.id} className="p-4 bg-secondary/20 rounded-xl border border-border/50 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                                        <ServiceIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{getServiceLabel(req.service_type)}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`${statusInfo.color} text-white`}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span className={step >= 1 ? 'text-blue-500 font-semibold' : ''}>Soumis</span>
                                                    <span className={step >= 2 ? 'text-emerald-500 font-semibold' : ''}>Accepté</span>
                                                    <span className={step >= 3 ? 'text-amber-500 font-semibold' : ''}>En cours</span>
                                                    <span className={step >= 4 ? 'text-green-600 font-semibold' : ''}>Traité</span>
                                                </div>
                                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-emerald-500 to-green-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                            {/* Agent & Notes */}
                                            {req.assigned_agent_name && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-muted-foreground">Agent affecté :</span>
                                                    <span className="font-medium">{req.assigned_agent_name}</span>
                                                </div>
                                            )}
                                            {req.progress_note && (
                                                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
                                                    <span className="font-semibold text-amber-600">Note : </span>
                                                    {req.progress_note}
                                                </div>
                                            )}
                                            {req.status === 'new' && (
                                                <Button size="sm" variant="outline" className="text-red-500 text-xs" onClick={() => handleCancelRequest(req.id)}>
                                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Annuler
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Full History */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-primary" />
                                        Historique des services
                                    </CardTitle>
                                    <CardDescription>
                                        Consultez l'historique de toutes vos demandes
                                    </CardDescription>
                                </div>
                                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes</SelectItem>
                                        <SelectItem value="new">En attente</SelectItem>
                                        <SelectItem value="approved">Acceptées</SelectItem>
                                        <SelectItem value="in_progress">En cours</SelectItem>
                                        <SelectItem value="completed">Traitées</SelectItem>
                                        <SelectItem value="rejected">Refusées</SelectItem>
                                        <SelectItem value="cancelled">Annulées</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingRequests ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredHistoryRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <History className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="font-heading text-lg font-semibold mb-2">Aucune demande</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {historyFilter === 'all' ? "Vous n'avez pas encore effectué de demande de service." : 'Aucune demande avec ce statut.'}
                                    </p>
                                    {historyFilter === 'all' && (
                                        <Button variant="cta" className="mt-4" onClick={() => setActiveTab('request')}>
                                            Faire une demande
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredHistoryRequests.map((req) => {
                                        const ServiceIcon = getServiceIcon(req.service_type);
                                        const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.new;
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <div key={req.id} className="p-4 bg-secondary/20 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                                            <ServiceIcon className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{getServiceLabel(req.service_type)}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(req.created_at).toLocaleDateString('fr-FR', {
                                                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                {/* Extra details */}
                                                <div className="ml-13 pl-[52px] space-y-1">
                                                    {req.assigned_agent_name && (
                                                        <p className="text-xs flex items-center gap-1.5">
                                                            <UserCheck className="h-3 w-3 text-emerald-500" />
                                                            <span className="text-muted-foreground">Agent :</span>
                                                            <span className="font-medium">{req.assigned_agent_name}</span>
                                                        </p>
                                                    )}
                                                    {req.approved_at && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            Accepté le {new Date(req.approved_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                    {req.started_at && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <Play className="h-3 w-3 text-amber-500" />
                                                            Démarré le {new Date(req.started_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                    {req.completed_at && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                            Traité le {new Date(req.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                    {req.rejected_at && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <Ban className="h-3 w-3 text-red-500" />
                                                            Refusé le {new Date(req.rejected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                    {req.rejection_reason && (
                                                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs mt-1">
                                                            <span className="font-semibold text-red-600">Motif : </span>
                                                            {req.rejection_reason}
                                                        </div>
                                                    )}
                                                    {req.progress_note && (
                                                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs mt-1">
                                                            <span className="font-semibold text-amber-600">Note : </span>
                                                            {req.progress_note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats summary */}
                    {requests.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-xl font-bold text-blue-500">{pendingRequests.length}</p>
                                    <p className="text-[10px] text-muted-foreground">En attente</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-xl font-bold text-emerald-500">{approvedRequests.length}</p>
                                    <p className="text-[10px] text-muted-foreground">Acceptées</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-xl font-bold text-amber-500">{inProgressRequests.length}</p>
                                    <p className="text-[10px] text-muted-foreground">En cours</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-xl font-bold text-green-600">{completedRequests.length}</p>
                                    <p className="text-[10px] text-muted-foreground">Traitées</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-3 text-center">
                                    <p className="text-xl font-bold text-red-500">{rejectedRequests.length}</p>
                                    <p className="text-[10px] text-muted-foreground">Refusées</p>
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
