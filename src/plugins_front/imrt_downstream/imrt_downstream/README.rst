# IMRT Downstream

Plugin Girder chargé d’exécuter des actions secondaires après la mise à jour des jobs IMRT.

## Rôle du plugin

Le plugin `imrt_downstream` ne réalise pas le traitement principal.

Le traitement principal est exécuté par le worker, par exemple :

- lancement d’un job ;
- exécution d’une tâche Celery / Girder Worker ;
- mise à jour de la progression ;
- passage du job en `SUCCESS`, `ERROR` ou `CANCELED`.

Le rôle du downstream est d’écouter les changements d’état des jobs et de déclencher des actions après ces changements.

Exemples d’actions downstream :

- journaliser les changements de statut ;
- envoyer un email lorsque le job est terminé ;
- gérer les erreurs ;
- préparer de futures actions de post-traitement.

## Fonctionnement général

Le plugin écoute l’événement Girder suivant :

```python
jobs.job.update.after
```

À chaque mise à jour d’un job, le downstream vérifie si le job concerne IMRT.

Un job est traité par le downstream uniquement si ses métadonnées contiennent :

```python
job["meta"]["imrt"]["enabled"] == True
```

L’envoi d’un email est déclenché uniquement si :

```python
job["meta"]["imrt"]["notifyEmail"] == True
```

## Métadonnées attendues

Les jobs IMRT doivent contenir une section `meta.imrt`.

Exemple :

```json
{
  "meta": {
    "imrt": {
      "enabled": true,
      "notifyEmail": true,
      "datasetName": "progress_test",
      "processedFile": "progress_test",
      "userFullName": "User Name",
      "userEmail": "user@example.com"
    }
  }
}
```

Signification des champs :

- `enabled` : indique que le job doit être traité par le downstream IMRT ;
- `notifyEmail` : indique si un email doit être envoyé à la fin du job ;
- `datasetName` : nom du jeu de données ou du traitement ;
- `processedFile` : fichier ou donnée traitée ;
- `userFullName` : nom complet de l’utilisateur ;
- `userEmail` : adresse email de notification.

## Statuts finaux

Le downstream réagit principalement aux statuts finaux suivants :

```python
JobStatus.SUCCESS
JobStatus.ERROR
JobStatus.CANCELED
```

## Templates email

Les templates email sont stockés dans :

```txt
imrt_downstream/templates/
```

Templates attendus :

```txt
success_template.txt
error_template.txt
canceled_template.txt
```

## Configuration SMTP

Le plugin peut envoyer des emails via la configuration SMTP de Girder.

La configuration locale est lue depuis :

```txt
imrt_downstream/settings.json
```

Exemple de fichier :

```json
{
  "SMTP_ENCRYPTION": "starttls",
  "SMTP_HOST": "smtp.gmail.com",
  "SMTP_PORT": 587,
  "SMTP_USERNAME": "example@gmail.com",
  "SMTP_PASSWORD": "app-password"
}
```

## Installation

Depuis la racine du projet :

```bash
pip install -e src/plugins_front/imrt_downstream
```


## Lancement de Girder

Depuis le dossier Girder :

```bash
cd src/girder
source .venv/bin/activate
girder serve
```

```

## Test du downstream avec email

Un job IMRT doit être créé avec :

```json
{
  "enabled": true,
  "notifyEmail": true
}
```

Exemple de test via l’API du plugin IMRT :

```bash
curl -X POST "http://localhost:8080/api/v1/imrt_plugin/progress_test?n=10&notifyEmail=true&to=user@example.com" \
  -H "Girder-Token: <TOKEN>" \
  -H "Content-Length: 0"
```

Résultat attendu dans les logs :

```txt
IMRT downstream: job=<job_id> title=<title> status=SUCCESS ...
Mail sent to user@example.com for job <job_id>
```

## Sécurité

Ne jamais versionner :

- `settings.json`
- mots de passe SMTP
- tokens Girder
- fichiers `.env`

À versionner uniquement :


## Remarque

Le downstream doit toujours être protégé par des `try/except`.

Une erreur dans une action secondaire, par exemple l’envoi d’un mail, ne doit jamais faire échouer le job principal.