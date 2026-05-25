#!/bin/bash
# =============================================================================
# BUILD ALL — Construit les deux images
# Usage : ./scripts/build-all.sh [dev|prod]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV=${1:-dev}

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[build-all]${NC} $1"; }

log "Build complet en mode : $ENV"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

"$SCRIPT_DIR/build-en-avant.sh" "$ENV"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"$SCRIPT_DIR/build-en-arriere.sh" "$ENV"

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "Toutes les images construites avec succès."
docker images | grep -E "girder-(base|en-avant|en-arriere)"
