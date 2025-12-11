import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Trash2, Download, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { StepProgress } from '@/components/StepProgress';
import poubellesImage from '@/assets/services/poubelles.png?format=webp&quality=80';

const categories = [
    { id: 'habitation', label: 'Habitation' },
    { id: 'entreprise', label: 'Entreprise' },
    { id: 'hotel', label: 'Hôtel' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'autre', label: 'Autre' },
];

const typesHabitation = [
    "Studio",
    "Appartement T2",
    "Appartement T3",
    "Appartement T4+",
    "Maison individuelle",
    "Villa",
];

const taillesPoubelle = [
    "Petite (30L)",
    "Moyenne (60L)",
    "Grande (120L)",
    "Très grande (240L)",
];

const passagesParMois = [
    "1 passage",
    "2 passages",
    "4 passages (hebdomadaire)",
    "8 passages (2 fois/semaine)",
    "Sur demande",
];

const postes = [
    "Directeur",
    "Gérant",
    "Responsable",
    "Secrétaire",
    "Autre",
];

const quartiersDouala = [
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
    "Yassa", "Logbessou", "Bonamikano", "Autres",
];

const getSteps = (categorie: string) => {
    switch (categorie) {
        case 'habitation':
            return [
                { title: "Votre catégorie" },
                { title: "Vos informations" },
                { title: "Votre demande" },
            ];
        case 'entreprise':
        case 'hotel':
        case 'restaurant':
            return [
                { title: "Votre catégorie" },
                { title: "Établissement" },
                { title: "Contact & Besoins" },
            ];
        case 'autre':
            return [
                { title: "Votre catégorie" },
                { title: "Votre demande" },
            ];
        default:
            return [{ title: "Votre catégorie" }];
    }
};

