import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Flame,
    Shirt,
    Trash2,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    Building2,
    Star,
    Users,
    Clock,
    Shield,
    MapPin,
    X,
    Send,
    Bug,
    Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { GAS_BRANDS, GAS_SIZES, PARCEL_TYPES, INT_DESTINATIONS, CITIES, LAUNDRY_TYPES, NETTOYAGE_PRO_SERVICES, SANITATION_SERVICES, WASTE_TYPES, WASTE_FREQUENCIES, HOUSING_TYPES, CAR_TYPES, FURNITURE_MATERIALS, MATTRESS_SIZES, INTERVENTION_LOCATIONS, EVENT_SPACES, TYPES_LOGEMENT, BUDGET_RANGES, MOVE_SIZES, WORK_TYPES } from "@/lib/constants";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

type ServiceType = 'colis' | 'gaz' | 'lessive' | 'poubelles' | 'nettoyage' | 'logements' | 'demenagement' | null;

const services = [
    { id: 'poubelles', label: "Gestion d'ordure", icon: Trash2, color: 'text-green-500', bg: 'bg-gradient-to-br from-green-500 to-emerald-500', border: 'border-green-200' },
    { id: 'gaz', label: 'Livraison de gaz', icon: Flame, color: 'text-orange-500', bg: 'bg-gradient-to-br from-orange-500 to-red-500', border: 'border-orange-200' },
    { id: 'colis', label: 'Expédition de colis', icon: Package, color: 'text-blue-500', bg: 'bg-gradient-to-br from-blue-500 to-indigo-500', border: 'border-blue-200' },
    { id: 'lessive', label: 'Ramassage lessive', icon: Shirt, color: 'text-violet-500', bg: 'bg-gradient-to-br from-violet-500 to-purple-500', border: 'border-violet-200' },
    { id: 'nettoyage', label: 'Nettoyage & Assainissement', icon: Sparkles, color: 'text-teal-500', bg: 'bg-gradient-to-br from-teal-500 to-green-500', border: 'border-teal-200' },
    { id: 'logements', label: 'Recherche de logements', icon: Building2, color: 'text-rose-500', bg: 'bg-gradient-to-br from-rose-500 to-pink-500', border: 'border-rose-200' },
    { id: 'demenagement', label: 'Déménagement & Aménagement', icon: Truck, color: 'text-amber-600', bg: 'bg-gradient-to-br from-amber-500 to-yellow-600', border: 'border-amber-200' },
];

const stats = [
    { value: "2000+", label: "Clients satisfaits", icon: Users },
    { value: "500+", label: "Services/mois", icon: Package },
    { value: "24h", label: "Réponse garantie", icon: Clock },
    { value: "100%", label: "Fiable & sécurisé", icon: Shield },
];

