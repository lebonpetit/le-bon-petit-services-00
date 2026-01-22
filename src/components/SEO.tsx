import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
    keywords?: string;
}

export function SEO({
    title = "Le Bon Petit - Services à Domicile à Douala",
    description = "Colis, gaz, lessive, poubelles ou logements — Le Bon Petit s'occupe de tout à Douala. Service rapide et fiable au Cameroun.",
    type = "website",
    image = "https://lebonpetit.cm/logo.jpg",
    url = typeof window !== 'undefined' ? window.location.href : 'https://lebonpetit.cm',
    keywords = "services domicile douala, livraison colis cameroun, gaz domicile douala, pressing douala, logement douala"
}: SEOProps) {
    const siteTitle = title.includes("Le Bon Petit") ? title : `${title} | Le Bon Petit`;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
