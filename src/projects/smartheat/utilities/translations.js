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
        'Browse shared project collections.': 'Parcourir les collections partagées du projet.',
        'Access your files and datasets.': 'Accéder à vos fichiers et jeux de données.',
        'Collaborate with research teams.': 'Collaborer avec les équipes de recherche.',
        'Launch interactive visualization tools.': 'Lancer les outils de visualisation interactive.',
        'Project overview': 'Présentation du projet',
        'Key competencies': 'Compétences clés',
        'Consortium & partners': 'Consortium & partenaires',
        'Research workpackages': 'Axes de travail',
        'About the platform': 'À propos de la plateforme'
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
        'Browse shared project collections.': 'Freigegebene Projektsammlungen durchsuchen.',
        'Access your files and datasets.': 'Auf Ihre Dateien und Datensätze zugreifen.',
        'Collaborate with research teams.': 'Mit Forschungsteams zusammenarbeiten.',
        'Launch interactive visualization tools.': 'Interaktive Visualisierungswerkzeuge starten.',
        'Project overview': 'Projektübersicht',
        'Key competencies': 'Kernkompetenzen',
        'Consortium & partners': 'Konsortium & Partner',
        'Research workpackages': 'Arbeitspakete',
        'About the platform': 'Über die Plattform'
    }
};

let currentLanguage = window.localStorage.getItem('girderLanguage') || 'french';

export function translate(key) {
    if (currentLanguage !== 'english' && translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    return key;
}

export function setLanguage(language) {
    if (language === 'english' || language === 'french' || language === 'german') {
        currentLanguage = language;
        window.localStorage.setItem('girderLanguage', language);
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

export default { translate, setLanguage, getCurrentLanguage, getTranslations, setTranslation };
