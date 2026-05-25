#!/usr/bin/env python3
"""
init_girder.py
Initialisation de Girder — exécution sélective des étapes.

Usage :
  docker exec girder-en-avant python3 /opt/girder/init_girder.py [options]

Options :
  --all          Exécute toutes les étapes (défaut si aucune option)
  --admin        Crée le compte admin
  --assetstore   Crée l'assetstore filesystem
  --worker       Configure le broker RabbitMQ et l'API URL du worker

Exemples :
  python3 init_girder.py --all
  python3 init_girder.py --admin
  python3 init_girder.py --assetstore --worker
  python3 init_girder.py --worker
"""

import argparse
import os
import sys
import time

import requests

# ── Paramètres ────────────────────────────────────────────────────────────────
GIRDER_URL   = os.environ.get("GIRDER_URL", "http://localhost:8080")
ADMIN_LOGIN  = os.environ.get("GIRDER_ADMIN_LOGIN", "admin")
ADMIN_PASS   = os.environ.get("GIRDER_ADMIN_PASSWORD", "CHANGER_MOI")
ADMIN_EMAIL  = os.environ.get("GIRDER_ADMIN_EMAIL", "admin@localhost")
ADMIN_FIRST  = os.environ.get("GIRDER_ADMIN_FIRSTNAME", "Admin")
ADMIN_LAST   = os.environ.get("GIRDER_ADMIN_LASTNAME", "Girder")

ASSETSTORE_NAME = os.environ.get("GIRDER_ASSETSTORE_NAME", "local")
ASSETSTORE_PATH = os.environ.get("GIRDER_ASSETSTORE_PATH", "/opt/girder/data/assetstore")

RABBITMQ_USER = os.environ.get("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.environ.get("RABBITMQ_PASS", "guest")
RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "host.docker.internal")
RABBITMQ_PORT = os.environ.get("RABBITMQ_PORT", "5672")

BROKER_URL = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}:{RABBITMQ_PORT}/"
API_URL    = GIRDER_URL + "/api/v1"

GREEN  = "\033[0;32m"
RED    = "\033[0;31m"
YELLOW = "\033[1;33m"
BLUE   = "\033[0;34m"
NC     = "\033[0m"

def ok(msg):      print(f"{GREEN}  ✓{NC} {msg}")
def fail(msg):    print(f"{RED}  ✗{NC} {msg}"); sys.exit(1)
def info(msg):    print(f"{YELLOW}  →{NC} {msg}")
def section(msg): print(f"\n{BLUE}── {msg}{NC}")
def skip(msg):    print(f"  ○ {msg} (ignoré)")


# ── Étapes ────────────────────────────────────────────────────────────────────

def wait_for_girder(retries=30, wait=2):
    section("Attente de Girder")
    info(f"URL : {GIRDER_URL}")
    for i in range(retries):
        try:
            r = requests.get(f"{API_URL}/system/version", timeout=3)
            if r.status_code == 200:
                ok(f"Girder prêt (version {r.json().get('release', '?')})")
                return
        except requests.exceptions.ConnectionError:
            pass
        print(f"  Tentative {i+1}/{retries}...")
        time.sleep(wait)
    fail("Girder non disponible.")


def create_admin(session):
    section("Compte admin")
    info(f"Login : {ADMIN_LOGIN}")

    r = session.get(f"{API_URL}/user", params={"limit": 1})
    if r.status_code == 200 and len(r.json()) > 0:
        ok("Utilisateur existant — création ignorée.")
        return

    r = session.post(f"{API_URL}/user", params={
        "login":     ADMIN_LOGIN,
        "password":  ADMIN_PASS,
        "email":     ADMIN_EMAIL,
        "firstName": ADMIN_FIRST,
        "lastName":  ADMIN_LAST,
        "admin":     True,
    })

    if r.status_code == 200:
        ok(f"Compte '{ADMIN_LOGIN}' créé.")
    elif "already exists" in r.text:
        ok(f"Compte '{ADMIN_LOGIN}' existe déjà.")
    else:
        fail(f"Erreur création admin : {r.status_code} {r.text}")


