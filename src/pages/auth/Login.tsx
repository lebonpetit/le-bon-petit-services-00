import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn(email, password);

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Erreur de connexion",
                    description: error.message === 'Invalid login credentials'
                        ? "Email ou mot de passe incorrect"
                        : error.message,
                });
            } else {
                toast({
                    title: "Connexion réussie",
                    description: "Bienvenue sur Le Bon Petit !",
                });
                // Redirect to /dashboard which handles role-based redirection
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
                <Card className="w-full max-w-md shadow-card border-border">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
                            <img
                                src="/logo.jpg"
                                alt="Le Bon Petit"
                                className="w-full h-full object-contain rounded-xl shadow-soft"
                            />
                        </div>
                        <CardTitle className="font-heading text-2xl">Connexion</CardTitle>
                        <CardDescription>
                            Connectez-vous pour accéder à votre espace logement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email ou numéro WhatsApp</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                            <div className="text-right">
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>

                            <Button type="submit" variant="cta" className="w-full" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Connexion...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LogIn className="h-4 w-4" />
                                        Se connecter
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-center text-sm text-muted-foreground mb-4">
                                Pas encore de compte ?
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" asChild className="w-full">
                                    <Link to="/register/tenant">Locataire</Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link to="/register/landlord">Bailleur</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
