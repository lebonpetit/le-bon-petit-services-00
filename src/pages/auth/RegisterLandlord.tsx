import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Building2, CheckCircle2 } from 'lucide-react';

export default function RegisterLandlord() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Le mot de passe doit contenir au moins 6 caractères",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await signUp(
                formData.email,
                formData.password,
                formData.name,
                formData.phone,
                'landlord'
            );

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur d'inscription",
                    description: error.message,
                });
            } else {
                toast({
                    title: "Inscription réussie !",
                    description: "Votre compte bailleur est activé. Vous pouvez maintenant publier des logements.",
                });
                navigate('/landlord/dashboard');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Une erreur est survenue",
            });
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        "Publiez vos logements gratuitement",
        "Recevez des demandes de locataires",
        "Messagerie intégrée",
        "Statistiques de vues",
    ];

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                <Card className="w-full max-w-md shadow-card border-border">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-4 shadow-soft">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="font-heading text-2xl">Inscription Bailleur</CardTitle>
                        <CardDescription>
                            Publiez vos biens immobiliers gratuitement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 p-4 rounded-xl bg-secondary">
                            <p className="text-sm font-medium text-foreground mb-2">Avantages bailleur :</p>
                            <ul className="space-y-1">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-african-green flex-shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Jean Dupont"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Numéro WhatsApp</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+237 6XX XXX XXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="bg-background pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="bg-background"
                                />
                            </div>

                            <Button type="submit" variant="cta" className="w-full" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Inscription...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        S'inscrire gratuitement
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-border text-center">
                            <p className="text-sm text-muted-foreground">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Se connecter
                                </Link>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Vous cherchez un logement ?{' '}
                                <Link to="/register/tenant" className="text-primary hover:underline font-medium">
                                    Inscription Locataire
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
