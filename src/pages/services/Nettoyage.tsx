import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Sparkles, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import nettoyageImage from '@/assets/services/nettoyage.png';

const servicesNettoyage = [
    { id: "bureaux", label: "Nettoyage de bureaux" },
    { id: "domiciles", label: "Nettoyage de domiciles" },
    { id: "canapes", label: "Nettoyage de canapés" },
    { id: "tapis", label: "Nettoyage de tapis" },
    { id: "chaises", label: "Nettoyage de chaises" },
    { id: "matelas", label: "Nettoyage de matelas" },
    { id: "vehicules", label: "Nettoyage de véhicules" },
];

const servicesAntiparasitaires = [
    { id: "deratisation", label: "Dératisation" },
    { id: "desinsectisation", label: "Désinsectisation" },
    { id: "fumigation", label: "Fumigation" },
    { id: "desinfection", label: "Désinfection" },
];

const creneauxHoraires = [
    "Matin (8h - 12h)",
    "Après-midi (12h - 17h)",
    "Soir (17h - 20h)",
];

const quartiersDouala = [
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
    "Yassa", "Logbessou", "Bonamikano", "Autres",
];

const steps = [
    { title: "Vos informations" },
    { title: "Adresse" },
    { title: "Services souhaités" },
    { title: "Planification" },
];

export default function Nettoyage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        quartier: '',
        rue: '',
        servicesNettoyage: [] as string[],
        servicesAntiparasitaires: [] as string[],
        details: '',
        dateIntervention: '',
        creneauHoraire: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleServiceToggle = (type: 'servicesNettoyage' | 'servicesAntiparasitaires', serviceId: string) => {
        setFormData(prev => {
            const currentServices = prev[type];
            const newServices = currentServices.includes(serviceId)
                ? currentServices.filter(s => s !== serviceId)
                : [...currentServices, serviceId];
            return { ...prev, [type]: newServices };
        });
    };

    const validateStep = () => {
        switch (currentStep) {
            case 0:
                if (!formData.prenom || !formData.nom || !formData.whatsapp) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                    return false;
                }
                break;
            case 1:
                if (!formData.quartier || !formData.rue) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir l'adresse complète." });
                    return false;
                }
                break;
            case 2:
                if (formData.servicesNettoyage.length === 0 && formData.servicesAntiparasitaires.length === 0) {
                    toast({ variant: "destructive", title: "Sélection requise", description: "Veuillez sélectionner au moins un service." });
                    return false;
                }
                break;
            case 3:
                if (!formData.creneauHoraire) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez sélectionner un créneau horaire." });
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'nettoyage',
                payload: formData,
                contact_name: `${formData.prenom} ${formData.nom}`,
                contact_phone: formData.whatsapp,
                status: 'new',
            });

            if (error) throw error;

            setSubmitted(true);
            toast({
                title: "Demande envoyée !",
                description: "Notre équipe vous contactera sous peu.",
            });
        } catch (error) {
            console.error('Error submitting request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer la demande. Réessayez.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                    <Card className="w-full max-w-md shadow-card border-border text-center">
                        <CardHeader>
                            <div className="mx-auto w-20 h-20 rounded-full bg-african-green/20 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10 text-african-green" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Demande reçue !</CardTitle>
                            <CardDescription>
                                Votre demande de service a été enregistrée. Intervention prévue : {formData.dateIntervention || 'À convenir'} - {formData.creneauHoraire}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-secondary/50 rounded-lg p-4 text-left">
                                <p className="text-sm font-medium mb-2">Services demandés :</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {formData.servicesNettoyage.map(s => {
                                        const service = servicesNettoyage.find(sn => sn.id === s);
                                        return <li key={s}>• {service?.label}</li>;
                                    })}
                                    {formData.servicesAntiparasitaires.map(s => {
                                        const service = servicesAntiparasitaires.find(sa => sa.id === s);
                                        return <li key={s}>• {service?.label}</li>;
                                    })}
                                </ul>
                            </div>
                            <Button variant="cta" onClick={() => {
                                setSubmitted(false);
                                setCurrentStep(0);
                                setFormData({
                                    nom: '', prenom: '', whatsapp: '', quartier: '', rue: '',
                                    servicesNettoyage: [], servicesAntiparasitaires: [],
                                    details: '', dateIntervention: '', creneauHoraire: ''
                                });
                            }} className="w-full">
                                Nouvelle demande
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input id="prenom" placeholder="Jean" value={formData.prenom} onChange={(e) => handleChange('prenom', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" placeholder="Dupont" value={formData.nom} onChange={(e) => handleChange('nom', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                            <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Quartier</Label>
                            <Select value={formData.quartier} onValueChange={(v) => handleChange('quartier', v)}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner votre quartier" /></SelectTrigger>
                                <SelectContent>
                                    {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rue">Rue / Repère</Label>
                            <Input id="rue" placeholder="Face pharmacie, à côté de..." value={formData.rue} onChange={(e) => handleChange('rue', e.target.value)} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Services de nettoyage</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {servicesNettoyage.map((service) => (
                                    <div key={service.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                                        <Checkbox
                                            id={service.id}
                                            checked={formData.servicesNettoyage.includes(service.id)}
                                            onCheckedChange={() => handleServiceToggle('servicesNettoyage', service.id)}
                                        />
                                        <Label htmlFor={service.id} className="cursor-pointer text-sm flex-1">{service.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Traitement antiparasitaire</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {servicesAntiparasitaires.map((service) => (
                                    <div key={service.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                                        <Checkbox
                                            id={service.id}
                                            checked={formData.servicesAntiparasitaires.includes(service.id)}
                                            onCheckedChange={() => handleServiceToggle('servicesAntiparasitaires', service.id)}
                                        />
                                        <Label htmlFor={service.id} className="cursor-pointer text-sm flex-1">{service.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateIntervention">Date souhaitée</Label>
                                <Input id="dateIntervention" type="date" value={formData.dateIntervention} onChange={(e) => handleChange('dateIntervention', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Créneau horaire</Label>
                                <Select value={formData.creneauHoraire} onValueChange={(v) => handleChange('creneauHoraire', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {creneauxHoraires.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="details">Détails supplémentaires (optionnel)</Label>
                            <Textarea
                                id="details"
                                placeholder="Décrivez votre besoin (surface, type de nuisibles, urgence...)"
                                value={formData.details}
                                onChange={(e) => handleChange('details', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="py-8 lg:py-12 px-4 african-pattern">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        <Card className="shadow-card border-border">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-3 shadow-soft">
                                    <Sparkles className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
                                </div>
                                <CardTitle className="font-heading text-xl lg:text-2xl">Nettoyage & Antiparasitaire</CardTitle>
                                <CardDescription className="text-sm">
                                    Services professionnels à domicile
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <StepProgress steps={steps} currentStep={currentStep} />
                                <div className="min-h-[280px]">
                                    {renderStep()}
                                </div>
                                <div className="flex gap-3">
                                    {currentStep > 0 && (
                                        <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Précédent
                                        </Button>
                                    )}
                                    {currentStep < steps.length - 1 ? (
                                        <Button type="button" variant="cta" onClick={nextStep} className="flex-1">
                                            Suivant
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="cta" onClick={handleSubmit} disabled={loading} className="flex-1">
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Envoi...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Send className="h-4 w-4" />
                                                    Demander un devis
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Service illustration - visible on lg screens */}
                        <div className="hidden lg:flex items-center justify-center sticky top-24">
                            <img
                                src={nettoyageImage}
                                alt="Service de nettoyage"
                                className="w-full max-w-md rounded-2xl shadow-soft object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