export default function Poubelles() {
    const [currentStep, setCurrentStep] = useState(0);
    const [categorie, setCategorie] = useState('');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const steps = getSteps(categorie);

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleCategorieChange = (value: string) => {
        setCategorie(value);
        setFormData({});
        setCurrentStep(1);
    };

    const validateStep = () => {
        if (currentStep === 0) {
            if (!categorie) {
                toast({ variant: "destructive", title: "Sélection requise", description: "Veuillez sélectionner votre catégorie." });
                return false;
            }
            return true;
        }

        switch (categorie) {
            case 'habitation':
                if (currentStep === 1) {
                    if (!formData.prenom || !formData.nom || !formData.typeHabitation) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                        return false;
                    }
                } else if (currentStep === 2) {
                    if (!formData.quartier || !formData.rue || !formData.taillePoubelle || !formData.passagesParMois || !formData.whatsapp) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                        return false;
                    }
                }
                break;
            case 'entreprise':
                if (currentStep === 1) {
                    if (!formData.nomEntreprise || !formData.quartier || !formData.rue) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les informations de l'entreprise." });
                        return false;
                    }
                } else if (currentStep === 2) {
                    if (!formData.nomContact || !formData.poste || !formData.whatsapp || !formData.nombreEmployes || !formData.passagesParMois) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                        return false;
                    }
                }
                break;
            case 'hotel':
                if (currentStep === 1) {
                    if (!formData.nomHotel || !formData.nombreChambres || !formData.quartier || !formData.rue) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les informations de l'hôtel." });
                        return false;
                    }
                } else if (currentStep === 2) {
                    if (!formData.nomContact || !formData.poste || !formData.whatsapp) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les informations de contact." });
                        return false;
                    }
                }
                break;
            case 'restaurant':
                if (currentStep === 1) {
                    if (!formData.nomRestaurant || !formData.nombreTables || !formData.quartier || !formData.rue) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir les informations du restaurant." });
                        return false;
                    }
                } else if (currentStep === 2) {
                    if (!formData.nomContact || !formData.poste || !formData.whatsapp || !formData.frequenceVidage) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
                        return false;
                    }
                }
                break;
            case 'autre':
                if (currentStep === 1) {
                    if (!formData.description || !formData.whatsapp) {
                        toast({ variant: "destructive", title: "Champs requis", description: "Veuillez décrire votre besoin et ajouter votre WhatsApp." });
                        return false;
                    }
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
            if (currentStep === 1) {
                setCategorie('');
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
                service_type: 'poubelles',
                payload: { categorie, ...formData },
                contact_name: formData.nom || formData.nomEntreprise || formData.nomHotel || formData.nomRestaurant || formData.nomContact || 'Client',
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
                                Merci pour votre demande. Notre équipe vous contactera via WhatsApp dans les plus brefs délais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/catalogues/services-poubelles.pdf" download>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger le catalogue
                                </a>
                            </Button>
                            <Button variant="cta" onClick={() => { setSubmitted(false); setCurrentStep(0); setCategorie(''); setFormData({}); }} className="w-full">
                                Nouvelle demande
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const renderStep = () => {
        // Step 0: Category selection
        if (currentStep === 0) {
            return (
                <div className="space-y-4">
                    <Label>Vous êtes</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                type="button"
                                variant={categorie === cat.id ? "default" : "outline"}
                                className="h-auto py-4"
                                onClick={() => handleCategorieChange(cat.id)}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }

        // Category-specific steps
        switch (categorie) {
            case 'habitation':
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
                                <Label>Type d'habitation</Label>
                                <Select value={formData.typeHabitation || ''} onValueChange={(v) => handleChange('typeHabitation', v)}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                    <SelectContent>
                                        {typesHabitation.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select value={formData.quartier || ''} onValueChange={(v) => handleChange('quartier', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rue">Rue</Label>
                                    <Input id="rue" placeholder="Face pharmacie..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Taille poubelle</Label>
                                    <Select value={formData.taillePoubelle || ''} onValueChange={(v) => handleChange('taillePoubelle', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {taillesPoubelle.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Passages / mois</Label>
                                    <Select value={formData.passagesParMois || ''} onValueChange={(v) => handleChange('passagesParMois', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombrePersonnes">Nombre de personnes au foyer</Label>
                                    <Input id="nombrePersonnes" type="number" placeholder="4" value={formData.nombrePersonnes || ''} onChange={(e) => handleChange('nombrePersonnes', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateDebut">Date de début souhaitée</Label>
                                    <Input id="dateDebut" type="date" value={formData.dateDebut || ''} onChange={(e) => handleChange('dateDebut', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                            </div>
                        </div>
                    );
                }

            case 'entreprise':
                if (currentStep === 1) {
                    return (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomEntreprise">Nom de l'entreprise</Label>
                                <Input id="nomEntreprise" placeholder="Ma Société SARL" value={formData.nomEntreprise || ''} onChange={(e) => handleChange('nomEntreprise', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select value={formData.quartier || ''} onValueChange={(v) => handleChange('quartier', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rue">Rue</Label>
                                    <Input id="rue" placeholder="Rue de l'usine..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomContact">Personne à contacter</Label>
                                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Poste</Label>
                                    <Select value={formData.poste || ''} onValueChange={(v) => handleChange('poste', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombreEmployes">Nombre d'employés</Label>
                                    <Input id="nombreEmployes" type="number" placeholder="25" value={formData.nombreEmployes || ''} onChange={(e) => handleChange('nombreEmployes', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Passages / mois</Label>
                                    <Select value={formData.passagesParMois || ''} onValueChange={(v) => handleChange('passagesParMois', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email professionnel (optionnel)</Label>
                                    <Input id="email" type="email" placeholder="contact@entreprise.cm" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateDebut">Date début souhaitée</Label>
                                    <Input id="dateDebut" type="date" value={formData.dateDebut || ''} onChange={(e) => handleChange('dateDebut', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    );
                }

            case 'hotel':
                if (currentStep === 1) {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomHotel">Nom de l'hôtel</Label>
                                    <Input id="nomHotel" placeholder="Hôtel Le Palace" value={formData.nomHotel || ''} onChange={(e) => handleChange('nomHotel', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombreChambres">Nombre de chambres</Label>
                                    <Input id="nombreChambres" type="number" placeholder="50" value={formData.nombreChambres || ''} onChange={(e) => handleChange('nombreChambres', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select value={formData.quartier || ''} onValueChange={(v) => handleChange('quartier', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rue">Rue</Label>
                                    <Input id="rue" placeholder="Boulevard..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomContact">Personne à contacter</Label>
                                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Poste</Label>
                                    <Select value={formData.poste || ''} onValueChange={(v) => handleChange('poste', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="autresInfos">Autres informations (optionnel)</Label>
                                <Textarea id="autresInfos" placeholder="Détails supplémentaires..." value={formData.autresInfos || ''} onChange={(e) => handleChange('autresInfos', e.target.value)} />
                            </div>
                        </div>
                    );
                }

            case 'restaurant':
                if (currentStep === 1) {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomRestaurant">Nom du restaurant</Label>
                                    <Input id="nomRestaurant" placeholder="Chez Mama" value={formData.nomRestaurant || ''} onChange={(e) => handleChange('nomRestaurant', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombreTables">Nombre de tables</Label>
                                    <Input id="nombreTables" type="number" placeholder="20" value={formData.nombreTables || ''} onChange={(e) => handleChange('nombreTables', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select value={formData.quartier || ''} onValueChange={(v) => handleChange('quartier', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rue">Rue</Label>
                                    <Input id="rue" placeholder="Carrefour..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomContact">Personne à contacter</Label>
                                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Poste</Label>
                                    <Select value={formData.poste || ''} onValueChange={(v) => handleChange('poste', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fréquence de vidage</Label>
                                    <Select value={formData.frequenceVidage || ''} onValueChange={(v) => handleChange('frequenceVidage', v)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                        <SelectContent>
                                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombrePoubelles">Nombre de poubelles</Label>
                                    <Input id="nombrePoubelles" type="number" placeholder="4" value={formData.nombrePoubelles || ''} onChange={(e) => handleChange('nombrePoubelles', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    );
                }

            case 'autre':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description de votre besoin</Label>
                            <Textarea id="description" placeholder="Décrivez votre situation et vos besoins en ramassage de poubelles..." value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className="min-h-[120px]" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                            <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                        </div>
                    </div>
                );

            default:
                return null;
        }
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
                                    <Trash2 className="h-7 w-7 lg:h-8 lg:w-8 text-primary-foreground" />
                                </div>
                                <CardTitle className="font-heading text-xl lg:text-2xl">Ramassage de Poubelles</CardTitle>
                                <CardDescription className="text-sm">
                                    Service pour particuliers et professionnels
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Progress indicator */}
                                <StepProgress steps={steps} currentStep={currentStep} />

                                {/* Step content */}
                                <div className="min-h-[220px]">
                                    {renderStep()}
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex gap-3">
                                    {currentStep > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Précédent
                                        </Button>
                                    )}
                                    {!isLastStep && currentStep === 0 ? (
                                        <div className="flex-1" /> // Spacer when no category selected
                                    ) : isLastStep ? (
                                        <Button
                                            type="button"
                                            variant="cta"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1"
                                        >
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
                                        <Button
                                            type="button"
                                            variant="cta"
                                            onClick={nextStep}
                                            className="flex-1"
                                        >
                                            Suivant
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Service illustration - visible on lg screens */}
                        <div className="hidden lg:flex items-center justify-center sticky top-24">
                            <img
                                src={poubellesImage}
                                alt="Service de ramassage poubelles"
                                className="w-full max-w-md rounded-2xl shadow-soft object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
