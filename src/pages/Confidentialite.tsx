import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';

export default function Confidentialite() {
    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative py-16 bg-gradient-to-br from-african-green/10 via-background to-african-yellow/10">
                    <div className="container mx-auto px-4 text-center">
                        <Badge className="bg-african-earth text-white mb-6">Légal</Badge>
                        <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-muted-foreground">Dernière mise à jour : Janvier 2025</p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 container mx-auto px-4">
                    <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">

                        <h2>1. Introduction</h2>
                        <p>
                            Le Bon Petit s'engage à protéger la vie privée de ses utilisateurs.
                            Cette politique de confidentialité explique comment nous collectons, utilisons,
                            stockons et protégeons vos données personnelles lorsque vous utilisez nos services.
                        </p>

                        <h2>2. Données collectées</h2>
                        <p>Nous pouvons collecter les informations suivantes :</p>
                        <ul>
                            <li><strong>Données d'identification :</strong> Nom, prénom, numéro de téléphone, adresse email.</li>
                            <li><strong>Données de localisation :</strong> Adresse de livraison ou d'intervention.</li>
                            <li><strong>Données de commande :</strong> Historique des services commandés, préférences.</li>
                            <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, pages visitées.</li>
                        </ul>

                        <h2>3. Utilisation des données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul>
                            <li>Exécuter et livrer les services commandés.</li>
                            <li>Communiquer avec vous concernant vos commandes.</li>
                            <li>Améliorer nos services et votre expérience utilisateur.</li>
                            <li>Vous envoyer des informations promotionnelles (avec votre consentement).</li>
                            <li>Respecter nos obligations légales.</li>
                        </ul>

                        <h2>4. Partage des données</h2>
                        <p>
                            Nous ne vendons pas vos données personnelles. Nous pouvons les partager avec :
                        </p>
                        <ul>
                            <li>Nos livreurs et prestataires pour l'exécution des services.</li>
                            <li>Nos partenaires techniques (hébergement, paiement).</li>
                            <li>Les autorités compétentes si la loi l'exige.</li>
                        </ul>

                        <h2>5. Sécurité des données</h2>
                        <p>
                            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
                            pour protéger vos données contre tout accès non autorisé, modification,
                            divulgation ou destruction. Cela inclut le chiffrement des données sensibles
                            et l'accès restreint aux informations personnelles.
                        </p>

                        <h2>6. Conservation des données</h2>
                        <p>
                            Vos données personnelles sont conservées pendant la durée nécessaire à la
                            fourniture des services et conformément aux obligations légales applicables.
                            Les données de commande sont conservées pendant 5 ans à des fins comptables.
                        </p>

                        <h2>7. Vos droits</h2>
                        <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
                        <ul>
                            <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles.</li>
                            <li><strong>Droit de rectification :</strong> Corriger des données inexactes.</li>
                            <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données.</li>
                            <li><strong>Droit d'opposition :</strong> Vous opposer à certains traitements.</li>
                            <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré.</li>
                        </ul>
                        <p>
                            Pour exercer ces droits, contactez-nous à : contact@lebonpetit237.com
                        </p>

                        <h2>8. Cookies</h2>
                        <p>
                            Notre site utilise des cookies pour améliorer votre expérience de navigation.
                            Les cookies sont de petits fichiers stockés sur votre appareil. Vous pouvez
                            configurer votre navigateur pour refuser les cookies, mais certaines
                            fonctionnalités du site pourraient ne plus fonctionner correctement.
                        </p>

                        <h2>9. Liens externes</h2>
                        <p>
                            Notre site peut contenir des liens vers des sites tiers. Nous ne sommes pas
                            responsables des pratiques de confidentialité de ces sites. Nous vous encourageons
                            à lire leurs politiques de confidentialité.
                        </p>

                        <h2>10. Modifications</h2>
                        <p>
                            Nous pouvons modifier cette politique de confidentialité à tout moment.
                            Les modifications seront publiées sur cette page avec une date de mise à jour.
                            Nous vous encourageons à consulter régulièrement cette page.
                        </p>

                        <h2>11. Contact</h2>
                        <p>
                            Pour toute question concernant cette politique de confidentialité :<br />
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
