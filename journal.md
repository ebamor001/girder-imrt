# Journal de stage

## 18 mai 2026

### Sujet principal
Découverte de l’architecture Girder et prise en main de l’environnement de développement.

### Travail réalisé
- Installation et configuration de Girder en local
- Compréhension du rôle de MongoDB et de l’assetstore
- Lancement du serveur Girder et connexion à l’interface web
- Découverte de l’API REST (`/api/v1`)
- Utilisation du client Python `girder-client`
- Authentification via API key
- Création de collections et dossiers via Python
- Upload et téléchargement de fichiers
- Tests Bash avec `curl` et `girder-client`
- Compréhension de la hiérarchie : Collection - Folder - Item - File
- Introduction aux modèles backend (`girder.models.*`)
- Découverte du système de plugins Girder
- Lecture et compréhension du fonctionnement frontend de Girder (SPA, routes.js, Views Backbone)
---

## 19 mai 2026

### Événement
Participation à la journée :

**« Déploiement logiciel reproductible avec Guix »**

Lieu :
- Amphi Leyteire, bâtiment Ede l'Uniersité de bordeaux 

### Thématiques abordées
- Reproductibilité logicielle et scientifique
- Gestion des dépendances avec Guix
- Déploiement reproductible de logiciels scientifiques
- Conteneurisation et variabilité matérielle
- Packaging logiciel

### Sessions suivies
- Tutoriel autour de Guix

# 20 mai 2026

### Compréhension et personnalisation du frontend Girder

* Étude de l’architecture frontend de Girder :

  * Views JavaScript
  * Templates `.pug`
  * Styles `.styl`
---

### Mise en place du système de traduction FR/EN

* Création d’un système simple de gestion de langue côté frontend.

* Ajout des fonctions :

  * `translate()`
  * `setLanguage()`
  * `getCurrentLanguage()`

* Mise en place du changement dynamique de langue via :

  * événements JavaScript
  * re-render automatique des vues

---

### Personnalisation de la landing page ThermoMRI

* Modification des textes de présentation du projet :

  * radiologie interventionnelle
  * IRM
  * thermoablation
  * visualisation et simulation médicale

---

## 21 mai 2026

Aujourd’hui, j’ai migré le travail de personnalisation depuis le fork `girder-mds` vers une version plus récente de Girder officiel. J’ai identifié une différence importante d’architecture : l’ancien projet utilisait `girder/web_client` avec Grunt/Webpack, tandis que la version récente utilise `girder/web` avec Vite.

J’ai mis en place l’environnement de développement avec deux services :
- backend Girder sur `localhost:8080`
- frontend Vite sur `localhost:5173`

J’ai analysé le problème CORS entre le frontend et l’API Girder, puis configuré le frontend pour passer par `/api/v1` avec un proxy Vite.

## Personnalisation frontend

J’ai ajouté une page de sélection de projet permettant de choisir entre :
- Thermolyse
- SmartIT
- OPLA
