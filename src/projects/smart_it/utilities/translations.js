const translations = {
    french: {
        'Login': 'Connexion',
        'Sign up': 'Créer un compte',
        'Access the platform': 'Accéder à la plateforme',
        'Learn More': 'En savoir plus',
        'Welcome to': 'Bienvenue sur',
        'Hello': 'Bonjour',
        'My data': 'Mes données',
        'Collections': 'Collections',
        'Groups': 'Groupes',
        'Medical data': 'Données médicales',
        'Secure management of research datasets and imaging files.': 'Gestion sécurisée des jeux de données de recherche et des fichiers d’imagerie.',
        'Dedicated tools for processing, visualization and scientific workflows.': 'Outils dédiés au traitement, à la visualisation et aux workflows scientifiques.',
        'Interactive access to collections, results and collaborative resources.': 'Accès interactif aux collections, résultats et ressources collaboratives.',
        'Access your files and datasets.': 'Accéder à vos fichiers et jeux de données.',
        'Browse shared project collections.': 'Parcourir les collections partagées du projet.',
        'Collaborate with research teams.': 'Collaborer avec les équipes de recherche.',
        'Launch interactive visualization tools.': 'Lancer les outils de visualisation interactive.',
        'Thermolyse': 'Thermolyse',
        'Smart IT': 'Smart IT',
        'OPLA': 'OPLA'
    },
    german: {
        'Login': 'Anmelden',
        'Sign up': 'Konto erstellen',
        'Access the platform': 'Zur Plattform',
        'Learn More': 'Mehr erfahren',
        'Welcome to': 'Willkommen bei',
        'Hello': 'Hallo',
        'My data': 'Meine Daten',
        'Collections': 'Sammlungen',
        'Groups': 'Gruppen',
        'Medical data': 'Medizinische Daten',
        'Thermolyse': 'Thermolyse',
        'Smart IT': 'Smart IT',
        'OPLA': 'OPLA'
    }
};

let currentLanguage = 'french';

export function translate(key) {
    if (currentLanguage !== 'english' && translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    return key;
}

export function setLanguage(language) {
    if (language === 'english' || language === 'french' || language === 'german') {
        currentLanguage = language;
        window.dispatchEvent(new Event('languageChanged'));
    }
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function getTranslations() {
    if (currentLanguage !== 'english' && translations[currentLanguage]) {
        return translations[currentLanguage];
    }
    return {};
}

export function setTranslation(key, value, language = currentLanguage) {
    if (!translations[language]) {
        translations[language] = {};
    }
    translations[language][key] = value;
}

export default {
    translate,
    setLanguage,
    getCurrentLanguage,
    getTranslations,
    setTranslation
};
