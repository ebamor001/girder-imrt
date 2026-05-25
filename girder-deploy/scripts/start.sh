#!/bin/bash
# =============================================================================
# START — Lance les conteneurs girder en dev ou prod
#
# Usage :
#   ./scripts/start.sh <env> <cible> [options]
#
#   env    : dev | prod
#   cible  : en-avant | en-arriere | all
#   options:
#     --stop     : arrête les conteneurs au lieu de les démarrer
#     --restart  : arrête puis redémarre
#     --logs     : affiche les logs après démarrage (bloquant)
#     --build    : force le rebuild des images avant de démarrer
#
# Exemples :
#   ./scripts/start.sh dev en-avant
#   ./scripts/start.sh dev all --build
#   ./scripts/start.sh prod en-arriere
#   ./scripts/start.sh dev en-avant --stop
#   ./scripts/start.sh dev all --restart
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[start]${NC} $1"; }
err()  { echo -e "${RED}[start]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[start]${NC} $1"; }

# ── Aide ─────────────────────────────────────────────────────────────────────
usage() {
    echo "Usage : $0 <env> <cible> [options]"
    echo ""
    echo "  env    : dev | prod"
    echo "  cible  : en-avant | en-arriere | all"
    echo ""
    echo "  --stop     arrête les conteneurs"
    echo "  --restart  arrête puis redémarre"
    echo "  --logs     suit les logs après démarrage"
    echo "  --build    rebuild les images avant démarrage"
    exit 1
}

# ── Arguments ─────────────────────────────────────────────────────────────────
[ $# -lt 2 ] && usage

ENV=$1
TARGET=$2
shift 2

DO_STOP=0
DO_RESTART=0
DO_LOGS=0
DO_BUILD=0

for arg in "$@"; do
    case $arg in
        --stop)    DO_STOP=1 ;;
        --restart) DO_RESTART=1 ;;
        --logs)    DO_LOGS=1 ;;
        --build)   DO_BUILD=1 ;;
        *) err "Option inconnue : $arg" ;;
    esac
done

# ── Validation ────────────────────────────────────────────────────────────────
[[ "$ENV" != "dev" && "$ENV" != "prod" ]] && \
    err "env doit être 'dev' ou 'prod' (reçu : '$ENV')"

[[ "$TARGET" != "en-avant" && "$TARGET" != "en-arriere" && "$TARGET" != "all" ]] && \
    err "cible doit être 'en-avant', 'en-arriere' ou 'all' (reçu : '$TARGET')"

# ── Fichiers compose et env ───────────────────────────────────────────────────
ENV_FILE="$ROOT_DIR/.env.$ENV"
[ ! -f "$ENV_FILE" ] && err "Fichier d'environnement introuvable : $ENV_FILE"

COMPOSE_FILES="-f $ROOT_DIR/docker-compose.yml -f $ROOT_DIR/docker-compose.$ENV.yml"
COMPOSE_CMD="docker compose --env-file $ENV_FILE $COMPOSE_FILES"

log "Environnement : $ENV | Cible : $TARGET"

# ── Stop ──────────────────────────────────────────────────────────────────────
stop_containers() {
    log "Arrêt des conteneurs (profil : $TARGET)..."
    $COMPOSE_CMD --profile "$TARGET" down
    log "Conteneurs arrêtés."
}

# ── Start ─────────────────────────────────────────────────────────────────────
start_containers() {
    if [ "$DO_BUILD" = "1" ]; then
        log "Rebuild des images (profil : $TARGET)..."
        $COMPOSE_CMD --profile "$TARGET" build
    fi

    log "Démarrage des conteneurs (profil : $TARGET)..."
    $COMPOSE_CMD --profile "$TARGET" up -d

    log "Conteneurs démarrés :"
    $COMPOSE_CMD --profile "$TARGET" ps
}

# ── Exécution ─────────────────────────────────────────────────────────────────
if [ "$DO_STOP" = "1" ]; then
    stop_containers

elif [ "$DO_RESTART" = "1" ]; then
    stop_containers
    start_containers

else
    start_containers
fi

# ── Logs (optionnel, bloquant) ────────────────────────────────────────────────
if [ "$DO_LOGS" = "1" ] && [ "$DO_STOP" = "0" ]; then
    log "Suivi des logs (Ctrl+C pour quitter)..."
    $COMPOSE_CMD --profile "$TARGET" logs -f
fi
