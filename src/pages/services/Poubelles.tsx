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
import { Trash2, Download, Send, CheckCircle2 } from 'lucide-react';

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

export default function Poubelles() {
    const [categorie, setCategorie] = useState('');
    const [formData, setFormData] = useState<Record<string, string>>({});
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
                service_type: 'poubelles',
                payload: { categorie, ...formData },
                contact_name: formData.nom || formData.nomEntreprise || formData.nomHotel || formData.nomRestaurant || 'Client',
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
                        <CardContent>
                            <Button variant="cta" onClick={() => { setSubmitted(false); setCategorie(''); setFormData({}); }} className="w-full">
                                Nouvelle demande
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        );
    }

    const renderHabitationForm = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" placeholder="Jean" value={formData.prenom || ''} onChange={(e) => handleChange('prenom', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" placeholder="Dupont" value={formData.nom || ''} onChange={(e) => handleChange('nom', e.target.value)} required />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Type d'habitation</Label>
                <Select onValueChange={(v) => handleChange('typeHabitation', v)} required>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                        {typesHabitation.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Select onValueChange={(v) => handleChange('quartier', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rue">Rue</Label>
                    <Input id="rue" placeholder="Face pharmacie..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Taille de la poubelle</Label>
                    <Select onValueChange={(v) => handleChange('taillePoubelle', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {taillesPoubelle.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Passages par mois</Label>
                    <Select onValueChange={(v) => handleChange('passagesParMois', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} required />
            </div>
        </>
    );

    const renderEntrepriseForm = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="nomEntreprise">Nom de l'entreprise</Label>
                <Input id="nomEntreprise" placeholder="Ma Société SARL" value={formData.nomEntreprise || ''} onChange={(e) => handleChange('nomEntreprise', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Select onValueChange={(v) => handleChange('quartier', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rue">Rue</Label>
                    <Input id="rue" placeholder="Rue de l'usine..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomContact">Nom personne à contacter</Label>
                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select onValueChange={(v) => handleChange('poste', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nombreEmployes">Nombre d'employés</Label>
                    <Input id="nombreEmployes" type="number" placeholder="25" value={formData.nombreEmployes || ''} onChange={(e) => handleChange('nombreEmployes', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="vidagesParSemaine">Vidages actuels / semaine</Label>
                    <Input id="vidagesParSemaine" type="number" placeholder="2" value={formData.vidagesParSemaine || ''} onChange={(e) => handleChange('vidagesParSemaine', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Passages désirés / mois</Label>
                    <Select onValueChange={(v) => handleChange('passagesParMois', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Agent d'entretien ?</Label>
                    <Select onValueChange={(v) => handleChange('agentEntretien', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="oui">Oui</SelectItem>
                            <SelectItem value="non">Non</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    );

    const renderHotelForm = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomHotel">Nom de l'hôtel</Label>
                    <Input id="nomHotel" placeholder="Hôtel Le Palace" value={formData.nomHotel || ''} onChange={(e) => handleChange('nomHotel', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombreChambres">Nombre de chambres</Label>
                    <Input id="nombreChambres" type="number" placeholder="50" value={formData.nombreChambres || ''} onChange={(e) => handleChange('nombreChambres', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Select onValueChange={(v) => handleChange('quartier', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rue">Rue</Label>
                    <Input id="rue" placeholder="Boulevard..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomContact">Nom personne à contacter</Label>
                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select onValueChange={(v) => handleChange('poste', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="autresInfos">Autres informations pertinentes</Label>
                <Textarea id="autresInfos" placeholder="Détails supplémentaires..." value={formData.autresInfos || ''} onChange={(e) => handleChange('autresInfos', e.target.value)} />
            </div>
        </>
    );

    const renderRestaurantForm = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomRestaurant">Nom du restaurant</Label>
                    <Input id="nomRestaurant" placeholder="Chez Mama" value={formData.nomRestaurant || ''} onChange={(e) => handleChange('nomRestaurant', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombreTables">Nombre de tables</Label>
                    <Input id="nombreTables" type="number" placeholder="20" value={formData.nombreTables || ''} onChange={(e) => handleChange('nombreTables', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Select onValueChange={(v) => handleChange('quartier', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {quartiersDouala.map((q) => (<SelectItem key={q} value={q}>{q}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rue">Rue</Label>
                    <Input id="rue" placeholder="Carrefour..." value={formData.rue || ''} onChange={(e) => handleChange('rue', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fréquence de vidage</Label>
                    <Select onValueChange={(v) => handleChange('frequenceVidage', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {passagesParMois.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nombrePoubelles">Nombre de poubelles</Label>
                    <Input id="nombrePoubelles" type="number" placeholder="4" value={formData.nombrePoubelles || ''} onChange={(e) => handleChange('nombrePoubelles', e.target.value)} required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomContact">Nom personne à contacter</Label>
                    <Input id="nomContact" placeholder="Jean Dupont" value={formData.nomContact || ''} onChange={(e) => handleChange('nomContact', e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select onValueChange={(v) => handleChange('poste', v)} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                            {postes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} required />
            </div>
        </>
    );

    const renderAutreForm = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="description">Description de votre besoin</Label>
                <Textarea id="description" placeholder="Décrivez votre situation et vos besoins en ramassage de poubelles..." value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} required className="min-h-[120px]" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input id="whatsapp" placeholder="+237 6XX XXX XXX" value={formData.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} required />
            </div>
        </>
    );

    return (
        <Layout>
            <div className="py-12 px-4 african-pattern">
                <div className="container mx-auto max-w-2xl">
                    <Card className="shadow-card border-border">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-4 shadow-soft">
                                <Trash2 className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Ramassage / Vidage de Poubelles</CardTitle>
                            <CardDescription>
                                Service de collecte pour particuliers et professionnels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/catalogues/services-poubelles.pdf" download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger le catalogue
                                    </a>
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Vous êtes</Label>
                                    <Select value={categorie} onValueChange={(v) => { setCategorie(v); setFormData({}); }} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner votre catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {categorie === 'habitation' && renderHabitationForm()}
                                {categorie === 'entreprise' && renderEntrepriseForm()}
                                {categorie === 'hotel' && renderHotelForm()}
                                {categorie === 'restaurant' && renderRestaurantForm()}
                                {categorie === 'autre' && renderAutreForm()}

                                {categorie && (
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
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
