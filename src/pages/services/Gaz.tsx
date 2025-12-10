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
import { Flame, Download, Send, CheckCircle2 } from 'lucide-react';

const marquesBouteilles = [
    "SCTM (Bouteille bleue)",
    "CAMGAZ (Bouteille verte)",
    "TRADEX GAZ",
    "TOTAL GAZ",
    "Autres",
];

const nombreParAn = [
    "1-2 bouteilles",
    "3-5 bouteilles",
    "6-10 bouteilles",
    "Plus de 10 bouteilles",
];

const quartiersDouala = [
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
    "Yassa", "Logbessou", "Bonamikano", "Autres",
];

export default function Gaz() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        whatsapp: '',
        quartier: '',
        rue: '',
        marqueBouteille: '',
        possedeBouteille: 'oui',
        nombreParAn: '',
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
                service_type: 'gaz',
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
                                Merci pour votre commande de gaz. Notre équipe vous contactera via WhatsApp dans les plus brefs délais.
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
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-red to-african-red/80 flex items-center justify-center mb-4 shadow-soft">
                                <Flame className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Achat & Livraison de Gaz</CardTitle>
                            <CardDescription>
                                Commandez vos bouteilles de gaz et recevez-les chez vous
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/catalogues/services-gaz.pdf" download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger le catalogue des services gaz
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
                                    <h3 className="font-medium text-foreground">Adresse de livraison</h3>
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

                                <div className="space-y-2">
                                    <Label>Marque de bouteille</Label>
                                    <Select onValueChange={(v) => handleChange('marqueBouteille', v)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner la marque" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {marquesBouteilles.map((marque) => (
                                                <SelectItem key={marque} value={marque}>{marque}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label>Possédez-vous déjà une bouteille à échanger ?</Label>
                                    <RadioGroup
                                        value={formData.possedeBouteille}
                                        onValueChange={(v) => handleChange('possedeBouteille', v)}
                                        className="flex gap-4"
                                    >
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

                                <div className="space-y-2">
                                    <Label>Combien de bouteilles achetez-vous par an ?</Label>
                                    <Select onValueChange={(v) => handleChange('nombreParAn', v)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {nombreParAn.map((nombre) => (
                                                <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            Commander
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
