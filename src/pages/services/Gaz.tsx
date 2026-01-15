import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Flame, Download, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import gazImage from '@/assets/services/gaz.png?format=webp&quality=80';

const marquesBouteilles = [
    "SCTM (Bouteille bleue)",
    "CAMGAZ (Bouteille verte)",
    "TRADEX GAZ",
    "TOTAL GAZ",
    "Autres",
];

const taillesBouteille = [
    "6 kg (Petite)",
    "12.5 kg (Grande)",
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
    { title: "Adresse de livraison" },
    { title: "Votre commande" },
];

export default function Gaz() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        quartier: '',
        rue: '',
        marqueBouteille: '',
        tailleBouteille: '',
        quantite: '1',
        possedeBouteille: 'oui',
        dateLivraison: '',
        creneauHoraire: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
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
                if (!formData.tailleBouteille || !formData.creneauHoraire) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez compléter votre commande." });
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
                service_type: 'gaz',
                payload: formData,
                contact_name: `${formData.prenom} ${formData.nom}`,
                contact_phone: formData.whatsapp,
                status: 'new',
            });

            if (error) throw error;

            setSubmitted(true);
            toast({
                title: "Commande envoyée !",
                description: "Notre équipe vous contactera sous peu.",
            });
        } catch (error) {
            console.error('Error submitting request:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'envoyer la commande. Réessayez.",
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
                            <div className="mx-auto w-20 h-20 rounded-full bg-african-red/20 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10 text-african-red" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Commande reçue !</CardTitle>
                            <CardDescription>
                                Votre commande de gaz a été enregistrée. Livraison prévue : {formData.dateLivraison || 'Dès que possible'} - {formData.creneauHoraire}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/catalogues/prix-gaz.pdf" download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger le catalogue des prix
                                </a>
                            </Button>
                            <Button variant="cta" onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({ nom: '', prenom: '', whatsapp: '', quartier: '', rue: '', marqueBouteille: '', tailleBouteille: '', quantite: '1', possedeBouteille: 'oui', dateLivraison: '', creneauHoraire: '' }); }} className="w-full">
                                Nouvelle commande
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Taille de bouteille</Label>
                                <Select value={formData.tailleBouteille} onValueChange={(v) => handleChange('tailleBouteille', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {taillesBouteille.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantité</Label>
                                <Select value={formData.quantite} onValueChange={(v) => handleChange('quantite', v)}>
                                    <SelectTrigger><SelectValue placeholder="1" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 bouteille</SelectItem>
                                        <SelectItem value="2">2 bouteilles</SelectItem>
                                        <SelectItem value="3">3 bouteilles</SelectItem>
                                        <SelectItem value="4+">4+ bouteilles</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Marque préférée (optionnel)</Label>
                            <Select value={formData.marqueBouteille} onValueChange={(v) => handleChange('marqueBouteille', v)}>
                                <SelectTrigger><SelectValue placeholder="Peu importe" /></SelectTrigger>
                                <SelectContent>
                                    {marquesBouteilles.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Avez-vous une bouteille à échanger ?</Label>
                            <RadioGroup value={formData.possedeBouteille} onValueChange={(v) => handleChange('possedeBouteille', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="oui" id="oui" />
                                    <Label htmlFor="oui" className="cursor-pointer">Oui</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="non" id="non" />
                                    <Label htmlFor="non" className="cursor-pointer">Non (achat neuf)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateLivraison">Date souhaitée</Label>
                                <Input id="dateLivraison" type="date" value={formData.dateLivraison} onChange={(e) => handleChange('dateLivraison', e.target.value)} />
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
                                <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-african-red to-african-red/80 flex items-center justify-center mb-3 shadow-soft">
                                    <Flame className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
                                </div>
                                <CardTitle className="font-heading text-xl lg:text-2xl">Livraison de Gaz</CardTitle>
                                <CardDescription className="text-sm">
                                    Bouteilles livrées à domicile
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
                                                    Commander
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
                                src={gazImage}
                                alt="Service de livraison de gaz"
                                className="w-full max-w-md rounded-2xl shadow-soft object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
