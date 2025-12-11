import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Package, Download, CheckCircle2, ArrowLeft, ArrowRight, Send, Globe, MapPin } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import colisImage from '@/assets/services/colis.png?format=webp&quality=80';

const naturesColis = [
    "Documents",
    "Vêtements",
    "Électronique",
    "Alimentation",
    "Cosmétiques",
    "Médicaments",
    "Autres",
];

const valeursColis = [
    "Moins de 10 000 FCFA",
    "10 000 - 50 000 FCFA",
    "50 000 - 100 000 FCFA",
    "100 000 - 500 000 FCFA",
    "Plus de 500 000 FCFA",
];

const villesCameroun = [
    "Douala",
    "Yaoundé",
    "Bafoussam",
    "Bamenda",
    "Garoua",
    "Maroua",
    "Ngaoundéré",
    "Bertoua",
    "Kribi",
    "Limbé",
];

const paysDestination = [
    "France",
    "Belgique",
    "Allemagne",
    "Suisse",
    "Canada",
    "États-Unis",
    "Royaume-Uni",
    "Espagne",
    "Italie",
    "Côte d'Ivoire",
    "Sénégal",
    "Gabon",
    "Tchad",
    "Nigeria",
    "Autre",
];

const getSteps = (destinationType: string) => {
    if (destinationType === 'national') {
        return [
            { title: "Type d'envoi" },
            { title: "Vos informations" },
            { title: "Départ & Destination" },
            { title: "Détails du colis" },
        ];
    } else if (destinationType === 'international') {
        return [
            { title: "Type d'envoi" },
            { title: "Expéditeur" },
            { title: "Destinataire" },
            { title: "Détails du colis" },
        ];
    }
    return [{ title: "Type d'envoi" }];
};

