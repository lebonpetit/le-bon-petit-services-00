import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Home, Plus, ArrowLeft, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const quartiersDouala = [
    "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
    "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
    "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
    "Yassa", "Logbessou", "Bonamikano", "Autres",
];

const typesLogement = [
    "Studio",
    "Appartement",
    "Chambre",
    "Maison",
    "Villa",
];

interface UploadedPhoto {
    file: File;
    preview: string;
    uploading?: boolean;
    url?: string;
}

export default function AddListing() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        quartier: '',
        rue: '',
        type_logement: '',
    });
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

    const handleChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: UploadedPhoto[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    variant: "destructive",
                    title: "Format invalide",
                    description: `${file.name} n'est pas une image`,
                });
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Fichier trop volumineux",
                    description: `${file.name} dépasse 5MB`,
                });
                continue;
            }

            // Create preview
            const preview = URL.createObjectURL(file);
            newPhotos.push({ file, preview });
        }

        setPhotos([...photos, ...newPhotos]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        const photo = photos[index];
        URL.revokeObjectURL(photo.preview); // Clean up memory
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const uploadPhotos = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const photo of photos) {
            try {
                // Generate unique filename
                const fileExt = photo.file.name.split('.').pop();
                const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                    .from('listings')
                    .upload(fileName, photo.file, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (error) {
                    console.error('Upload error:', error);
                    throw error;
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('listings')
                    .getPublicUrl(fileName);

                uploadedUrls.push(urlData.publicUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
                toast({
                    variant: "destructive",
                    title: "Erreur d'upload",
                    description: `Impossible d'uploader ${photo.file.name}`,
                });
            }
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Vous devez être connecté",
            });
            return;
        }

        if (photos.length === 0) {
            toast({
                variant: "destructive",
                title: "Photos requises",
                description: "Ajoutez au moins une photo de votre logement",
            });
            return;
        }

        setLoading(true);
        setUploadingPhotos(true);

        try {
            // Upload photos first
            const photoUrls = await uploadPhotos();

            if (photoUrls.length === 0) {
                throw new Error('Aucune photo n\'a pu être uploadée');
            }

            setUploadingPhotos(false);

            // Create listing
            const { error } = await supabase.from('listings').insert({
                owner_id: user.id,
                title: formData.title,
                description: formData.description,
                price: parseInt(formData.price),
                quartier: formData.quartier,
                rue: formData.rue,
                type_logement: formData.type_logement,
                photos: photoUrls,
                views: 0,
                available: true,
            });

            if (error) throw error;

            toast({
                title: "Logement ajouté !",
                description: "Votre logement est maintenant visible par les locataires",
            });
            navigate('/landlord/dashboard');
        } catch (error) {
            console.error('Error adding listing:', error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'ajouter le logement",
            });
        } finally {
            setLoading(false);
            setUploadingPhotos(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-6">
                    <Link to="/landlord/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour au tableau de bord
                    </Link>
                </div>

                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center">
                                <Home className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <CardTitle className="font-heading text-2xl">Ajouter un logement</CardTitle>
                                <CardDescription>Publiez votre bien pour le rendre visible aux locataires</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de l'annonce</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Bel appartement 3 chambres à Bonamoussadi"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Décrivez votre logement en détail (équipements, proximité, etc.)"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    required
                                    className="min-h-[120px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Loyer mensuel (FCFA)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Ex: 75000"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type de logement</Label>
                                    <Select onValueChange={(v) => handleChange('type_logement', v)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {typesLogement.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quartier</Label>
                                    <Select onValueChange={(v) => handleChange('quartier', v)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {quartiersDouala.map((q) => (
                                                <SelectItem key={q} value={q}>{q}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rue">Rue / Repère</Label>
                                    <Input
                                        id="rue"
                                        placeholder="Face pharmacie, après carrefour..."
                                        value={formData.rue}
                                        onChange={(e) => handleChange('rue', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Photo Upload Section */}
                            <div className="space-y-4">
                                <Label>Photos du logement</Label>

                                {/* Upload Zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm font-medium">Cliquez pour ajouter des photos</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG, GIF - Max 5MB par photo
                                    </p>
                                </div>

                                {/* Photo Previews */}
                                {photos.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={photo.preview}
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
                                                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add more button */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                                        >
                                            <Plus className="h-6 w-6 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    {photos.length} photo(s) sélectionnée(s)
                                </p>
                            </div>

                            <Button type="submit" variant="cta" className="w-full" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {uploadingPhotos ? 'Upload des photos...' : 'Publication en cours...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Publier le logement
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
