import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Flame, Shirt, Trash2, Sparkles, ArrowRight, CheckCircle2, ChevronLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import heroPointing from "@/assets/hero-pointing.png";

type ServiceType = 'colis' | 'gaz' | 'lessive' | 'poubelles' | 'nettoyage' | 'logement' | null;

const services = [
    { id: 'gaz', label: 'Gaz', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100/50', border: 'border-orange-200' },
    { id: 'colis', label: 'Colis', icon: Package, color: 'text-blue-500', bg: 'bg-blue-100/50', border: 'border-blue-200' },
    { id: 'lessive', label: 'Pressing', icon: Shirt, color: 'text-violet-500', bg: 'bg-violet-100/50', border: 'border-violet-200' },
    { id: 'nettoyage', label: 'Ménage', icon: Sparkles, color: 'text-teal-500', bg: 'bg-teal-100/50', border: 'border-teal-200' },
    { id: 'poubelles', label: 'Poubelles', icon: Trash2, color: 'text-green-500', bg: 'bg-green-100/50', border: 'border-green-200' },
    { id: 'logement', label: 'Logement', icon: Building2, color: 'text-rose-500', bg: 'bg-rose-100/50', border: 'border-rose-200' },
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
        <section className="relative min-h-[600px] lg:h-[800px] w-full flex items-center overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-blue-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans">

            {/* African Pattern Overlay - Toghu */}
            <div className="absolute inset-0 toghu-pattern opacity-50" />

            {/* African Pattern Overlay - Diamond */}
            <div className="absolute inset-0 african-pattern opacity-30" />

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent hidden lg:block" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

            {/* Ndop-inspired stripe at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 ndop-border opacity-60" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10 h-full flex items-center">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">

                    {/* Left Column: The "Pointing Man" Image & Tagline */}
                    <div className="order-2 lg:order-1 hidden lg:flex flex-col items-center lg:items-end justify-center h-full relative">
                        <div className="relative w-full max-w-lg">
                            <img
                                src={heroPointing}
                                alt="Un service client à votre écoute"
                                className="w-full h-auto object-contain drop-shadow-2xl animate-fade-in"
                            />
                            {/* Floating badge */}
                            <div className="absolute bottom-20 -left-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">100% Fiable</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Service vérifié</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Premium Wizard Card */}
                    <div className="order-1 lg:order-2 w-full max-w-xl mx-auto lg:mx-0">
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/50 dark:border-gray-700 shadow-2xl rounded-[2rem] p-6 md:p-8 lg:p-10 relative overflow-hidden transition-all duration-300 hover:shadow-primary/10">

                            {/* Glass shine effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 dark:from-gray-700/40 to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                {step === 0 && (
                                    <div className="space-y-6 animate-slide-up">
                                        <div className="text-center lg:text-left space-y-2">
                                            <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white leading-tight">
                                                Bonjour ! <br />
                                                <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">
                                                    On gère tout pour vous.
                                                </span>
                                            </h1>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium">Choisissez un service, on s'occupe du reste.</p>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-8">
                                            {services.map((service) => (
                                                <button
                                                    key={service.id}
                                                    onClick={() => handleServiceSelect(service.id)}
                                                    className={`group flex flex-col items-center justify-center p-4 rounded-2xl border bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 ${service.border} dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}
                                                >
                                                    <div className={`w-14 h-14 rounded-full ${service.bg} dark:bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                        <service.icon className={`w-7 h-7 ${service.color}`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{service.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step > 0 && step < 3 && (
                                    <div className="animate-fade-in flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-6">
                                            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 -ml-2">
                                                <ChevronLeft className="w-5 h-5 mr-1" /> Retour
                                            </Button>
                                            <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                Étape {step} / 2
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            {step === 1 ? (selectedService === 'gaz' ? 'Quelle bouteille ?' : 'Dites-nous en plus') : 'Où vous livrer ?'}
                                        </h2>

                                        {/* Dynamic Form Content */}
                                        <div className="space-y-5 flex-grow">
                                            {step === 1 && (
                                                <>
                                                    {selectedService === 'gaz' && (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {['sctm_12', 'total_12'].map((b) => (
                                                                    <div key={b} onClick={() => setFormData({ ...formData, bottleType: b })}
                                                                        className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.bottleType === b ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}`}>
                                                                        <span className="font-bold text-sm block uppercase dark:text-white">{b.replace('_', ' ')}kg</span>
                                                                    </div>
                                                                ))}
                                                                {['afrigaz_12', 'camgaz_12'].map((b) => (
                                                                    <div key={b} onClick={() => setFormData({ ...formData, bottleType: b })}
                                                                        className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${formData.bottleType === b ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}`}>
                                                                        <span className="font-bold text-sm block uppercase dark:text-white">{b.replace('_', ' ')}kg</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="dark:text-gray-200">Quantité</Label>
                                                                <Input type="number" min="1" className="h-12 bg-gray-50/50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                                                            </div>
                                                        </>
                                                    )}
                                                    {selectedService !== 'gaz' && (
                                                        <div className="space-y-2">
                                                            <Label className="dark:text-gray-200">Détails de votre besoin</Label>
                                                            <Textarea
                                                                className="min-h-[120px] bg-gray-50/50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/20 resize-none"
                                                                placeholder={selectedService === 'colis' ? "Poids, contenu, fragilité..." : "Décrivez ce qu'il faut faire..."}
                                                                value={formData.details}
                                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {step === 2 && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <Input
                                                            className="h-12 bg-gray-50/50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                                            placeholder="Votre Nom complet"
                                                            value={formData.contactName}
                                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                        />
                                                        <Input
                                                            className="h-12 bg-gray-50/50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                                            placeholder="Numéro WhatsApp (ex: 699...)"
                                                            type="tel"
                                                            value={formData.contactPhone}
                                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                                        />
                                                        <Input
                                                            className="h-12 bg-gray-50/50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                                            placeholder="Quartier / Adresse"
                                                            value={formData.deliveryAddress}
                                                            onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Button onClick={handleNext} disabled={loading} className="w-full mt-8 h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl" variant="cta">
                                            {loading ? 'Envoi en cours...' : (step === 2 ? 'Valider ma commande' : 'Continuer')}
                                            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                                        </Button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="text-center py-10 animate-scale-in">
                                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 dark:shadow-green-900 shadow-xl">
                                            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Merci !</h3>
                                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                            Votre demande est bien reçue.<br />
                                            Notre équipe vous contacte sur WhatsApp dans moins de 5 minutes.
                                        </p>
                                        <Button variant="outline" onClick={resetWizard} className="rounded-full border-2">
                                            Nouvelle demande
                                        </Button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
