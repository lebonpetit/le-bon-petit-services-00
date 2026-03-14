import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';

export default function CGU() {
    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative py-16 bg-gradient-to-br from-african-green/10 via-background to-african-yellow/10">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="bg-african-earth text-white mb-6">Légal</Badge>
                        <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4">
                            Conditions Générales d'Utilisation
                        </h1>
                        <p className="text-muted-foreground">Dernière mise à jour : Janvier 2025</p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 container mx-auto px-4">
                    <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">

                        <h2>1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme Le Bon Petit,
                            accessible à l'adresse www.lebonpetit237.com, ainsi que l'ensemble des services proposés : gestion d'ordures,
                            livraison de gaz, expédition de colis, nettoyage, ramassage de lessive et location de logements meublés.
                        </p>

                        <h2>2. Acceptation des conditions</h2>
                        <p>
                            L'utilisation de nos services implique l'acceptation pleine et entière des présentes CGU.
                            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                        </p>

                        <h2>3. Description des services</h2>
                        <p>Le Bon Petit propose les services suivants :</p>
                        <ul>
                            <li><strong>Gestion d'ordures :</strong> Précollecte régulière des déchets ménagers et professionnels.</li>
                            <li><strong>Livraison de gaz :</strong> Livraison et installation de bouteilles de gaz domestique.</li>
                            <li><strong>Expédition de colis :</strong> Transport de colis au niveau national et international.</li>
                            <li><strong>Nettoyage :</strong> Services de nettoyage pour particuliers et professionnels.</li>
                            <li><strong>Lessive :</strong> Ramassage, lavage, repassage et livraison du linge.</li>
                            <li><strong>Logements :</strong> Mise en relation pour la location de logements meublés.</li>
                        </ul>

                        <h2>4. Inscription et compte utilisateur</h2>
                        <p>
                            Certains services nécessitent la création d'un compte. L'utilisateur s'engage à fournir des informations
                            exactes et à maintenir la confidentialité de ses identifiants. Toute utilisation frauduleuse du compte
                            pourra entraîner sa suspension immédiate.
                        </p>

                        <h2>5. Commandes et paiements</h2>
                        <p>
                            Les commandes peuvent être passées via le site web, WhatsApp ou par téléphone.
                            Les prix affichés sont en Francs CFA (FCFA) et peuvent être modifiés sans préavis.
                            Le paiement peut s'effectuer en espèces, Mobile Money ou virement bancaire selon le service.
                        </p>

                        <h2>6. Livraison et exécution</h2>
                        <p>
                            Nous nous engageons à respecter les délais annoncés. Toutefois, des retards peuvent survenir
                            pour des raisons indépendantes de notre volonté (conditions météorologiques, embouteillages, etc.).
                            En cas de retard significatif, le client sera informé.
                        </p>

                        <h2>7. Annulation et remboursement</h2>
                        <p>
                            Les annulations doivent être effectuées au moins 2 heures avant l'intervention prévue.
                            Les abonnements peuvent être résiliés avec un préavis de 7 jours.
                            Les remboursements sont traités au cas par cas selon la nature du service.
                        </p>

                        <h2>8. Responsabilités</h2>
                        <p>
                            Le Bon Petit s'engage à fournir des services de qualité. Cependant, notre responsabilité
                            ne saurait être engagée en cas de force majeure, de faute de l'utilisateur ou de tiers.
                            Pour les colis, une déclaration de valeur est recommandée pour les objets de valeur.
                        </p>

                        <h2>9. Propriété intellectuelle</h2>
                        <p>
                            L'ensemble des contenus du site (textes, images, logos, design) sont la propriété
                            exclusive de Le Bon Petit et sont protégés par le droit de la propriété intellectuelle.
                            Toute reproduction sans autorisation est interdite.
                        </p>

                        <h2>10. Modification des CGU</h2>
                        <p>
                            Le Bon Petit se réserve le droit de modifier les présentes CGU à tout moment.
                            Les utilisateurs seront informés des modifications par publication sur le site.
                        </p>

                        <h2>11. Droit applicable</h2>
                        <p>
                            Les présentes CGU sont régies par le droit camerounais. Tout litige sera soumis
                            aux tribunaux compétents de Douala, Cameroun.
                        </p>

                        <h2>12. Contact</h2>
                        <p>
                            Pour toute question concernant ces CGU, contactez-nous :<br />
                            Email : contact@lebonpetit237.com<br />
                            Téléphone : +237 690 547 084<br />
                            Adresse : Douala, Cameroun
                        </p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
