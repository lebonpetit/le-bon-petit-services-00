import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type ServiceType = 'colis' | 'gaz' | 'lessive' | 'poubelles' | 'nettoyage' | 'logement' | null;

const services = [
    { id: 'gaz', label: 'Livraison de gaz', icon: Flame, color: 'text-orange-500', bg: 'bg-gradient-to-br from-orange-500 to-red-500', border: 'border-orange-200' },
    { id: 'colis', label: 'Expédition de colis', icon: Package, color: 'text-blue-500', bg: 'bg-gradient-to-br from-blue-500 to-indigo-500', border: 'border-blue-200' },
    { id: 'lessive', label: 'Ramassage lessive', icon: Shirt, color: 'text-violet-500', bg: 'bg-gradient-to-br from-violet-500 to-purple-500', border: 'border-violet-200' },
    { id: 'nettoyage', label: 'Nettoyage pro', icon: Sparkles, color: 'text-teal-500', bg: 'bg-gradient-to-br from-teal-500 to-green-500', border: 'border-teal-200' },
    { id: 'poubelles', label: 'Vidage poubelles', icon: Trash2, color: 'text-green-500', bg: 'bg-gradient-to-br from-green-500 to-emerald-500', border: 'border-green-200' },
    { id: 'logement', label: 'Trouver un logement', icon: Building2, color: 'text-rose-500', bg: 'bg-gradient-to-br from-rose-500 to-pink-500', border: 'border-rose-200' },
];

const stats = [
    { value: "2000+", label: "Clients satisfaits", icon: Users },
    { value: "500+", label: "Services/mois", icon: Package },
    { value: "24h", label: "Réponse garantie", icon: Clock },
    { value: "100%", label: "Fiable & sécurisé", icon: Shield },
];

export function HeroBookingWizard() {
    const [step, setStep] = useState(0);
    const [selectedService, setSelectedService] = useState<ServiceType>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        details: '',
        quantity: '1',
        bottleType: '',
        pickupAddress: '',
        deliveryAddress: '',
        contactName: '',
        contactPhone: '',
    });

    const handleServiceSelect = (id: string) => {
        if (id === 'logement') {
            navigate('/logements');
            return;
        }
        setSelectedService(id as ServiceType);
        setStep(1);
    };

    const handleNext = () => {
        if (step === 1) {
            if (selectedService === 'gaz' && !formData.bottleType) {
                toast({ variant: "destructive", title: "Oups", description: "Veuillez choisir le type de bouteille." });
                return;
            }
            setStep(2);
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
            const payload: any = { ...formData, source: 'wizard_homepage_premium' };

            const { error } = await supabase.from('requests').insert({
                service_type: selectedService,
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
        setSelectedService(null);
        setFormData({ details: '', quantity: '1', bottleType: '', pickupAddress: '', deliveryAddress: '', contactName: '', contactPhone: '' });
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

            <div className="container mx-auto px-4 lg:px-8 relative z-10 flex-1 flex items-center py-12 lg:py-0">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">

                    {/* Left Column: Hero Content */}
                    <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-african-green/10 border border-african-green/20">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-african-green animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-african-yellow animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="w-2 h-2 rounded-full bg-african-red animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                            <span className="text-sm font-medium text-african-green">Services à domicile • Douala</span>
                        </div>

                        {/* Main Title */}
                        <div className="space-y-4">
                            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
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
                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Gaz, colis, lessive, nettoyage ou logement — <strong className="text-foreground">Le Bon Petit</strong> s'occupe de tout.
                                Un service camerounais moderne, fiable et à votre portée.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-african-green/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-african-green" />
                                </div>
                                <span className="text-sm font-medium">Service rapide</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-african-yellow/10 flex items-center justify-center">
                                    <Star className="h-5 w-5 text-african-yellow" />
                                </div>
                                <span className="text-sm font-medium">Prix transparents</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-african-red/10 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-african-red" />
                                </div>
                                <span className="text-sm font-medium">100% fiable</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-sm font-medium">Partout à Douala</span>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="hidden lg:flex items-center gap-8 pt-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="font-heading font-bold text-2xl text-foreground">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Service Selection Card */}
                    <div className="order-1 lg:order-2 w-full max-w-xl mx-auto lg:mx-0">
                        <div className="relative">
                            {/* Glow effect behind card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-african-green/20 via-primary/20 to-african-yellow/20 rounded-[2.5rem] blur-2xl transform scale-95" />

                            <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[2rem] p-6 md:p-8 overflow-hidden">
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
                                                <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                                                    {new Date().getHours() >= 18 ? "Bonsoir ! 👋" : "Bonjour ! 👋"}
                                                </h2>
                                                <p className="text-muted-foreground">
                                                    Quel service vous intéresse ?
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                {services.map((service) => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => handleServiceSelect(service.id)}
                                                        className="group flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                                                    >
                                                        <div className={`w-14 h-14 rounded-2xl ${service.bg} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                            <service.icon className="w-7 h-7 text-white" />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground text-center leading-tight">{service.label}</span>
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
                                                <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="rounded-full hover:bg-secondary -ml-2">
                                                    <ChevronLeft className="w-5 h-5 mr-1" /> Retour
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2].map((s) => (
                                                        <div key={s} className={`w-8 h-2 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-border'}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <h2 className="text-xl font-bold text-foreground mb-6">
                                                {step === 1 ? (selectedService === 'gaz' ? '🔥 Quelle bouteille ?' : '📝 Décrivez votre besoin') : '📍 Vos coordonnées'}
                                            </h2>

                                            <div className="space-y-4 flex-grow">
                                                {step === 1 && (
                                                    <>
                                                        {selectedService === 'gaz' && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {['sctm_12', 'total_12', 'afrigaz_12', 'camgaz_12'].map((b) => (
                                                                        <div
                                                                            key={b}
                                                                            onClick={() => setFormData({ ...formData, bottleType: b })}
                                                                            className={`cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${formData.bottleType === b ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}
                                                                        >
                                                                            <Flame className={`w-8 h-8 mx-auto mb-2 ${formData.bottleType === b ? 'text-primary' : 'text-muted-foreground'}`} />
                                                                            <span className="font-bold text-sm block uppercase">{b.replace('_', ' ')} kg</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Quantité</Label>
                                                                    <Input type="number" min="1" className="h-12" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                                                                </div>
                                                            </>
                                                        )}
                                                        {selectedService !== 'gaz' && (
                                                            <div className="space-y-2">
                                                                <Label>Détails de votre besoin</Label>
                                                                <Textarea
                                                                    className="min-h-[120px] resize-none"
                                                                    placeholder={selectedService === 'colis' ? "Poids, contenu, destination..." : "Décrivez ce qu'il faut faire..."}
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
                                                        <Input
                                                            className="h-12"
                                                            placeholder="Numéro WhatsApp (ex: 699...)"
                                                            type="tel"
                                                            value={formData.contactPhone}
                                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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
                    </div>
                </div>
            </div>

            {/* Mobile Stats Bar */}
            <div className="lg:hidden bg-card/80 backdrop-blur-sm border-t border-border py-4">
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
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 hidden lg:block">
                <svg viewBox="0 0 1440 60" className="w-full h-auto fill-secondary/30">
                    <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
                </svg>
            </div>
        </section>
    );
}