export function HeroBookingWizard() {
    const [step, setStep] = useState(0);
    const [subStep, setSubStep] = useState(1);
    const [selectedService, setSelectedService] = useState<ServiceType>(null);
    const [loading, setLoading] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderForm, setOrderForm] = useState({
        nom: '',
        telephone: '',
        service: '',
        description: '',
        adresse: '',
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        details: '',
        quantity: '1',
        bottleBrand: '',
        bottleSize: '12.5kg',
        destinationType: 'national',
        parcelType: '',
        laundryType: '',
        cleaningCategory: '',
        cleaningTypes: [] as string[],
        wasteType: '',
        wasteFrequency: '',
        urgency: 'standard',
        destinationAddress: '',
        pickupAddress: '',
        deliveryAddress: '',
        contactName: '',
        contactPhone: '',
        // Logement fields
        logementSearchType: '',
        logementTypes: [] as string[],
        logementCity: '',
        logementBudget: '',
        // Demenagement fields
        demenagementType: '',
        moveSize: '',
        moveFromCity: '',
        moveToCity: '',
        workTypes: [] as string[],
    });

    const handleServiceSelect = (id: string) => {
        setSelectedService(id as ServiceType);
        setStep(1);
    };

    const handleNext = () => {
        if (step === 1) {
            // Validation for the active service
            if (selectedService === 'gaz' && !formData.bottleBrand) {
                toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir la marque de la bouteille." });
                return;
            }
            if (selectedService === 'colis') {
                if (subStep === 1 && !formData.destinationType) return;
                if (subStep === 2) {
                    if (!formData.parcelType) {
                        toast({ variant: "destructive", title: "Oups", description: "Quel type de colis envoyez-vous ?" });
                        return;
                    }
                    if (!formData.destinationAddress) {
                        toast({ variant: "destructive", title: "Oups", description: "Où envoyez-vous le colis ?" });
                        return;
                    }
                }
            }
            if (selectedService === 'lessive') {
                if (subStep === 1 && !formData.laundryType) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir le type de linge." });
                    return;
                }
            }
            if (selectedService === 'nettoyage') {
                if (subStep === 1 && !formData.cleaningCategory) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir une catégorie." });
                    return;
                }
                if (subStep === 2 && formData.cleaningTypes.length === 0) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir au moins une prestation." });
                    return;
                }
            }
            if (selectedService === 'poubelles') {
                if (subStep === 1 && !formData.wasteType) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir le secteur d'activité." });
                    return;
                }
                if (subStep === 2 && !formData.wasteFrequency) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir la fréquence de collecte." });
                    return;
                }
            }
            if (selectedService === 'logements') {
                if (subStep === 1 && !formData.logementSearchType) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez indiquer si vous cherchez ou proposez un logement." });
                    return;
                }
                if (subStep === 2 && formData.logementTypes.length === 0) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir au moins un type de logement." });
                    return;
                }
                if (subStep === 3 && formData.logementSearchType === 'cherche' && (!formData.logementCity || !formData.logementBudget)) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez indiquer la ville et le budget." });
                    return;
                }
            }
            if (selectedService === 'demenagement') {
                if (subStep === 1 && !formData.demenagementType) {
                    toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir le type de besoin." });
                    return;
                }
                if (subStep === 2) {
                    if (formData.demenagementType === 'demenagement') {
                        if (!formData.moveSize) {
                            toast({ variant: "destructive", title: "Oups", description: "Veuillez indiquer la taille du bien." });
                            return;
                        }
                        if (!formData.moveFromCity || !formData.moveToCity) {
                            toast({ variant: "destructive", title: "Oups", description: "Veuillez indiquer les villes de départ et d'arrivée." });
                            return;
                        }
                    } else if (formData.demenagementType === 'amenagement') {
                        if (formData.workTypes.length === 0) {
                            toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir au moins un type de travaux." });
                            return;
                        }
                    }
                }
            }

            // Navigation within Step 1
            const maxSubSteps = (service: ServiceType) => {
                if (service === 'colis') return 3;
                if (service === 'lessive') return 2;
                if (service === 'nettoyage') return 3;
                if (service === 'poubelles') return 2;
                if (service === 'logements') return 3;
                if (service === 'demenagement') return 2;
                return 1;
            };

            if (subStep < maxSubSteps(selectedService)) {
                setSubStep(subStep + 1);
            } else {
                setStep(2);
            }
        } else if (step === 2) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!formData.contactName || !formData.contactPhone) {
            toast({ variant: "destructive", title: "Information manquante", description: "Votre nom et téléphone sont nécessaires pour vous contacter." });
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                ...formData,
                bottleType: formData.bottleBrand ? `${formData.bottleBrand} ${formData.bottleSize} ` : '',
                cleaningType: formData.cleaningTypes.join(', '),
                logementType: formData.logementTypes.join(', '),
                moveDetails: formData.demenagementType === 'demenagement'
                    ? `Déménagement: ${formData.moveSize} de ${formData.moveFromCity} à ${formData.moveToCity} `
                    : `Aménagement: ${formData.workTypes.join(', ')} `,
                source: 'wizard_homepage_premium'
            };

            // Map demenagement to nettoyage to satisfy DB constraint if needed, or specific service if available.
            // Based on order form logic, 'nettoyage' is used as a fallback for 'autre'.
            // 'logement' should be 'logements'.
            const dbServiceType = selectedService === 'demenagement' ? 'nettoyage' : selectedService;

            const { error } = await supabase.from('requests').insert({
                service_type: dbServiceType,
                payload: payload,
                contact_name: formData.contactName,
                contact_phone: formData.contactPhone,
                status: 'new',
            });

            if (error) throw error;

            setStep(3);
            toast({ title: "C'est dans la poche ! 🎉", description: "Votre demande est reçue. On vous appelle très vite." });
        } catch (error: any) {
            console.error('Submission error:', error);
            toast({
                variant: "destructive",
                title: "Erreur technique",
                description: error.message || "Impossible d'envoyer la demande. Vérifiez votre connexion."
            });
        } finally {
            setLoading(false);
        }
    };

    const resetWizard = () => {
        setStep(0);
        setSubStep(1);
        setSelectedService(null);
        setFormData({
            details: '',
            quantity: '1',
            bottleBrand: '',
            bottleSize: '12.5kg',
            destinationType: 'national',
            parcelType: '',
            laundryType: '',
            cleaningCategory: '',
            cleaningTypes: [],
            wasteType: '',
            wasteFrequency: '',
            urgency: 'standard',
            destinationAddress: '',
            pickupAddress: '',
            deliveryAddress: '',
            contactName: '',
            contactPhone: '',
            logementSearchType: '',
            logementTypes: [],
            logementCity: '',
            logementBudget: '',
            demenagementType: '',
            moveSize: '',
            moveFromCity: '',
            moveToCity: '',
            workTypes: [],
        });
    };

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderForm.nom || !orderForm.telephone || !orderForm.service || !orderForm.description) {
            toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires." });
            return;
        }

        // Map 'autre' to a valid service type (using 'nettoyage' as generic service fallback)
        const validServiceType = orderForm.service === 'autre' ? 'nettoyage' : orderForm.service;

        setOrderLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: validServiceType,
                payload: {
                    type: 'commande_generale',
                    nom: orderForm.nom,
                    telephone: orderForm.telephone,
                    service_demande: orderForm.service,
                    description: orderForm.description,
                    adresse: orderForm.adresse,
                },
                contact_name: orderForm.nom,
                contact_phone: orderForm.telephone,
                status: 'new',
            });

            if (error) throw error;

            toast({ title: "Commande envoyée ! 🎉", description: "Nous vous contacterons très rapidement." });
            setShowOrderModal(false);
            setOrderForm({ nom: '', telephone: '', service: '', description: '', adresse: '' });
        } catch (error: any) {
            console.error('Order submission error:', error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'envoyer la commande." });
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <section className="relative min-h-[90vh] w-full flex flex-col overflow-hidden">
            {/* Hero Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-african-green/5 via-background to-african-yellow/5" />

            {/* Decorative patterns */}
            <div className="absolute inset-0 african-pattern opacity-30" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-african-green/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-african-yellow/10 to-transparent rounded-full blur-3xl" />

            {/* Animated floating elements */}
            <div className="hidden lg:block absolute top-20 right-20 w-20 h-20 bg-african-yellow/20 rounded-full animate-float blur-xl" />
            <div className="hidden lg:block absolute bottom-40 left-20 w-16 h-16 bg-african-green/20 rounded-full animate-float blur-xl" style={{ animationDelay: '1s' }} />
            <div className="hidden lg:block absolute top-1/2 right-1/4 w-12 h-12 bg-african-red/20 rounded-full animate-float blur-xl" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-2 sm:px-4 lg:px-8 relative z-10 flex-1 flex items-center py-8 sm:py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-20 items-center w-full">

                    {/* Left Column: Hero Content */}
                    <div className="order-2 lg:order-1 space-y-4 sm:space-y-8 text-center lg:text-left">
                        {/* CTA Buttons */}
                        <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                            <Button
                                variant="cta"
                                size="sm"
                                className="rounded-full shadow-lg text-xs sm:text-sm"
                                onClick={() => setShowOrderModal(true)}
                            >
                                Commandez maintenant
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-african-green/30 text-african-green hover:bg-african-green/10 text-xs sm:text-sm"
                                onClick={() => window.open(`https://wa.me/237690547084?text=${encodeURIComponent('Bonjour, je souhaite obtenir un devis gratuit.')}`, '_blank')}
                            >
                                Obtenir un devis gratuitement
                            </Button >
                        </div >

                        {/* Main Title */}
                        < div className="space-y-4" >
                            <h1 className="font-heading font-extrabold text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                                Votre quotidien,{" "}
                                <span className="relative">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-african-green via-primary to-african-yellow">
                                        simplifié
                                    </span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 8C50 2 150 2 198 8" stroke="url(#underline-gradient)" strokeWidth="4" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                                                <stop stopColor="hsl(var(--african-green))" />
                                                <stop offset="0.5" stopColor="hsl(var(--primary))" />
                                                <stop offset="1" stopColor="hsl(var(--african-yellow))" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                                Poubelle, gaz, colis, lessive, nettoyage ou recherche de logement — <strong className="text-foreground">Le Bon Petit</strong> s'occupe de tout.
                                Un service camerounais moderne, fiable et à votre portée.
                            </p>
                        </div >

                        {/* Action Question Section */}
                        < div className="space-y-4 max-w-xl mx-auto lg:mx-0" >
                            <h3 className="text-sm sm:text-lg font-heading font-bold text-foreground text-center lg:text-left">
                                Que voulez-vous faire aujourd'hui ?
                            </h3>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                                {[
                                    { label: 'Jeter ?', emoji: '🗑️', service: 'poubelles', color: 'from-green-500 to-emerald-500' },
                                    { label: 'Nettoyer ?', emoji: '✨', service: 'nettoyage', color: 'from-teal-500 to-cyan-500' },
                                    { label: 'Livrer ?', emoji: '📦', service: 'colis', color: 'from-blue-500 to-indigo-500' },
                                    { label: 'Louer ?', emoji: '🏠', service: 'logements', color: 'from-rose-500 to-pink-500' },
                                    { label: 'Laver ?', emoji: '👕', service: 'lessive', color: 'from-violet-500 to-purple-500' },
                                    { label: 'Déménager ?', emoji: '🚚', service: 'demenagement', color: 'from-amber-500 to-yellow-600' },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => {
                                            handleServiceSelect(action.service);
                                            document.getElementById('service-selection')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="group relative px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-background/80 border-2 border-border/50 hover:border-transparent active:scale-95 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                        <span className="relative flex items-center gap-1 sm:gap-2 font-bold text-xs sm:text-base text-foreground group-hover:text-white transition-colors duration-300">
                                            <span className="text-base sm:text-xl group-hover:animate-bounce">{action.emoji}</span>
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div >

                        {/* Features Grid */}
                        < div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0" >
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-african-green/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-african-green" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Service rapide</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-african-yellow/10 flex items-center justify-center shrink-0">
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-african-yellow" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Prix transparents</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-african-red/10 flex items-center justify-center shrink-0">
                                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-african-red" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">100% fiable</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium">Partout à Douala</span>
                            </div>
                        </div >

                        {/* Stats Bar */}
                        < div className="hidden lg:flex items-center gap-8 pt-4" >
                            {
                                stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <p className="font-heading font-bold text-2xl text-foreground">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))
                            }
                        </div >
                    </div >

                    {/* Right Column: Service Selection Card */}
                    < div className="order-1 lg:order-2 w-full max-w-xl mx-auto lg:mx-0" >
                        <div className="relative">
                            {/* Glow effect behind card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-african-green/20 via-primary/20 to-african-yellow/20 rounded-[2.5rem] blur-2xl transform scale-95" />

                            <div id="service-selection" className="relative bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 overflow-hidden">
                                {/* Card header decoration */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-african-green via-primary to-african-yellow" />

                                <div className="relative z-10">
                                    {step === 0 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="text-center space-y-2">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Commandez en 2 min
                                                </div>
                                                <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-foreground">
                                                    {new Date().getHours() >= 18 ? "Bonsoir ! 👋" : "Bonjour ! 👋"}
                                                </h2>
                                                <p className="text-muted-foreground">
                                                    Quel service vous intéresse ?
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                                {services.map((service) => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => handleServiceSelect(service.id)}
                                                        className="group flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                                    >
                                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${service.bg} flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                            <service.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                                        </div>
                                                        <span className="text-[10px] sm:text-xs font-bold text-foreground text-center leading-tight">{service.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Trust indicators */}
                                            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-african-green to-african-yellow flex items-center justify-center text-xs font-bold text-white border-2 border-background"
                                                        >
                                                            {["JD", "AM", "KE", "SN"][i - 1]}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                            <Star key={i} className="w-3 h-3 fill-african-yellow text-african-yellow" />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">+2000 clients satisfaits</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step > 0 && step < 3 && (
                                        <div className="animate-fade-in flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-6">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (subStep > 1) {
                                                            setSubStep(subStep - 1);
                                                        } else {
                                                            setStep(step - 1);
                                                        }
                                                    }}
                                                    className="rounded-full shadow-md border border-border bg-white hover:bg-gray-100 text-foreground dark:text-black font-bold px-4"
                                                >
                                                    <ChevronLeft className="w-5 h-5 mr-1" /> REVENIR
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2].map((s) => (
                                                        <div key={s} className={`w-8 h-2 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-border'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <h2 className="text-xl font-bold text-foreground mb-6">
                                                {step === 1 ? (selectedService === 'gaz' ? '🔥 Quelle bouteille ?' : (selectedService === 'nettoyage' && subStep === 1) ? '✨ Quel type de prestation ?' : '📝 Décrivez votre besoin') : '📍 Vos coordonnées'}
                                            </h2>

                                            <div className="space-y-4 flex-grow">
                                                {step === 1 && (
                                                    <>
                                                        {selectedService === 'gaz' && (
                                                            <>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Marque de la bouteille</Label>
                                                                        <Select
                                                                            value={formData.bottleBrand}
                                                                            onValueChange={(v) => setFormData({ ...formData, bottleBrand: v })}
                                                                        >
                                                                            <SelectTrigger className="h-12">
                                                                                <SelectValue placeholder="Choisir une marque..." />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {GAS_BRANDS.map(brand => (
                                                                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label>Taille de la bouteille</Label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {GAS_SIZES.map((size) => {
                                                                                const isSelected = formData.bottleSize === size.id;
                                                                                return (
                                                                                    <div
                                                                                        key={size.id}
                                                                                        onClick={() => setFormData({ ...formData, bottleSize: size.id })}
                                                                                        className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                    >
                                                                                        <span className={`block font-bold text-sm ${isSelected ? 'text-primary' : ''}`}>{size.id}</span>
                                                                                        <span className="text-[10px] text-muted-foreground block leading-tight">{size.usage.split(' / ')[0]}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2 pt-2">
                                                                    <Label>Quantité</Label>
                                                                    <Input type="number" min="1" className="h-12" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                                                                </div>
                                                            </>
                                                        )}
                                                        {selectedService === 'colis' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Où envoyez-vous ?</Label>
                                                                        <RadioGroup
                                                                            value={formData.destinationType}
                                                                            onValueChange={v => setFormData({ ...formData, destinationType: v })}
                                                                            className="grid grid-cols-1 gap-3"
                                                                        >
                                                                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.destinationType === 'national' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}>
                                                                                <RadioGroupItem value="national" />
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-bold">National (Cameroun)</span>
                                                                                    <span className="text-xs text-muted-foreground">Livraison entre villes camerounaises</span>
                                                                                </div>
                                                                            </label>
                                                                            <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.destinationType === 'international' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}>
                                                                                <RadioGroupItem value="international" />
                                                                                <div className="flex flex-col">
                                                                                    <span className="font-bold">International</span>
                                                                                    <span className="text-xs text-muted-foreground">Envoi vers l'étranger (Europe, USA...)</span>
                                                                                </div>
                                                                            </label>
                                                                        </RadioGroup>
                                                                    </div>
                                                                )}

                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="font-bold">Type de colis</Label>
                                                                            <Select
                                                                                value={formData.parcelType}
                                                                                onValueChange={v => setFormData({ ...formData, parcelType: v })}
                                                                            >
                                                                                <SelectTrigger className="h-12">
                                                                                    <SelectValue placeholder="Que contient le colis ?" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {PARCEL_TYPES.map(type => (
                                                                                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <Label className="font-bold">Destination</Label>
                                                                            {formData.destinationType === 'national' ? (
                                                                                <Select
                                                                                    value={formData.destinationAddress}
                                                                                    onValueChange={v => setFormData({ ...formData, destinationAddress: v })}
                                                                                >
                                                                                    <SelectTrigger className="h-12">
                                                                                        <SelectValue placeholder="Vers quelle ville ?" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {CITIES.map(city => (
                                                                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            ) : (
                                                                                <Select
                                                                                    value={formData.destinationAddress}
                                                                                    onValueChange={v => setFormData({ ...formData, destinationAddress: v })}
                                                                                >
                                                                                    <SelectTrigger className="h-12">
                                                                                        <SelectValue placeholder="Vers quel pays ?" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {INT_DESTINATIONS.map(country => (
                                                                                            <SelectItem key={country} value={country}>{country}</SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {subStep === 3 && (
                                                                    <div className="space-y-2">
                                                                        <Label className="font-bold">Détails (Optionnel)</Label>
                                                                        <Textarea
                                                                            className="min-h-[120px] resize-none"
                                                                            placeholder="Description plus précise, poids estimé, urgence..."
                                                                            value={formData.details}
                                                                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedService === 'lessive' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Quel type de linge ?</Label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {LAUNDRY_TYPES.map((type) => (
                                                                                <div
                                                                                    key={type}
                                                                                    onClick={() => setFormData({ ...formData, laundryType: type })}
                                                                                    className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.laundryType === type ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                >
                                                                                    <span className={`block font-bold text-xs ${formData.laundryType === type ? 'text-primary' : ''}`}>{type}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="font-bold">Urgence</Label>
                                                                            <RadioGroup
                                                                                value={formData.urgency}
                                                                                onValueChange={v => setFormData({ ...formData, urgency: v })}
                                                                                className="grid grid-cols-1 gap-2"
                                                                            >
                                                                                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.urgency === 'express' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <RadioGroupItem value="express" />
                                                                                        <span className="font-bold text-sm">Express (24h)</span>
                                                                                    </div>
                                                                                    <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200">+ Vite</Badge>
                                                                                </label>
                                                                                <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.urgency === 'standard' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <RadioGroupItem value="standard" />
                                                                                        <span className="font-bold text-sm">Standard (48h)</span>
                                                                                    </div>
                                                                                </label>
                                                                            </RadioGroup>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="font-bold">Détails (Optionnel)</Label>
                                                                            <Textarea
                                                                                className="min-h-[80px] resize-none"
                                                                                placeholder="Instructions particulières..."
                                                                                value={formData.details}
                                                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedService === 'nettoyage' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <button
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, cleaningCategory: 'nettoyage' });
                                                                                setSubStep(2);
                                                                            }}
                                                                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-100 hover:border-teal-400 hover:shadow-lg transition-all duration-300 group"
                                                                        >
                                                                            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                                                <Sparkles className="w-8 h-8 text-teal-600" />
                                                                            </div>
                                                                            <span className="font-bold text-teal-900 text-center">Nettoyage Pro</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, cleaningCategory: 'assainissement' });
                                                                                setSubStep(2);
                                                                            }}
                                                                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-green-200 bg-green-50/50 hover:bg-green-100 hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
                                                                        >
                                                                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                                                <Bug className="w-8 h-8 text-green-600" />
                                                                            </div>
                                                                            <span className="font-bold text-foreground text-center">Assainissement</span>
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">
                                                                            {formData.cleaningCategory === 'nettoyage' ? 'Que devons-nous nettoyer ?' : 'Quel traitement faut-il ?'}
                                                                        </Label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {(formData.cleaningCategory === 'nettoyage' ? NETTOYAGE_PRO_SERVICES : SANITATION_SERVICES).map((service) => {
                                                                                const isSelected = formData.cleaningTypes.includes(service.id);
                                                                                return (
                                                                                    <div
                                                                                        key={service.id}
                                                                                        onClick={() => {
                                                                                            const current = formData.cleaningTypes;
                                                                                            const newTypes = current.includes(service.id)
                                                                                                ? current.filter(id => id !== service.id)
                                                                                                : [...current, service.id];
                                                                                            setFormData({ ...formData, cleaningTypes: newTypes });
                                                                                        }}
                                                                                        className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                    >
                                                                                        <span className={`block font-bold text-xs ${isSelected ? 'text-primary' : ''}`}>{service.label}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {subStep === 3 && (
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="font-bold">Détails (Surface, instruction particulière...)</Label>
                                                                            <Textarea
                                                                                className="min-h-[120px] resize-none"
                                                                                placeholder="Précisez la surface, le nombre de pièces ou toute instruction..."
                                                                                value={formData.details}
                                                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedService === 'poubelles' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Pour quel secteur ?</Label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {WASTE_TYPES.map((type) => (
                                                                                <div
                                                                                    key={type.id}
                                                                                    onClick={() => setFormData({ ...formData, wasteType: type.id })}
                                                                                    className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.wasteType === type.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                >
                                                                                    <span className={`block font-bold text-xs ${formData.wasteType === type.id ? 'text-primary' : ''}`}>{type.label}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Fréquence de collecte</Label>
                                                                        <div className="grid grid-cols-1 gap-2">
                                                                            {WASTE_FREQUENCIES.map((freq) => (
                                                                                <div
                                                                                    key={freq.id}
                                                                                    onClick={() => setFormData({ ...formData, wasteFrequency: freq.id })}
                                                                                    className={`cursor-pointer p-3 rounded-xl border-2 flex items-center justify-between transition-all ${formData.wasteFrequency === freq.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                >
                                                                                    <span className={`font-bold text-sm ${formData.wasteFrequency === freq.id ? 'text-primary' : ''}`}>{freq.label}</span>
                                                                                    {formData.wasteFrequency === freq.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="space-y-2 pt-2">
                                                                            <Label className="font-bold">Détails (Volume, déchets spéciaux...)</Label>
                                                                            <Textarea
                                                                                className="min-h-[80px] resize-none"
                                                                                placeholder="Précisez le volume ou toute instruction..."
                                                                                value={formData.details}
                                                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedService === 'logements' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Que recherchez-vous ?</Label>
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            <div
                                                                                onClick={() => setFormData({ ...formData, logementSearchType: 'cherche' })}
                                                                                className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.logementSearchType === 'cherche' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                            >
                                                                                <span className="text-2xl">🏠</span>
                                                                                <div>
                                                                                    <span className={`block font-bold ${formData.logementSearchType === 'cherche' ? 'text-primary' : ''}`}>Je cherche un logement</span>
                                                                                    <span className="text-xs text-muted-foreground">Appartement, studio, maison...</span>
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                onClick={() => setFormData({ ...formData, logementSearchType: 'propose' })}
                                                                                className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.logementSearchType === 'propose' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                            >
                                                                                <span className="text-2xl">🔑</span>
                                                                                <div>
                                                                                    <span className={`block font-bold ${formData.logementSearchType === 'propose' ? 'text-primary' : ''}`}>Je propose un logement</span>
                                                                                    <span className="text-xs text-muted-foreground">Publier mon bien à louer</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Type de logement</Label>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {TYPES_LOGEMENT.map((type) => {
                                                                                const isSelected = formData.logementTypes.includes(type);
                                                                                return (
                                                                                    <div
                                                                                        key={type}
                                                                                        onClick={() => {
                                                                                            const current = formData.logementTypes;
                                                                                            const newTypes = current.includes(type)
                                                                                                ? current.filter(t => t !== type)
                                                                                                : [...current, type];
                                                                                            setFormData({ ...formData, logementTypes: newTypes });
                                                                                        }}
                                                                                        className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                    >
                                                                                        <span className={`block font-bold text-xs ${isSelected ? 'text-primary' : ''}`}>{type}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {subStep === 3 && (
                                                                    <div className="space-y-4">
                                                                        {formData.logementSearchType === 'cherche' ? (
                                                                            <>
                                                                                <div className="space-y-2">
                                                                                    <Label className="font-bold">Dans quelle ville ?</Label>
                                                                                    <Select
                                                                                        value={formData.logementCity}
                                                                                        onValueChange={(v) => setFormData({ ...formData, logementCity: v })}
                                                                                    >
                                                                                        <SelectTrigger className="h-12">
                                                                                            <SelectValue placeholder="Choisir une ville..." />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {CITIES.map(city => (
                                                                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label className="font-bold">Budget mensuel</Label>
                                                                                    <Select
                                                                                        value={formData.logementBudget}
                                                                                        onValueChange={(v) => setFormData({ ...formData, logementBudget: v })}
                                                                                    >
                                                                                        <SelectTrigger className="h-12">
                                                                                            <SelectValue placeholder="Votre budget..." />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {BUDGET_RANGES.map(range => (
                                                                                                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="space-y-2">
                                                                                <Label className="font-bold">Détails de votre bien</Label>
                                                                                <Textarea
                                                                                    className="min-h-[100px] resize-none"
                                                                                    placeholder="Décrivez votre bien (emplacement, équipements, loyer souhaité...)"
                                                                                    value={formData.details}
                                                                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedService === 'demenagement' && (
                                                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                                {subStep === 1 && (
                                                                    <div className="space-y-4">
                                                                        <Label className="text-base font-bold">Quel est votre besoin ?</Label>
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            <div
                                                                                onClick={() => setFormData({ ...formData, demenagementType: 'demenagement' })}
                                                                                className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.demenagementType === 'demenagement' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                            >
                                                                                <span className="text-2xl">🚛</span>
                                                                                <div>
                                                                                    <span className={`block font-bold ${formData.demenagementType === 'demenagement' ? 'text-primary' : ''}`}>Je déménage</span>
                                                                                    <span className="text-xs text-muted-foreground">Transport et manutention</span>
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                onClick={() => setFormData({ ...formData, demenagementType: 'amenagement' })}
                                                                                className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.demenagementType === 'amenagement' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                            >
                                                                                <span className="text-2xl">🛠️</span>
                                                                                <div>
                                                                                    <span className={`block font-bold ${formData.demenagementType === 'amenagement' ? 'text-primary' : ''}`}>Aménagement / Travaux</span>
                                                                                    <span className="text-xs text-muted-foreground">Bricolage, montage, peinture...</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {subStep === 2 && (
                                                                    <div className="space-y-4">
                                                                        {formData.demenagementType === 'demenagement' ? (
                                                                            <>
                                                                                <div className="space-y-2">
                                                                                    <Label className="font-bold">Taille du bien</Label>
                                                                                    <Select
                                                                                        value={formData.moveSize}
                                                                                        onValueChange={(v) => setFormData({ ...formData, moveSize: v })}
                                                                                    >
                                                                                        <SelectTrigger className="h-12">
                                                                                            <SelectValue placeholder="Choisir la taille..." />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {MOVE_SIZES.map(size => (
                                                                                                <SelectItem key={size} value={size}>{size}</SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div className="space-y-2">
                                                                                        <Label className="font-bold">Ville de départ</Label>
                                                                                        <Select
                                                                                            value={formData.moveFromCity}
                                                                                            onValueChange={(v) => setFormData({ ...formData, moveFromCity: v })}
                                                                                        >
                                                                                            <SelectTrigger className="h-12">
                                                                                                <SelectValue placeholder="Ville..." />
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {CITIES.map(city => (
                                                                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                                                ))}
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label className="font-bold">Ville d'arrivée</Label>
                                                                                        <Select
                                                                                            value={formData.moveToCity}
                                                                                            onValueChange={(v) => setFormData({ ...formData, moveToCity: v })}
                                                                                        >
                                                                                            <SelectTrigger className="h-12">
                                                                                                <SelectValue placeholder="Ville..." />
                                                                                            </SelectTrigger>
                                                                                            <SelectContent>
                                                                                                {CITIES.map(city => (
                                                                                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                                                                                ))}
                                                                                            </SelectContent>
                                                                                        </Select>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="space-y-4">
                                                                                <Label className="text-base font-bold">Type de travaux (Choix multiples)</Label>
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    {WORK_TYPES.map((type) => {
                                                                                        const isSelected = formData.workTypes.includes(type);
                                                                                        return (
                                                                                            <div
                                                                                                key={type}
                                                                                                onClick={() => {
                                                                                                    const current = formData.workTypes;
                                                                                                    const newTypes = current.includes(type)
                                                                                                        ? current.filter(t => t !== type)
                                                                                                        : [...current, type];
                                                                                                    setFormData({ ...formData, workTypes: newTypes });
                                                                                                }}
                                                                                                className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                                                                                            >
                                                                                                <span className={`block font-bold text-xs ${isSelected ? 'text-primary' : ''}`}>{type}</span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="space-y-2 pt-2">
                                                                            <Label className="font-bold">Précisions (Étage, dates, etc.)</Label>
                                                                            <Textarea
                                                                                className="min-h-[80px] resize-none"
                                                                                placeholder="Précisez la date souhaitée, s'il y a un ascenseur..."
                                                                                value={formData.details}
                                                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {selectedService !== 'gaz' && selectedService !== 'colis' && selectedService !== 'lessive' && selectedService !== 'nettoyage' && selectedService !== 'poubelles' && selectedService !== 'logements' && selectedService !== 'demenagement' && (
                                                            <div className="space-y-2">
                                                                <Label>Détails de votre besoin</Label>
                                                                <Textarea
                                                                    className="min-h-[120px] resize-none"
                                                                    placeholder="Décrivez ce qu'il faut faire..."
                                                                    value={formData.details}
                                                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                                />
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {step === 2 && (
                                                    <div className="space-y-4">
                                                        <Input
                                                            className="h-12"
                                                            placeholder="Votre nom complet"
                                                            value={formData.contactName}
                                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                        />
                                                        <PhoneInput
                                                            placeholder="Numéro WhatsApp (ex: 699...)"
                                                            value={formData.contactPhone}
                                                            onValueChange={(val) => setFormData({ ...formData, contactPhone: val })}
                                                            className="mb-2"
                                                        />
                                                        <Input
                                                            className="h-12"
                                                            placeholder="Quartier / Adresse"
                                                            value={formData.deliveryAddress}
                                                            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <Button onClick={handleNext} disabled={loading} className="w-full mt-6 h-12 text-lg font-bold rounded-xl" variant="cta">
                                                {loading ? 'Envoi en cours...' : (step === 2 ? '✅ Valider ma commande' : 'Continuer')}
                                                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                                            </Button>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="text-center py-8 animate-fade-in">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                                                <CheckCircle2 className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-foreground mb-2">Merci ! 🎉</h3>
                                            <p className="text-muted-foreground mb-6">
                                                Votre demande est bien reçue.<br />
                                                Notre équipe vous contacte sur WhatsApp dans moins de 5 minutes.
                                            </p>
                                            <Button variant="outline" onClick={resetWizard} className="rounded-full">
                                                Nouvelle demande
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >

            {/* Mobile Stats Bar */}
            < div className="lg:hidden bg-card/80 backdrop-blur-sm border-t border-border py-4" >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-around">
                        {stats.slice(0, 3).map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="font-heading font-bold text-lg text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* Bottom wave */}
            < div className="absolute bottom-0 left-0 right-0 hidden lg:block" >
                <svg viewBox="0 0 1440 60" className="w-full h-auto fill-secondary/30">
                    <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
                </svg>
            </div >

            {/* Modal Commande Générale */}
            {
                showOrderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
                        <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-african-green to-primary p-6 text-white sticky top-0 z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-heading font-bold text-2xl">Commande Rapide</h3>
                                        <p className="text-white/80 text-sm">Décrivez votre besoin, on s'occupe du reste</p>
                                    </div>
                                    <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleOrderSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="order-nom">Nom complet *</Label>
                                        <Input
                                            id="order-nom"
                                            placeholder="Votre nom"
                                            value={orderForm.nom}
                                            onChange={(e) => setOrderForm({ ...orderForm, nom: e.target.value })}
                                            className="h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="order-tel">Téléphone *</Label>
                                        <PhoneInput
                                            id="order-tel"
                                            placeholder="690 547 084"
                                            value={orderForm.telephone}
                                            onValueChange={(val) => setOrderForm({ ...orderForm, telephone: val })}
                                            className="h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order-service">Service souhaité *</Label>
                                    <Select value={orderForm.service} onValueChange={(v) => setOrderForm({ ...orderForm, service: v })}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Choisir un service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="poubelles">Gestion d'ordure</SelectItem>
                                            <SelectItem value="gaz">Livraison de gaz</SelectItem>
                                            <SelectItem value="colis">Expédition de colis</SelectItem>
                                            <SelectItem value="lessive">Ramassage lessive</SelectItem>
                                            <SelectItem value="nettoyage">Nettoyage professionnel</SelectItem>
                                            <SelectItem value="logement">Recherche de logement</SelectItem>
                                            <SelectItem value="autre">Autre service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order-adresse">Adresse / Quartier</Label>
                                    <Input
                                        id="order-adresse"
                                        placeholder="Ex: Bonamoussadi, Douala"
                                        value={orderForm.adresse}
                                        onChange={(e) => setOrderForm({ ...orderForm, adresse: e.target.value })}
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order-desc">Description de votre demande *</Label>
                                    <Textarea
                                        id="order-desc"
                                        placeholder="Décrivez votre besoin en détail..."
                                        value={orderForm.description}
                                        onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                                        className="min-h-[100px] resize-none"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={orderLoading}
                                    className="w-full h-14 bg-gradient-to-r from-african-green to-primary hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-lg"
                                >
                                    {orderLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Envoi en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="w-5 h-5" />
                                            Envoyer ma commande
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                )
            }
        </section >
    );
}
