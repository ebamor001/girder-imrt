#!/bin/bash
# =============================================================================
# BUILD GIRDER-EN-AVANT
# Usage : ./scripts/build-en-avant.sh [dev|prod]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOY_DIR="$ROOT_DIR/girder-deploy"

ENV=${1:-dev}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[build-en-avant]${NC} $1"; }
warn() { echo -e "${YELLOW}[build-en-avant]${NC} $1"; }

log "Environnement cible : $ENV"

# ── Étape 1 : build de l'image de base (si pas déjà faite) ───────────────────
log "Build de l'image de base girder-base:latest..."
docker build \
    -t girder-base:latest \
    -f "$DEPLOY_DIR/Dockerfile.base" \
    "$ROOT_DIR"

# ── Étape 2 : build de girder-en-avant ───────────────────────────────────────
if [ "$ENV" = "prod" ]; then
    warn "Mode PROD — le code source doit être disponible dans src/"
    warn "  src/girder/        → clone de girder/girder"
    warn "  src/plugins_front/ → vos plugins front"

    # Vérification que les sources sont présentes
    if [ ! -d "$ROOT_DIR/src/girder" ]; then
        echo "ERREUR : src/girder/ introuvable. Préparez les sources avant le build prod."
        echo "Voir scripts/prepare-prod-sources.sh"
        exit 1
    fi

    log "Build de girder-en-avant:prod..."
    docker build \
        --target prod \
        --build-arg BASE_IMAGE=girder-base:latest \
        --build-arg PROJECT_TEMPLATE=${PROJECT_TEMPLATE:-thermolyse} \
        -t girder-en-avant:prod \
        -f "$DEPLOY_DIR/girder-en-avant/Dockerfile" \
        "$ROOT_DIR"
    

    log "Image girder-en-avant:prod construite avec succès."

else
    log "Build de girder-en-avant:dev..."
    docker build \
        --target dev \
        --build-arg BASE_IMAGE=girder-base:latest \
        -t girder-en-avant:dev \
        -f "$DEPLOY_DIR/girder-en-avant/Dockerfile" \
        "$ROOT_DIR"

    log "Image girder-en-avant:dev construite avec succès."
fi
