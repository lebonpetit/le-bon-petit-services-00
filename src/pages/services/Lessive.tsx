import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Shirt, Download, Send, CheckCircle2 } from 'lucide-react';

const typesVetements = [
    { id: 'chemises', label: 'Chemises' },
    { id: 'pantalons', label: 'Pantalons' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'polos', label: 'Polos' },
    { id: 'jupes', label: 'Jupes' },
    { id: 'robes', label: 'Robes' },
    { id: 'tapis', label: 'Tapis' },
    { id: 'couvertures', label: 'Couvertures' },
    { id: 'draps', label: 'Draps' },
    { id: 'coussins', label: 'Coussins' },
    { id: 'rideaux', label: 'Rideaux' },
    { id: 'autres', label: 'Autres' },
];

const frequencesParSemaine = [
    "1 fois",
    "2 fois",
    "3 fois",
    "Tous les jours",
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

export default function Lessive() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        quartier: '',
        rue: '',
        typesVetements: [] as string[],
        frequenceParSemaine: '',
        passagesParMois: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.typesVetements.length === 0) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Veuillez sélectionner au moins un type de vêtement",
            });
            return;
        }

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
                            <div className="mx-auto w-20 h-20 rounded-full bg-african-green/20 flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10 text-african-green" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Demande reçue !</CardTitle>
                            <CardDescription>
                                Merci pour votre demande de service lessive. Notre équipe vous contactera via WhatsApp dans les plus brefs délais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="cta" onClick={() => setSubmitted(false)} className="w-full">
                                Nouvelle demande
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="py-12 px-4 african-pattern">
                <div className="container mx-auto max-w-2xl">
                    <Card className="shadow-card border-border">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-yellow to-african-gold flex items-center justify-center mb-4 shadow-soft">
                                <Shirt className="h-8 w-8 text-foreground" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Ramassage Lessive</CardTitle>
                            <CardDescription>
                                On récupère, on lave, on livre. Vêtements propres sans effort !
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/catalogues/prix-lessive.pdf" download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger la grille des prix
                                    </a>
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="prenom">Prénom</Label>
                                        <Input
                                            id="prenom"
                                            placeholder="Jean"
                                            value={formData.prenom}
                                            onChange={(e) => handleChange('prenom', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom</Label>
                                        <Input
                                            id="nom"
                                            placeholder="Dupont"
                                            value={formData.nom}
                                            onChange={(e) => handleChange('nom', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                                    <Input
                                        id="whatsapp"
                                        placeholder="+237 6XX XXX XXX"
                                        value={formData.whatsapp}
                                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-secondary space-y-4">
                                    <h3 className="font-medium text-foreground">Adresse de ramassage</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quartier</Label>
                                            <Select onValueChange={(v) => handleChange('quartier', v)} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {quartiersDouala.map((quartier) => (
                                                        <SelectItem key={quartier} value={quartier}>{quartier}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rue">Rue / Repère</Label>
                                            <Input
                                                id="rue"
                                                placeholder="Face pharmacie..."
                                                value={formData.rue}
                                                onChange={(e) => handleChange('rue', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Types de vêtements / articles</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-secondary">
                                        {typesVetements.map((vetement) => (
                                            <div key={vetement.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={vetement.id}
                                                    checked={formData.typesVetements.includes(vetement.id)}
                                                    onCheckedChange={(checked) => handleVetementChange(vetement.id, checked as boolean)}
                                                />
                                                <Label htmlFor={vetement.id} className="text-sm cursor-pointer">
                                                    {vetement.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fréquence de lessive par semaine</Label>
                                        <Select onValueChange={(v) => handleChange('frequenceParSemaine', v)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {frequencesParSemaine.map((freq) => (
                                                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Passages souhaités par mois</Label>
                                        <Select onValueChange={(v) => handleChange('passagesParMois', v)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {passagesParMois.map((passage) => (
                                                    <SelectItem key={passage} value={passage}>{passage}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" variant="cta" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Envoi en cours...
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
                </div>
            </div>
        </Layout>
    );
}
