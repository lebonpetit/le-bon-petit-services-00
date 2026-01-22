import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, Phone, MessageCircle } from 'lucide-react';

export default function AccountBlocked() {
    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                <Card className="w-full max-w-md shadow-card border-border text-center">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 rounded-full bg-african-red/20 flex items-center justify-center mb-4">
                            <Ban className="h-10 w-10 text-african-red" />
                        </div>
                        <CardTitle className="font-heading text-2xl">Compte bloqué</CardTitle>
                        <CardDescription>
                            Votre compte a été temporairement suspendu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-secondary">
                            <p className="text-sm text-muted-foreground">
                                Cela peut être dû à un abonnement expiré ou à une violation de nos conditions d'utilisation.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-foreground">Contactez-nous pour résoudre ce problème :</p>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <a href="tel:+237XXXXXXXX">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Appeler
                                    </a>
                                </Button>
                                <Button variant="cta" className="flex-1" asChild>
                                    <a href="https://wa.me/237690547084" target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="ghost" asChild className="w-full">
                                <Link to="/">Retour à l'accueil</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
