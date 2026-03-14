import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Star, Gift, ShieldCheck } from 'lucide-react';

export default function RegisterUser() {
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
                'user'
            );

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur d'inscription",
                    description: error.message,
                });
            } else {
                toast({
                    title: "Inscription réussie ! 🎉",
                    description: "Bienvenue ! Vous pouvez maintenant profiter du programme de fidélité.",
                });
                navigate('/dashboard', { replace: true });
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

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                <div className="w-full max-w-lg space-y-6">
                    {/* Loyalty Benefits Banner */}
                    <div className="bg-gradient-to-r from-african-yellow/20 via-african-gold/10 to-african-yellow/20 border border-african-yellow/30 rounded-2xl p-6 text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <Star className="h-6 w-6 text-african-yellow fill-african-yellow" />
                            <h2 className="font-heading text-xl font-bold">Programme de Fidélité</h2>
                            <Star className="h-6 w-6 text-african-yellow fill-african-yellow" />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Créez votre compte gratuit et accumulez des points à chaque commande !
                        </p>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="flex flex-col items-center gap-1.5 p-2 bg-background/60 rounded-xl">
                                <ShieldCheck className="h-5 w-5 text-african-green" />
                                <span className="text-xs font-medium">Compte gratuit</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 p-2 bg-background/60 rounded-xl">
                                <Star className="h-5 w-5 text-african-yellow" />
                                <span className="text-xs font-medium">1 pt / commande</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 p-2 bg-background/60 rounded-xl">
                                <Gift className="h-5 w-5 text-african-red" />
                                <span className="text-xs font-medium">-30% à 10 pts</span>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <Card className="shadow-card border-border">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
                                <img
                                    src="/logo.jpg"
                                    alt="Le Bon Petit"
                                    className="w-full h-full object-contain rounded-xl shadow-soft"
                                />
                            </div>
                            <CardTitle className="font-heading text-2xl">Créer un compte</CardTitle>
                            <CardDescription>
                                Inscrivez-vous pour profiter de nos services et du programme de fidélité
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        placeholder="+237 6XX XXX XXX"
                                        value={formData.phone}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
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
                                <p className="text-sm text-muted-foreground mb-4">
                                    Déjà un compte ?{' '}
                                    <Link to="/login" className="text-primary hover:underline font-medium">
                                        Se connecter
                                    </Link>
                                </p>
                                <div className="flex flex-col gap-2 mb-4">
                                    <p className="text-xs font-medium">Autres types de comptes :</p>
                                    <Button variant="outline" asChild className="w-full text-xs" size="sm">
                                        <Link to="/register/tenant">
                                            Locataire (Recherche de logement)
                                        </Link>
                                    </Button>
                                </div>
                                <div className="pt-4 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground mb-2">Vous êtes propriétaire ou agent ?</p>
                                    <Link to="/register/landlord" className="text-xs text-primary hover:underline">
                                        Créer un compte Professionnel (Bailleur)
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
