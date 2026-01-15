import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shirt, Download, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import lessiveImage from '@/assets/services/lessive.png?format=webp&quality=80';

const typesVetements = [
    { id: 'chemises', label: 'Chemises' },
    { id: 'pantalons', label: 'Pantalons' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'robes', label: 'Robes / Jupes' },
    { id: 'draps', label: 'Draps / Couvertures' },
    { id: 'rideaux', label: 'Rideaux' },
    { id: 'autres', label: 'Autres' },
];

const taillesSac = [
    "Petit (5-10 pièces)",
    "Moyen (10-20 pièces)",
    "Grand (20-40 pièces)",
    "Très grand (40+ pièces)",
];

const passagesParMois = [
    "1 passage",
    "2 passages",
    "4 passages (hebdomadaire)",
    "8 passages (2 fois/semaine)",
];

const quartiersDouala = [
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
    "Yassa", "Logbessou", "Bonamikano", "Autres",
];

const steps = [
    { title: "Vos informations" },
    { title: "Adresse de ramassage" },
    { title: "Vos besoins" },
];

export default function Lessive() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        quartier: '',
        rue: '',
        typesVetements: [] as string[],
        tailleSac: '',
        passagesParMois: '',
        repassage: 'non',
        dateRamassage: '',
        instructions: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleVetementChange = (vetementId: string, checked: boolean) => {
        if (checked) {
            setFormData({ ...formData, typesVetements: [...formData.typesVetements, vetementId] });
        } else {
            setFormData({ ...formData, typesVetements: formData.typesVetements.filter(v => v !== vetementId) });
        }
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
                if (formData.typesVetements.length === 0 || !formData.tailleSac || !formData.passagesParMois) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez indiquer vos besoins." });
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
                service_type: 'lessive',
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
                            <div className="mx-auto w-20 h-20 rounded-full bg-african-yellow/20 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10 text-african-gold" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Demande reçue !</CardTitle>
                            <CardDescription>
                                Votre demande de ramassage lessive a été enregistrée. {formData.repassage === 'oui' ? 'Repassage inclus.' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/catalogues/prix-lessive.pdf" download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger la grille tarifaire
                                </a>
                            </Button>
                            <Button variant="cta" onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ nom: '', prenom: '', whatsapp: '', quartier: '', rue: '', typesVetements: [], tailleSac: '', passagesParMois: '', repassage: 'non', dateRamassage: '', instructions: '' }); }} className="w-full">
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
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Types de vêtements</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {typesVetements.map((type) => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={type.id}
                                            checked={formData.typesVetements.includes(type.id)}
                                            onCheckedChange={(checked) => handleVetementChange(type.id, checked as boolean)}
                                        />
                                        <Label htmlFor={type.id} className="cursor-pointer text-sm">{type.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantité estimée</Label>
                                <Select value={formData.tailleSac} onValueChange={(v) => handleChange('tailleSac', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {taillesSac.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fréquence</Label>
                                <Select value={formData.passagesParMois} onValueChange={(v) => handleChange('passagesParMois', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Repassage souhaité ?</Label>
                            <RadioGroup value={formData.repassage} onValueChange={(v) => handleChange('repassage', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="oui" id="repassage-oui" />
                                    <Label htmlFor="repassage-oui" className="cursor-pointer">Oui</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="non" id="repassage-non" />
                                    <Label htmlFor="repassage-non" className="cursor-pointer">Non</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateRamassage">Date du 1er ramassage</Label>
                            <Input id="dateRamassage" type="date" value={formData.dateRamassage} onChange={(e) => handleChange('dateRamassage', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instructions">Instructions spéciales (optionnel)</Label>
                            <Textarea id="instructions" placeholder="Vêtements fragiles, couleurs séparées..." value={formData.instructions} onChange={(e) => handleChange('instructions', e.target.value)} />
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
                                <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-african-yellow to-african-gold flex items-center justify-center mb-3 shadow-soft">
                                    <Shirt className="h-7 w-7 lg:h-8 lg:w-8 text-foreground" />
                                </div>
                                <CardTitle className="font-heading text-xl lg:text-2xl">Ramassage Lessive</CardTitle>
                                <CardDescription className="text-sm">
                                    On récupère, on lave, on livre !
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <StepProgress steps={steps} currentStep={currentStep} />
                                <div className="min-h-[320px]">
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
                                                    Envoyer
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
                                src={lessiveImage}
                                alt="Service de ramassage lessive"
                                className="w-full max-w-md rounded-2xl shadow-soft object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
