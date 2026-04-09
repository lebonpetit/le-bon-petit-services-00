import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, Building2, CheckCircle2, User, Mail, Lock, ArrowRight, ArrowLeft, Check, Phone } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Identité', icon: User, description: 'Présentez-vous en tant que bailleur' },
    { id: 2, title: 'Contact', icon: Phone, description: 'Vos coordonnées professionnelles' },
    { id: 3, title: 'Sécurité', icon: Lock, description: 'Sécurisez votre espace bailleur' },
];

export default function RegisterLandlord() {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [animating, setAnimating] = useState(false);
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
    const stepRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                if (!formData.name.trim()) {
                    toast({ variant: "destructive", title: "Champ requis", description: "Veuillez entrer votre nom complet" });
                    return false;
                }
                if (formData.name.trim().length < 2) {
                    toast({ variant: "destructive", title: "Nom trop court", description: "Le nom doit contenir au moins 2 caractères" });
                    return false;
                }
                return true;
            case 2:
                if (!formData.email.trim()) {
                    toast({ variant: "destructive", title: "Champ requis", description: "Veuillez entrer votre email" });
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    toast({ variant: "destructive", title: "Email invalide", description: "Veuillez entrer une adresse email valide" });
                    return false;
                }
                if (!formData.phone.trim()) {
                    toast({ variant: "destructive", title: "Champ requis", description: "Veuillez entrer votre numéro WhatsApp" });
                    return false;
                }
                return true;
            case 3:
                if (formData.password.length < 6) {
                    toast({ variant: "destructive", title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères" });
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas" });
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const goToStep = (targetStep: number) => {
        if (animating) return;
        if (targetStep > currentStep && !validateStep(currentStep)) return;

        setDirection(targetStep > currentStep ? 'forward' : 'backward');
        setAnimating(true);

        setTimeout(() => {
            setCurrentStep(targetStep);
            setTimeout(() => setAnimating(false), 50);
        }, 200);
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) goToStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

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

    // Auto-focus first input of each step
    useEffect(() => {
        const timer = setTimeout(() => {
            if (stepRef.current) {
                const input = stepRef.current.querySelector('input:not([type="hidden"])');
                if (input) (input as HTMLInputElement).focus();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentStep < STEPS.length) {
            e.preventDefault();
            nextStep();
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                <Card className="w-full max-w-md shadow-card border-border overflow-hidden">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-african-green to-african-green/80 flex items-center justify-center mb-4 shadow-soft">
                            <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="font-heading text-2xl">Inscription Bailleur</CardTitle>
                        <CardDescription>
                            Publiez vos biens immobiliers gratuitement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Benefits */}
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

                        {/* Step Progress */}
                        <div className="mb-8">
                            {/* Progress Bar */}
                            <div className="relative h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-african-green to-african-green/70 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            {/* Step Indicators */}
                            <div className="flex justify-between">
                                {STEPS.map((step) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = currentStep > step.id;
                                    const isCurrent = currentStep === step.id;
                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            onClick={() => {
                                                if (step.id < currentStep) goToStep(step.id);
                                            }}
                                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                                                step.id < currentStep ? 'cursor-pointer' : 'cursor-default'
                                            }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                    isCompleted
                                                        ? 'bg-african-green text-white shadow-md scale-90'
                                                        : isCurrent
                                                        ? 'bg-gradient-to-br from-african-green to-african-green/80 text-white shadow-lg scale-110 ring-4 ring-african-green/20'
                                                        : 'bg-secondary text-muted-foreground'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <StepIcon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs font-medium transition-colors duration-300 ${
                                                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                            >
                                                {step.title}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Title */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-muted-foreground animate-in fade-in duration-300">
                                {STEPS[currentStep - 1].description}
                            </p>
                        </div>

                        {/* Form Steps */}
                        <form onSubmit={handleSubmit} autoComplete="off" onKeyDown={handleKeyDown}>
                            <div
                                ref={stepRef}
                                className={`transition-all duration-300 ease-out ${
                                    animating
                                        ? direction === 'forward'
                                            ? 'opacity-0 translate-x-8'
                                            : 'opacity-0 -translate-x-8'
                                        : 'opacity-100 translate-x-0'
                                }`}
                            >
                                {/* Step 1: Identity */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nom complet</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Mvondo Pierre"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="bg-background h-12 text-base"
                                                autoFocus
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Nom et prénom du propriétaire ou du responsable de l'agence
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Contact */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Adresse email professionnelle</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="votre@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="bg-background h-12 text-base"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Numéro WhatsApp</Label>
                                            <PhoneInput
                                                id="phone"
                                                name="phone"
                                                placeholder="6XX XX XX XX"
                                                value={formData.phone}
                                                onValueChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                                                required
                                                className="bg-background"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Les locataires vous contacteront via ce numéro
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Security */}
                                {currentStep === 3 && (
                                    <div className="space-y-4">
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
                                                    className="bg-background pr-10 h-12 text-base"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Minimum 6 caractères
                                            </p>
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
                                                className="bg-background h-12 text-base"
                                            />
                                        </div>

                                        {/* Recap */}
                                        <div className="mt-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
                                            <p className="text-xs font-medium text-muted-foreground mb-2">Récapitulatif :</p>
                                            <div className="space-y-1">
                                                <p className="text-sm flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-african-green" />
                                                    {formData.name}
                                                </p>
                                                <p className="text-sm flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-african-green" />
                                                    {formData.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 mt-8">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={animating}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Retour
                                    </Button>
                                )}

                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        variant="cta"
                                        onClick={nextStep}
                                        disabled={animating}
                                        className="flex-1"
                                    >
                                        Continuer
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" variant="cta" className="flex-1" disabled={loading}>
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
                                )}
                            </div>
                        </form>

                        {/* Step counter */}
                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Étape {currentStep} sur {STEPS.length}
                        </p>

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
