## Choix du projet frontend

Le frontend Girder peut être personnalisé pour plusieurs projets :

- Thermolyse
- Smart IT
- OPLA

Le projet utilisé est choisi avec la variable d’environnement :

```bash
PROJECT_TEMPLATE
```

Exemple :

```bash
PROJECT_TEMPLATE=thermolyse
```

Application du template :

```bash
PROJECT_TEMPLATE=thermolyse ./girder-deploy/scripts/apply-template.sh
```

Puis lancement du frontend :

```bash
cd src/girder/girder/web
npm run dev
```

Autres valeurs possibles :

```bash
PROJECT_TEMPLATE=smart_it
PROJECT_TEMPLATE=opla
```

Les fichiers de personnalisation sont stockés dans :

```bash
src/projects/
├── thermolyse
├── smart_it
└── opla
```

Chaque projet contient :
- `views/` : composants frontend personnalisés (`frontPageView.js`)
- `stylesheets/` : styles CSS/Stylus du projet (`frontPage.styl`, `header.styl`, `globalNav.styl`)
- `utilities/` : fichiers utilitaires frontend, notamment les traductions (`translations.js`)
- `public/` : ressources statiques du projet (logos, images, icônes, favicons, etc.)

Le script `apply-template.sh` copie automatiquement les fichiers du projet sélectionné dans le frontend Girder avant le build.
