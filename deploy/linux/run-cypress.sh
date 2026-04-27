#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/real-estate}"
LOG_FILE="${LOG_FILE:-$APP_DIR/logs/cypress-run.log}"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NODE_VERSION="${NODE_VERSION:-18}"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $*"
}

on_error() {
  local exit_code=$?
  log "ERROR: command failed with exit code $exit_code at line ${BASH_LINENO[0]}: ${BASH_COMMAND}"
  exit "$exit_code"
}

exec >>"$LOG_FILE" 2>&1
trap on_error ERR

log "===== Starting Cypress run ====="
log "APP_DIR=$APP_DIR"
log "LOG_FILE=$LOG_FILE"
log "NVM_DIR=$NVM_DIR"
log "NODE_VERSION=$NODE_VERSION"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # Load nvm when the job runs from cron/systemd without an interactive shell.
  log "Loading nvm from $NVM_DIR/nvm.sh"
  . "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
else
  log "nvm.sh not found at $NVM_DIR/nvm.sh; using current node"
fi

log "Changing directory to $APP_DIR"
cd "$APP_DIR"

log "Running npm run cypress:run"
npm run cypress:run
log "===== Cypress run finished ====="
