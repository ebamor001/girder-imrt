#!/bin/bash
# =============================================================================
# BUILD GIRDER-en-arriere
# Usage : ./scripts/build-en-arriere.sh [dev|prod]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOY_DIR="$ROOT_DIR/girder-deploy"

ENV=${1:-dev}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[build-en-arriere]${NC} $1"; }
warn() { echo -e "${YELLOW}[build-en-arriere]${NC} $1"; }

log "Environnement cible : $ENV"

# ── Étape 1 : build de l'image de base ───────────────────────────────────────
log "Build de l'image de base girder-base:latest..."
docker build \
    -t girder-base:latest \
    -f "$ROOT_DIR/Dockerfile.base" \
    "$ROOT_DIR"

# ── Étape 2 : build de girder-en-arriere ────────────────────────────────────────
if [ "$ENV" = "prod" ]; then
    warn "Mode PROD — le code source doit être disponible dans src/"
    warn "  src/girder-worker/     → clone de girder/girder-worker"
    warn "  src/plugins_worker/    → vos plugins worker"

    if [ ! -d "$ROOT_DIR/src/girder-worker" ]; then
        echo "ERREUR : src/girder-worker/ introuvable. Préparez les sources avant le build prod."
        echo "Voir scripts/prepare-prod-sources.sh"
        exit 1
    fi

    log "Build de girder-en-arriere:prod..."
    docker build \
        --target prod \
        --build-arg BASE_IMAGE=girder-base:latest \
        -t girder-en-arriere:prod \
        -f "$ROOT_DIR/girder-en-arriere/Dockerfile" \
        "$ROOT_DIR"

    log "Image girder-en-arriere:prod construite avec succès."

else
    log "Build de girder-en-arriere:dev..."
    docker build \
        --target dev \
        --build-arg BASE_IMAGE=girder-base:latest \
        -t girder-en-arriere:dev \
        -f "$ROOT_DIR/girder-en-arriere/Dockerfile" \
        "$ROOT_DIR"

    log "Image girder-en-arriere:dev construite avec succès."
fi
