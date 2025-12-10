import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Package, Download, Send, CheckCircle2 } from 'lucide-react';

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

const typesColis = [
    "Petit (< 2kg)",
    "Moyen (2-5kg)",
    "Grand (5-15kg)",
    "Très grand (> 15kg)",
];

const villes = [
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

export default function Colis() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        villeDepart: '',
        quartierDepart: '',
        villeDestination: '',
        quartierDestination: '',
        natureColis: '',
        valeurColis: '',
        poids: '',
        typeColis: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('requests').insert({
                service_type: 'colis',
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
                                Merci pour votre demande d'expédition de colis. Notre équipe vous contactera via WhatsApp dans les plus brefs délais.
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
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-4 shadow-soft">
                                <Package className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Expédition de Colis</CardTitle>
                            <CardDescription>
                                Envoyez vos colis partout au Cameroun en toute sécurité
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/catalogues/prix-colis.pdf" download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger le catalogue des prix
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
                                    <h3 className="font-medium text-foreground">Départ du colis</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Ville de départ</Label>
                                            <Select onValueChange={(v) => handleChange('villeDepart', v)} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {villes.map((ville) => (
                                                        <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quartierDepart">Quartier</Label>
                                            <Input
                                                id="quartierDepart"
                                                placeholder="Akwa, Bonanjo..."
                                                value={formData.quartierDepart}
                                                onChange={(e) => handleChange('quartierDepart', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary space-y-4">
                                    <h3 className="font-medium text-foreground">Destination du colis</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Ville de destination</Label>
                                            <Select onValueChange={(v) => handleChange('villeDestination', v)} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {villes.map((ville) => (
                                                        <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quartierDestination">Quartier</Label>
                                            <Input
                                                id="quartierDestination"
                                                placeholder="Bastos, Mokolo..."
                                                value={formData.quartierDestination}
                                                onChange={(e) => handleChange('quartierDestination', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nature du colis</Label>
                                        <Select onValueChange={(v) => handleChange('natureColis', v)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {naturesColis.map((nature) => (
                                                    <SelectItem key={nature} value={nature}>{nature}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valeur du colis</Label>
                                        <Select onValueChange={(v) => handleChange('valeurColis', v)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {valeursColis.map((valeur) => (
                                                    <SelectItem key={valeur} value={valeur}>{valeur}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="poids">Poids estimé (kg)</Label>
                                        <Input
                                            id="poids"
                                            type="number"
                                            placeholder="2.5"
                                            value={formData.poids}
                                            onChange={(e) => handleChange('poids', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type de colis</Label>
                                        <Select onValueChange={(v) => handleChange('typeColis', v)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {typesColis.map((type) => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