export default function Colis() {
    const [currentStep, setCurrentStep] = useState(0);
    const [destinationType, setDestinationType] = useState('');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const steps = getSteps(destinationType);

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleDestinationTypeChange = (type: string) => {
        setDestinationType(type);
        setFormData({});
        setCurrentStep(1);
    };

    const validateStep = () => {
        if (currentStep === 0) {
            if (!destinationType) {
                toast({ variant: "destructive", title: "Sélection requise", description: "Veuillez choisir le type d'envoi." });
                return false;
            }
            return true;
        }

        if (destinationType === 'national') {
            if (currentStep === 1) {
                if (!formData.prenom || !formData.nom || !formData.whatsapp) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.villeDepart || !formData.quartierDepart || !formData.villeDestination || !formData.quartierDestination) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les adresses de départ et destination." });
                    return false;
                }
            } else if (currentStep === 3) {
                if (!formData.natureColis || !formData.poids || !formData.urgence) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les détails du colis." });
                    return false;
                }
            }
        } else {
            if (currentStep === 1) {
                if (!formData.prenom || !formData.nom || !formData.whatsapp || !formData.villeDepart || !formData.quartierDepart) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                    return false;
                }
            } else if (currentStep === 2) {
                if (!formData.nomDestinataire || !formData.paysDestination || !formData.villeDestinationInt) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les informations du destinataire." });
                    return false;
                }
            } else if (currentStep === 3) {
                if (!formData.natureColis || !formData.poids || !formData.valeurColis) {
                    toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les détails du colis." });
                    return false;
                }
            }
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
            if (currentStep === 1) {
                setDestinationType('');
                setFormData({});
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'colis',
                payload: { destinationType, ...formData },
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
                                Merci pour votre demande d'expédition {destinationType === 'international' ? 'internationale' : 'nationale'}. Notre équipe vous contactera via WhatsApp.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/catalogues/prix-colis.pdf" download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger le catalogue des prix
                                </a>
                            </Button>
                            <Button variant="cta" onClick={() => { setSubmitted(false); setCurrentStep(0); setDestinationType(''); setFormData({}); }} className="w-full">
                                Nouvelle demande
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const renderStep = () => {
        // Step 0: Destination type selection
        if (currentStep === 0) {
            return (
                <div className="space-y-4">
                    <Label className="text-base font-medium">Où souhaitez-vous envoyer votre colis ?</Label>
                    <div className="grid grid-cols-1 gap-4">
                        <Button
                            type="button"
                            variant={destinationType === 'national' ? "default" : "outline"}
                            className="h-auto py-6 flex flex-col items-center gap-2"
                            onClick={() => handleDestinationTypeChange('national')}
                        >
                            <MapPin className="h-8 w-8" />
                            <span className="font-semibold">Au Cameroun</span>
                            <span className="text-xs text-muted-foreground">Envoi national</span>
                        </Button>
                        <Button
                            type="button"
                            variant={destinationType === 'international' ? "default" : "outline"}
                            className="h-auto py-6 flex flex-col items-center gap-2"
                            onClick={() => handleDestinationTypeChange('international')}
                        >
                            <Globe className="h-8 w-8" />
                            <span className="font-semibold">À l'international</span>
                            <span className="text-xs text-muted-foreground">Vers l'étranger</span>
                        </Button>
                    </div>
                </div>
            );
        }

        // NATIONAL FLOW
        if (destinationType === 'national') {
            if (currentStep === 1) {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input id="prenom" placeholder="Jean" value={formData.prenom || ''} onChange={(e) => handleChange('prenom', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" placeholder="Dupont" value={formData.nom || ''} onChange={(e) => handleChange('nom', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                            <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                        </div>
                    </div>
                );
            } else if (currentStep === 2) {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville de départ</Label>
                                <Select value={formData.villeDepart || ''} onValueChange={(v) => handleChange('villeDepart', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {villesCameroun.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quartierDepart">Quartier départ</Label>
                                <Input id="quartierDepart" placeholder="Akwa..." value={formData.quartierDepart || ''} onChange={(e) => handleChange('quartierDepart', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville destination</Label>
                                <Select value={formData.villeDestination || ''} onValueChange={(v) => handleChange('villeDestination', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {villesCameroun.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quartierDestination">Quartier destination</Label>
                                <Input id="quartierDestination" placeholder="Bastos..." value={formData.quartierDestination || ''} onChange={(e) => handleChange('quartierDestination', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            } else if (currentStep === 3) {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nature du colis</Label>
                                <Select value={formData.natureColis || ''} onValueChange={(v) => handleChange('natureColis', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {naturesColis.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="poids">Poids estimé (kg)</Label>
                                <Input id="poids" type="number" placeholder="2.5" value={formData.poids || ''} onChange={(e) => handleChange('poids', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Urgence</Label>
                            <RadioGroup value={formData.urgence || ''} onValueChange={(v) => handleChange('urgence', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="normal" id="normal" />
                                    <Label htmlFor="normal" className="cursor-pointer">Normal (2-3 jours)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="express" id="express" />
                                    <Label htmlFor="express" className="cursor-pointer">Express (24h)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateRamassage">Date de ramassage souhaitée</Label>
                            <Input id="dateRamassage" type="date" value={formData.dateRamassage || ''} onChange={(e) => handleChange('dateRamassage', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optionnel)</Label>
                            <Textarea id="description" placeholder="Précisions sur le contenu..." value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
                        </div>
                    </div>
                );
            }
        }

        // INTERNATIONAL FLOW
        if (destinationType === 'international') {
            if (currentStep === 1) {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Votre prénom</Label>
                                <Input id="prenom" placeholder="Jean" value={formData.prenom || ''} onChange={(e) => handleChange('prenom', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nom">Votre nom</Label>
                                <Input id="nom" placeholder="Dupont" value={formData.nom || ''} onChange={(e) => handleChange('nom', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">Votre WhatsApp</Label>
                            <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville de départ</Label>
                                <Select value={formData.villeDepart || ''} onValueChange={(v) => handleChange('villeDepart', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {villesCameroun.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quartierDepart">Quartier</Label>
                                <Input id="quartierDepart" placeholder="Akwa..." value={formData.quartierDepart || ''} onChange={(e) => handleChange('quartierDepart', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );
            } else if (currentStep === 2) {
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomDestinataire">Nom complet du destinataire</Label>
                            <Input id="nomDestinataire" placeholder="Marie Martin" value={formData.nomDestinataire || ''} onChange={(e) => handleChange('nomDestinataire', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pays de destination</Label>
                                <Select value={formData.paysDestination || ''} onValueChange={(v) => handleChange('paysDestination', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {paysDestination.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="villeDestinationInt">Ville de destination</Label>
                                <Input id="villeDestinationInt" placeholder="Paris..." value={formData.villeDestinationInt || ''} onChange={(e) => handleChange('villeDestinationInt', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adresseComplete">Adresse complète (optionnel)</Label>
                            <Input id="adresseComplete" placeholder="123 Rue Example, 75001" value={formData.adresseComplete || ''} onChange={(e) => handleChange('adresseComplete', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telDestinataire">Téléphone du destinataire (optionnel)</Label>
                            <Input id="telDestinataire" placeholder="+33 6 XX XX XX XX" value={formData.telDestinataire || ''} onChange={(e) => handleChange('telDestinataire', e.target.value)} />
                        </div>
                    </div>
                );
            } else if (currentStep === 3) {
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nature du colis</Label>
                                <Select value={formData.natureColis || ''} onValueChange={(v) => handleChange('natureColis', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {naturesColis.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="poids">Poids estimé (kg)</Label>
                                <Input id="poids" type="number" placeholder="2.5" value={formData.poids || ''} onChange={(e) => handleChange('poids', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Valeur estimée</Label>
                            <Select value={formData.valeurColis || ''} onValueChange={(v) => handleChange('valeurColis', v)}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    {valeursColis.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateRamassage">Date de ramassage souhaitée</Label>
                            <Input id="dateRamassage" type="date" value={formData.dateRamassage || ''} onChange={(e) => handleChange('dateRamassage', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description du contenu</Label>
                            <Textarea id="description" placeholder="Détaillez le contenu pour les douanes..." value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <Layout>
            <div className="py-8 lg:py-12 px-4 african-pattern">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        <Card className="shadow-card border-border">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-3 shadow-soft">
                                    <Package className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
                                </div>
                                <CardTitle className="font-heading text-xl lg:text-2xl">Expédition de Colis</CardTitle>
                                <CardDescription className="text-sm">
                                    {destinationType === 'international' ? 'Envoi vers l\'étranger' : destinationType === 'national' ? 'Envoi au Cameroun' : 'National ou international'}
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
                                    {currentStep === 0 ? (
                                        <div className="flex-1" />
                                    ) : isLastStep ? (
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
                                    ) : (
                                        <Button type="button" variant="cta" onClick={nextStep} className="flex-1">
                                            Suivant
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="hidden lg:flex items-center justify-center sticky top-24">
                            <img src={colisImage} alt="Service d'expédition de colis" loading="lazy" className="w-full max-w-md rounded-2xl shadow-soft object-contain" />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