def authenticate(session):
    section("Authentification")
    r = session.get(f"{API_URL}/user/authentication", auth=(ADMIN_LOGIN, ADMIN_PASS))
    if r.status_code != 200:
        fail(f"Authentification échouée : {r.status_code} {r.text}")
    token = r.json()["authToken"]["token"]
    session.headers.update({"Girder-Token": token})
    ok(f"Authentifié en tant que '{ADMIN_LOGIN}'.")


def create_assetstore(session):
    section("Assetstore")
    info(f"Nom : {ASSETSTORE_NAME} | Chemin : {ASSETSTORE_PATH}")

    r = session.get(f"{API_URL}/assetstore")
    if r.status_code == 200:
        existing = [a for a in r.json() if a["name"] == ASSETSTORE_NAME]
        if existing:
            ok(f"Assetstore '{ASSETSTORE_NAME}' existe déjà.")
            return

    os.makedirs(ASSETSTORE_PATH, exist_ok=True)

    r = session.post(f"{API_URL}/assetstore", params={
        "type": 0,
        "name": ASSETSTORE_NAME,
        "root": ASSETSTORE_PATH,
    })

    if r.status_code == 200:
        ok(f"Assetstore '{ASSETSTORE_NAME}' créé.")
    else:
        fail(f"Erreur création assetstore : {r.status_code} {r.text}")


def configure_worker(session):
    section("Configuration Worker")
    info(f"Broker : {BROKER_URL}")
    info(f"API    : {API_URL}")

    r = session.get(f"{API_URL}/system/setting", params={
        "list": '["worker.broker","worker.api_url"]'
    })
    current = r.json() if r.status_code == 200 else {}

    for key, value in [("worker.broker", BROKER_URL), ("worker.api_url", API_URL)]:
        if current.get(key) == value:
            ok(f"{key} déjà configuré.")
        else:
            r = session.put(f"{API_URL}/system/setting", params={
                "key": key, "value": value,
            })
            if r.status_code == 200:
                ok(f"{key} = {value}")
            else:
                fail(f"Erreur configuration {key} : {r.status_code} {r.text}")


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description="Initialisation sélective de Girder.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples :
  python3 init_girder.py --all
  python3 init_girder.py --admin
  python3 init_girder.py --assetstore --worker
  python3 init_girder.py --worker
        """
    )
    parser.add_argument("--all",        action="store_true", help="Toutes les étapes")
    parser.add_argument("--admin",      action="store_true", help="Créer le compte admin")
    parser.add_argument("--assetstore", action="store_true", help="Créer l'assetstore")
    parser.add_argument("--worker",     action="store_true", help="Configurer le worker")

    args = parser.parse_args()

    # Si aucune option → --all par défaut
    if not any([args.all, args.admin, args.assetstore, args.worker]):
        args.all = True

    return args


if __name__ == "__main__":
    args = parse_args()

    do_admin      = args.all or args.admin
    do_assetstore = args.all or args.assetstore
    do_worker     = args.all or args.worker

    print(f"\n{GREEN}=== Initialisation Girder ==={NC}")
    print(f"  URL        : {GIRDER_URL}")
    print(f"  Admin      : {'oui' if do_admin else 'non'}")
    print(f"  Assetstore : {'oui' if do_assetstore else 'non'}")
    print(f"  Worker     : {'oui' if do_worker else 'non'}")

    session = requests.Session()

    wait_for_girder()

    if do_admin:
        create_admin(session)
    else:
        skip("Création admin")

    authenticate(session)

    if do_assetstore:
        create_assetstore(session)
    else:
        skip("Création assetstore")

    if do_worker:
        configure_worker(session)
    else:
        skip("Configuration worker")

    print(f"\n{GREEN}=== Terminé ==={NC}\n")
