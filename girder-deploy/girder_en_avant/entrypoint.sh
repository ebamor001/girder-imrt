#!/bin/bash
# =============================================================================
# ENTRYPOINT GIRDER-EN-AVANT
# Comportement adapté selon GIRDER_ENV (dev | prod)
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[girder-en-avant]${NC} $1"; }
warn() { echo -e "${YELLOW}[girder-en-avant]${NC} $1"; }
err()  { echo -e "${RED}[girder-en-avant]${NC} $1"; }

# ── Variables avec valeurs par défaut ─────────────────────────────────────────
GIRDER_ENV=${GIRDER_ENV:-prod}
GIRDER_HOST=${GIRDER_HOST:-0.0.0.0}
GIRDER_PORT=${GIRDER_PORT:-8080}
DEBUGPY_PORT=${DEBUGPY_PORT:-5678}
DEBUGPY_WAIT=${DEBUGPY_WAIT:-0}

# URI MongoDB
GIRDER_MONGO_HOST=${GIRDER_MONGO_HOST:-mongodb}
GIRDER_MONGO_PORT=${GIRDER_MONGO_PORT:-27017}
GIRDER_MONGO_DB=${GIRDER_MONGO_DB:-girder}
GIRDER_DATABASE_URI=${GIRDER_DATABASE_URI:-mongodb://${GIRDER_MONGO_HOST}:${GIRDER_MONGO_PORT}/${GIRDER_MONGO_DB}}

SRC_GIRDER=${SRC_GIRDER:-/opt/girder/src/girder}
SRC_PLUGINS_FRONT=${SRC_PLUGINS_FRONT:-/opt/girder/src/plugins_front}

# ── PATH : inclure les scripts installés par pip en user non-root ─────────────
export PATH="/home/girder/.local/bin:$PATH"

# ── Installation en mode dev (volumes montés) ─────────────────────────────────
install_dev() {
    log "Mode DEV — installation des packages en mode éditable..."

    if [ -d "$SRC_GIRDER" ]; then
        log "  pip install -e $SRC_GIRDER"
        pip install -e "$SRC_GIRDER" --quiet
    else
        err "Code source Girder introuvable : $SRC_GIRDER"
        err "Vérifiez que le volume est bien monté dans docker-compose.dev.yml"
        exit 1
    fi

    if [ "${INSTALL_PLUGINS_FRONT:-1}" = "1" ]; then
        if [ -d "$SRC_PLUGINS_FRONT" ]; then
            FOUND=0
            for plugin_dir in "$SRC_PLUGINS_FRONT"/*/; do
                if [ -f "${plugin_dir}pyproject.toml" ] || [ -f "${plugin_dir}setup.py" ]; then
                    log "  pip install -e ${plugin_dir}"
                    pip install -e "${plugin_dir}" 
                    FOUND=1
                fi
            done
            [ "$FOUND" = "0" ] && warn "Aucun plugin trouvé dans $SRC_PLUGINS_FRONT"
        else
            warn "Dossier plugins front introuvable : $SRC_PLUGINS_FRONT (ignoré)"
        fi
    else
        warn "INSTALL_PLUGINS_FRONT=0 — installation des plugins front ignorée."
    fi


    log "Installation dev terminée."
}

# ── Build du client web  ────────────────────────────
build_web_client() {
    log "Build du client web Girder 5 avec npm..."

    WEB_DIR="$SRC_GIRDER/girder/web"

    if [ ! -d "$WEB_DIR" ]; then
        err "Dossier web introuvable : $WEB_DIR"
        exit 1
    fi

    cd "$WEB_DIR"
    npm install
    npm run build

    log "Client web buildé avec succès."
}

# ── Attente que MongoDB soit disponible ───────────────────────────────────────
wait_for_mongo() {
    local host=${GIRDER_MONGO_HOST}
    local port=${GIRDER_MONGO_PORT}
    local retries=30
    local wait=2

    log "Attente de MongoDB sur $host:$port..."
    for i in $(seq 1 $retries); do
        if python3 -c "
import socket, sys
try:
    s = socket.create_connection(('$host', $port), timeout=2)
    s.close()
    sys.exit(0)
except:
    sys.exit(1)
" 2>/dev/null; then
            log "MongoDB disponible."
            return 0
        fi
        warn "  Tentative $i/$retries — MongoDB pas encore prêt, attente ${wait}s..."
        sleep $wait
    done
    err "MongoDB non disponible après $retries tentatives. Abandon."
    exit 1
}

# ── Commande principale ───────────────────────────────────────────────────────
case "$1" in

    serve)
        log "Démarrage de girder-en-avant (ENV=$GIRDER_ENV)"
        log "Base de données : $GIRDER_DATABASE_URI"

        if [ "$GIRDER_ENV" = "dev" ]; then
            install_dev
            if [ "${BUILD_WEB_CLIENT:-0}" = "1" ]; then
                build_web_client
            else
                warn "BUILD_WEB_CLIENT=0 — build du client web ignoré."
                warn "Mettez BUILD_WEB_CLIENT=1 dans .env.dev si les assets /static/built/ sont manquants."
            fi
        fi

        wait_for_mongo

        if [ "$GIRDER_ENV" = "dev" ]; then
            log "debugpy activé sur le port $DEBUGPY_PORT"

            if [ "$DEBUGPY_WAIT" = "1" ]; then
                warn "En attente de connexion du débogueur VS Code sur le port $DEBUGPY_PORT..."
                DEBUGPY_OPTS="--listen 0.0.0.0:$DEBUGPY_PORT --wait-for-client"
            else
                DEBUGPY_OPTS="--listen 0.0.0.0:$DEBUGPY_PORT"
            fi

            exec python3 -m debugpy $DEBUGPY_OPTS \
                -m girder serve \
                --host "$GIRDER_HOST" \
                --port "$GIRDER_PORT" \
                --database "$GIRDER_DATABASE_URI"
        else
            exec python3 -m girder serve \
                --host "$GIRDER_HOST" \
                --port "$GIRDER_PORT" \
                --database "$GIRDER_DATABASE_URI"
        fi
        ;;

    idle)
        log "Mode IDLE — installation des packages puis attente."
        install_dev

        if [ "${BUILD_WEB_CLIENT:-0}" = "1" ]; then
            build_web_client
        else
            warn "BUILD_WEB_CLIENT=0 — build du client web ignoré."
            warn "Mettez BUILD_WEB_CLIENT=1 dans .env.dev si les assets /static/built/ sont manquants."
        fi

        log "Conteneur en attente (idle)."
        log "Base de données : $GIRDER_DATABASE_URI"
        log "Pour ouvrir un shell : docker exec -it girder-en-avant bash"
        log "Pour lancer Girder manuellement :"
        log "  girder serve --host 0.0.0.0 --port $GIRDER_PORT --database $GIRDER_DATABASE_URI"
        log "Pour lancer avec debugpy :"
        log "  python3 -m debugpy --listen 0.0.0.0:$DEBUGPY_PORT -m girder serve --host 0.0.0.0 --port $GIRDER_PORT --database $GIRDER_DATABASE_URI"
        exec tail -f /dev/null
        ;;

    bash|shell)
        exec /bin/bash
        ;;

    *)
        exec "$@"
        ;;

esac
