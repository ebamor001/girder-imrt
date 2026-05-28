// Retourne l'URL de base de l'API.
// Si la variable d'environnement VITE_API_ROOT existe, on l'utilise.
// Sinon, par défaut, on utilise '/api/v1'.
function apiRoot() {
    return import.meta.env.VITE_API_ROOT || '/api/v1';
}

// Fonction générique pour faire une requête HTTP vers l'API IMRT.
async function request(path, options = {}) {
    // Envoie une requête vers l'URL complète :
    // apiRoot() + path
    const response = await fetch(`${apiRoot()}${path}`, {
        // Permet d'envoyer les cookies avec la requête.
        credentials: 'include',

        // Headers envoyés avec la requête.
        headers: {
            'Content-Type': 'application/json',

            // On ajoute aussi les headers personnalisés passés dans options,
            // s'il y en a.
            ...(options.headers || {}),
        },

        // On ajoute toutes les autres options passées à la fonction :
        // method, body, headers, etc.
        ...options,
    });

    if (!response.ok) {
        throw new Error(`IMRT API error ${response.status}: ${response.statusText}`);
    }

    // Si tout va bien, on convertit la réponse JSON en objet JavaScript.
    return response.json();
}

// Récupère le statut du module IMRT.
export function getImrtStatus() {
    return request('/imrt/status');
}

// Récupère la liste des projets IMRT.
export function getImrtProjects() {
    return request('/imrt/projects');
}

// Récupère les infos d'un projet IMRT spécifique.
export function getImrtProject(project) {
    return request(`/imrt/project?project=${encodeURIComponent(project)}`);
}

// Récupère la liste des outils IMRT disponibles.
export function getImrtTools() {
    return request('/imrt/tools');
}