import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Phone, MessageCircle, CreditCard } from 'lucide-react';

export default function PendingPayment() {
    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 african-pattern">
                <Card className="w-full max-w-md shadow-card border-border text-center">
                    <CardHeader>
                        <div className="mx-auto w-20 h-20 rounded-full bg-african-yellow/20 flex items-center justify-center mb-4">
                            <Clock className="h-10 w-10 text-african-yellow" />
                        </div>
                        <CardTitle className="font-heading text-2xl">En attente de paiement</CardTitle>
                        <CardDescription>
                            Votre compte locataire est créé mais nécessite le paiement de l'abonnement pour être activé
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-secondary">
                            <p className="text-lg font-heading font-bold text-primary">10 000 FCFA / mois</p>
                            <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
                        </div>

                        <div className="space-y-3 text-left">
                            <p className="font-medium text-foreground">Pour effectuer le paiement :</p>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                                <CreditCard className="h-5 w-5 text-african-green mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Mobile Money</p>
                                    <p className="text-sm text-muted-foreground">MTN / Orange Money</p>
                                    <p className="text-sm text-primary font-mono mt-1">+237 6XX XXX XXX</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-3">
                                Une fois le paiement effectué, contactez-nous :
                            </p>
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
