IMRT Plugin
===========

Plugin Girder backend pour la plateforme IMRT.

Rôle
----

Ce plugin expose les routes REST utilisées pour créer et suivre des jobs IMRT.

Fonctionnalités
---------------

- Création de jobs Girder via ``girder-jobs``.
- Lancement de tâches Celery / Girder Worker.
- Suivi de la progression des jobs.
- Ajout de métadonnées IMRT dans les jobs.
- Option de notification email via ``meta.imrt.notifyEmail``.

Routes REST
-----------

Lancer un job de test sans mail ::

    POST /api/v1/imrt_plugin/progress_test?n=10

Lancer un job de test avec notification email ::

    POST /api/v1/imrt_plugin/progress_test?n=10&notifyEmail=true&to=user@example.com

Récupérer l'état d'un job ::

    GET /api/v1/imrt_plugin/job/<jobId>

Lister les jobs IMRT ::

    GET /api/v1/imrt_plugin/jobs

Métadonnées IMRT
----------------

Les jobs IMRT contiennent une section ``meta.imrt`` :

::

    {
      "enabled": true,
      "notifyEmail": false,
      "datasetName": "progress_test",
      "processedFile": "progress_test",
      "userFullName": "User Name",
      "userEmail": "user@example.com"
    }

Ces métadonnées sont utilisées par le plugin downstream pour décider quelles actions effectuer après la fin du job.

Installation
------------

Depuis la racine du projet ::

    pip install -e src/plugins_front/imrt_plugin