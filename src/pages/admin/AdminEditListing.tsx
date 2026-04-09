import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout, adminNavItems } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase, Listing } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Home, ArrowLeft, Upload, X, Image as ImageIcon, Loader2, Save, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CITIES, QUARTIERS_BY_CITY, TYPES_LOGEMENT } from '@/lib/constants';

interface PhotoItem {
    url: string;
    isNew?: boolean;
    file?: File;
    preview?: string;
}

export default function AdminEditListing() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        city: 'Douala',
        quartier: '',
        rue: '',
        type_logement: '',
        available: true,
        furnished: true,
    });
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchListing();
        }
    }, [id]);

    const fetchListing = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Admin can only edit their own listings
            if (data.owner_id !== user?.id) {
                toast({
                    variant: "destructive",
                    title: "Accès refusé",
                    description: "Vous ne pouvez modifier que vos propres logements",
                });
                navigate('/admin/listings');
                return;
            }

            setFormData({
                title: data.title || '',
                description: data.description || '',
                price: data.price?.toString() || '',
                city: data.city || 'Douala',
                quartier: data.quartier || '',
                rue: data.rue || '',
                type_logement: data.type_logement || '',
                available: data.available ?? true,
                furnished: data.furnished ?? true,
            });

            const existingPhotos: PhotoItem[] = (data.photos || []).map((url: string) => ({
                url,
                isNew: false,
            }));
            setPhotos(existingPhotos);
        } catch (error) {
            console.error('Error fetching listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de charger le logement",
            });
            navigate('/admin/listings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name: string, value: string | boolean) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: PhotoItem[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')) {
                toast({
                    variant: "destructive",
                    title: "Format invalide",
                    description: `${file.name} n'est pas une image`,
                });
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Fichier trop volumineux",
                    description: `${file.name} dépasse 5MB`,
                });
                continue;
            }

            const preview = URL.createObjectURL(file);
            newPhotos.push({ url: preview, isNew: true, file, preview });
        }

        setPhotos([...photos, ...newPhotos]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        const photo = photos[index];

        if (photo.isNew && photo.preview) {
            URL.revokeObjectURL(photo.preview);
        } else if (!photo.isNew) {
            setPhotosToDelete([...photosToDelete, photo.url]);
        }

        setPhotos(photos.filter((_, i) => i !== index));
    };

    const uploadNewPhotos = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const photo of photos.filter(p => p.isNew && p.file)) {
            try {
                const fileExt = photo.file!.name.split('.').pop();
                const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error } = await supabase.storage
                    .from('listings')
                    .upload(fileName, photo.file!, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('listings')
                    .getPublicUrl(fileName);

                uploadedUrls.push(urlData.publicUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !id) return;

        setSaving(true);

        try {
            const newPhotoUrls = await uploadNewPhotos();

            const existingPhotoUrls = photos
                .filter(p => !p.isNew)
                .map(p => p.url);

            const allPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];

            const parsedPrice = parseInt(formData.price);
            if (isNaN(parsedPrice)) {
                throw new Error("Le prix doit être un nombre valide");
            }

            if (!formData.type_logement) {
                throw new Error("Le type de logement est requis");
            }

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    title: formData.title,
                    description: formData.description,
                    price: parsedPrice,
                    city: formData.city,
                    quartier: formData.quartier,
                    rue: formData.rue,
                    type_logement: formData.type_logement,
                    available: Boolean(formData.available),
                    furnished: Boolean(formData.furnished),
                    photos: allPhotoUrls,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            toast({
                title: "Logement modifié !",
                description: "Les modifications ont été enregistrées",
            });
            navigate('/admin/listings');
        } catch (error: any) {
            console.error('Error updating listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: error.message || "Impossible de modifier le logement",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout
                title="Modifier un logement"
                subtitle="Chargement..."
                navItems={adminNavItems}
            >
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Modifier un logement"
            subtitle="Modifiez les détails de votre annonce"
            navItems={adminNavItems}
        >
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link to="/admin/listings" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux logements
                    </Link>
                </div>

                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                <Home className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="font-heading text-2xl">Modifier le logement</CardTitle>
                                <CardDescription>Mettez à jour les informations de votre annonce</CardDescription>
                            </div>
                            <Badge className="bg-purple-600 text-white border-none gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Annonce Admin
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de l'annonce</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    required
                                    className="min-h-[120px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>État du logement</Label>
                                <Select
                                    value={formData.furnished ? "true" : "false"}
                                    onValueChange={(v) => handleChange('furnished', v === "true")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Meublé ?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Meublé</SelectItem>
                                        <SelectItem value="false">Non meublé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        {formData.furnished ? "Loyer journalier (FCFA)" : "Loyer mensuel (FCFA)"}
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type de logement</Label>
                                    <Select
                                        value={formData.type_logement}
                                        onValueChange={(v) => handleChange('type_logement', v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TYPES_LOGEMENT.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ville</Label>
                                    <Select
                                        value={formData.city}
                                        onValueChange={(v) => handleChange('city', v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir une ville" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CITIES.map((city) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select
                                        value={formData.quartier}
                                        onValueChange={(v) => handleChange('quartier', v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {QUARTIERS_BY_CITY[formData.city]?.map((q) => (
                                                <SelectItem key={q} value={q}>{q}</SelectItem>
                                            ))}
                                            <SelectItem value="Autres">Autres</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rue">Rue / Repère</Label>
                                <Input
                                    id="rue"
                                    value={formData.rue}
                                    onChange={(e) => handleChange('rue', e.target.value)}
                                />
                            </div>

                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                                <div>
                                    <p className="font-medium">Disponibilité</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formData.available
                                            ? "Le logement est visible par les locataires"
                                            : "Le logement est masqué"}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant={formData.available ? "default" : "outline"}
                                    onClick={() => handleChange('available', !formData.available)}
                                >
                                    {formData.available ? "Disponible" : "Indisponible"}
                                </Button>
                            </div>

                            {/* Photo Management */}
                            <div className="space-y-4">
                                <Label>Photos du logement</Label>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Ajouter des photos</p>
                                </div>

                                {photos.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={photo.isNew ? photo.preview : photo.url}
                                                    alt={`Photo ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                {photo.isNew && (
                                                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-african-green rounded text-white text-xs">
                                                        Nouveau
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    {photos.length} photo(s)
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate('/admin/listings')}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" variant="cta" className="flex-1" disabled={saving}>
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Enregistrement...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Enregistrer
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
