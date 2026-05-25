#!/bin/bash
# =============================================================================
# ENTRYPOINT GIRDER-CALCULE
# Comportement adapté selon GIRDER_ENV (dev | prod)
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[girder-en-arriere]${NC} $1"; }
warn() { echo -e "${YELLOW}[girder-en-arriere]${NC} $1"; }
err()  { echo -e "${RED}[girder-en-arriere]${NC} $1"; }

# ── Variables avec valeurs par défaut ─────────────────────────────────────────
GIRDER_ENV=${GIRDER_ENV:-prod}
DEBUGPY_PORT=${DEBUGPY_PORT:-5679}
DEBUGPY_WAIT=${DEBUGPY_WAIT:-0}
CELERY_LOGLEVEL=${CELERY_LOGLEVEL:-INFO}
CELERY_CONCURRENCY=${CELERY_CONCURRENCY:-2}

SRC_GIRDER_WORKER=${SRC_GIRDER_WORKER:-/opt/girder/src/girder-worker}
SRC_PLUGINS_WORKER=${SRC_PLUGINS_WORKER:-/opt/girder/src/plugins_worker}

# ── PATH : inclure les scripts installés par pip en user non-root ─────────────
export PATH="/home/girder/.local/bin:$PATH"

# ── Installation en mode dev (volumes montés) ─────────────────────────────────
install_dev() {
    log "Mode DEV — installation des packages en mode éditable..."

    if [ -d "$SRC_GIRDER_WORKER" ]; then
        log "  pip install -e $SRC_GIRDER_WORKER"
        pip install -e "$SRC_GIRDER_WORKER" --quiet
    else
        err "Code source girder-worker introuvable : $SRC_GIRDER_WORKER"
        err "Vérifiez que le volume est bien monté dans docker-compose.dev.yml"
        exit 1
    fi

    if [ "${INSTALL_PLUGINS_WORKER:-1}" = "1" ]; then
        if [ -d "$SRC_PLUGINS_WORKER" ]; then
            FOUND=0
            for plugin_dir in "$SRC_PLUGINS_WORKER"/*/; do
                if [ -f "${plugin_dir}pyproject.toml" ] || [ -f "${plugin_dir}setup.py" ]; then
                    log "  pip install -e ${plugin_dir}"
                    pip install -e "${plugin_dir}" --quiet
                    FOUND=1
                fi
            done
            [ "$FOUND" = "0" ] && warn "Aucun plugin trouvé dans $SRC_PLUGINS_WORKER"
        else
            warn "Dossier plugins worker introuvable : $SRC_PLUGINS_WORKER (ignoré)"
        fi
    else
        warn "INSTALL_PLUGINS_WORKER=0 — installation des plugins worker ignorée."
    fi

    log "Installation dev terminée."
}

# ── Attente que RabbitMQ soit disponible ──────────────────────────────────────
wait_for_rabbitmq() {
    local host=${RABBITMQ_HOST:-localhost}
    local port=${RABBITMQ_PORT:-5672}
    local retries=30
    local wait=2

    log "Attente de RabbitMQ sur $host:$port..."
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
            log "RabbitMQ disponible."
            return 0
        fi
        warn "  Tentative $i/$retries — RabbitMQ pas encore prêt, attente ${wait}s..."
        sleep $wait
    done
    err "RabbitMQ non disponible après $retries tentatives. Abandon."
    exit 1
}

# ── Commande principale ───────────────────────────────────────────────────────
case "$1" in

    worker)
        log "Démarrage de girder-en-arriere (ENV=$GIRDER_ENV)"

        if [ "$GIRDER_ENV" = "dev" ]; then
            install_dev
        fi

        wait_for_rabbitmq

        if [ "$GIRDER_ENV" = "dev" ]; then
            log "debugpy activé sur le port $DEBUGPY_PORT"

            if [ "$DEBUGPY_WAIT" = "1" ]; then
                warn "En attente de connexion du débogueur VS Code sur le port $DEBUGPY_PORT..."
                DEBUGPY_OPTS="--listen 0.0.0.0:$DEBUGPY_PORT --wait-for-client"
            else
                DEBUGPY_OPTS="--listen 0.0.0.0:$DEBUGPY_PORT"
            fi

            exec python3 -m debugpy $DEBUGPY_OPTS \
                -m celery \
                -A girder_worker.app \
                worker \
                --loglevel="$CELERY_LOGLEVEL" \
                --concurrency="$CELERY_CONCURRENCY"
        else
            exec python3 -m celery \
                -A girder_worker.app \
                worker \
                --loglevel="$CELERY_LOGLEVEL" \
                --concurrency="$CELERY_CONCURRENCY"
        fi
        ;;

    idle)
        # ── Mode dev "prêt mais en attente" ──────────────────────────────────
        log "Mode IDLE — installation des packages puis attente."
        install_dev
        log "Packages installés. Conteneur en attente (idle)."
        log "Pour ouvrir un shell : docker exec -it girder-en-arriere bash"
        log "Pour lancer le worker manuellement :"
        log "  python3 -m celery -A girder_worker.app worker --loglevel=DEBUG --concurrency=1"
        log "Pour lancer avec debugpy :"
        log "  python3 -m debugpy --listen 0.0.0.0:$DEBUGPY_PORT -m celery -A girder_worker.app worker --loglevel=DEBUG"
        exec tail -f /dev/null
        ;;

    bash|shell)
        exec /bin/bash
        ;;

    *)
        exec "$@"
        ;;

esac
