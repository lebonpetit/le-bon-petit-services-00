export const CITIES = [
    "Douala", "Yaoundé", "Bafoussam", "Kribi", "Limbé",
    "Buea", "Bamenda", "Garoua", "Maroua", "Bertoua"
];

export const QUARTIERS_BY_CITY: Record<string, string[]> = {
    "Douala": [
        "Akwa", "Bonanjo", "Bonapriso", "Deïdo", "Bali",
        "Bonabéri", "Makepe", "Bonamoussadi", "Kotto", "Logpom",
        "Ndokotti", "Bépanda", "Nyalla", "PK", "Village",
        "Yassa", "Logbessou", "Bonamikano"
    ],
    "Yaoundé": [
        "Bastos", "Ngousso", "Mvan", "Mendong", "Essos", "Biyem-Assi",
        "Odza", "Etoudi", "Elig-Essono", "Nsam", "Emana", "Messassi"
    ],
    "Kribi": [
        "Cité des Palmiers", "Mboamanga", "Lendi", "Ngaliema", "Kpali", "Ebome"
    ],
    "Bafoussam": [
        "Tamda", "Djeleng", "Banego", "Houkaha", "Koptchou"
    ],
    "Limbé": ["Down Beach", "Bota", "Mile 4", "Ngeme"],
    "Buea": ["Molyko", "Muea", "Check Point", "Bonduma"],
    "Bamenda": ["Commercial Avenue", "Nkwen", "Mankon"],
    "Garoua": ["Djamboutou", "Roumdé Adjia", "Lopéré"],
    "Maroua": ["Dugoy", "Kakataré", "Hardé"],
    "Bertoua": ["Enia", "Tigaza", "Kpokolota"]
};

export const TYPES_LOGEMENT = [
    "Studio",
    "Appartement",
    "Chambre",
    "Maison",
    "Villa",
    "Duplex",
    "Local commercial"
];

export const BUDGET_RANGES = [
    { value: "0-50000", label: "Moins de 50 000 FCFA" },
    { value: "50000-100000", label: "50 000 - 100 000 FCFA" },
    { value: "100000-200000", label: "100 000 - 200 000 FCFA" },
    { value: "200000-500000", label: "200 000 - 500 000 FCFA" },
    { value: "500000+", label: "Plus de 500 000 FCFA" },
];

export const GAS_BRANDS = [
    "SCTM",
    "TotalEnergies",
    "Tradex",
    "Afrigaz",
    "Camgaz",
    "Ola Energy",
    "Perenco",
    "Gulfin",
    "Green Oil",
    "Mrs",
    "Glocal Gaz"
];

export const GAS_SIZES = [
    { id: "6kg", label: "6 kg (Petite)", usage: "Camping / Petit ménage" },
    { id: "12.5kg", label: "12,5 kg (Standard)", usage: "Cuisine familiale" },
    { id: "35kg", label: "35 kg (Grand)", usage: "Semi-industriel" },
    { id: "50kg", label: "50 kg (Pro)", usage: "Hôtels / Restaurants" }
];

export const PARCEL_TYPES = [
    { id: "documents", label: "Documents / Papiers" },
    { id: "petit", label: "Petit colis (< 5kg)" },
    { id: "moyen", label: "Colis moyen (5-20kg)" },
    { id: "gros", label: "Gros colis (> 20kg)" },
    { id: "fragile", label: "Colis fragile" },
    { id: "alimentaire", label: "Produits alimentaires" }
];

export const INT_DESTINATIONS = [
    "France", "Belgique", "Allemagne", "Suisse", "Canada",
    "États-Unis", "Royaume-Uni", "Côte d'Ivoire", "Sénégal", "Gabon"
];

export const LAUNDRY_TYPES = [
    "Vêtements divers",
    "Chemises & Costumes",
    "Draps & Serviettes",
    "Rideaux & Tapis",
    "Autre"
];

export const NETTOYAGE_PRO_SERVICES = [
    { id: "domicile", label: "Nettoyage de domicile" },
    { id: "bureau", label: "Nettoyage de bureaux" },
    { id: "canapes", label: "Canapés & Chaises" },
    { id: "tapis", label: "Tapis & Moquettes" },
    { id: "matelas", label: "Matelas" },
    { id: "vehicule", label: "Nettoyage véhicule" },
    { id: "espaces_ouverts", label: "Espaces ouverts" },
    { id: "evenement", label: "Événementiel" }
];

export const SANITATION_SERVICES = [
    { id: "deratisation", label: "Dératisation (Rats/Souris)" },
    { id: "desinsectisation", label: "Désinsectisation (Insectes)" },
    { id: "fumigation", label: "Fumigation" },
    { id: "desinfection", label: "Désinfection (Virus/Bactéries)" },
    { id: "traitement_bois", label: "Traitement du bois" }
];

export const WASTE_TYPES = [
    { id: "menage", label: "Ménage / Résidence" },
    { id: "bureau", label: "Bureau / Agence" },
    { id: "commerce", label: "Commerce / Restaurant" },
    { id: "evenement", label: "Événementiel" },
    { id: "autre", label: "Autre" }
];

export const WASTE_FREQUENCIES = [
    { id: "hebdo", label: "Hebdomadaire (1x/sem)" },
    { id: "myenne", label: "Régulier (2-3x/sem)" },
    { id: "quotidien", label: "Quotidien" },
    { id: "ponctuel", label: "Ponctuel (Une fois)" }
];

export const HOUSING_TYPES = ["Villa", "Appartement", "Studio", "Duplex", "Maison", "Autre"];
export const CAR_TYPES = ["Berline", "4x4", "SUV", "Pick-up", "Bus", "Camion", "Moto"];
export const FURNITURE_MATERIALS = ["Tissu", "Cuir", "Velours", "Daim", "Autre"];
export const MATTRESS_SIZES = ["1 Place (90x190)", "2 Places (140x190)", "Queen Size (160x200)", "King Size (180x200)", "Berceau"];
export const INTERVENTION_LOCATIONS = ["Habitation", "Bureau", "Restaurant", "Hôtel", "École", "Hôpital", "Commerce", "Espace ouvert", "Entrepôt"];
export const EVENT_SPACES = ["Espace fermé (Salle)", "Espace ouvert (Jardin, Stade...)", "Mixte"];
