#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/real-estate}"
LOG_FILE="${LOG_FILE:-$APP_DIR/logs/cypress-run.log}"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
NODE_VERSION="${NODE_VERSION:-18}"

mkdir -p "$(dirname "$LOG_FILE")"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # Load nvm when the job runs from cron/systemd without an interactive shell.
  . "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
fi

cd "$APP_DIR"

{
  echo "===== $(date '+%Y-%m-%d %H:%M:%S %Z') Starting Cypress run ====="
  npm run cypress:run
  echo "===== $(date '+%Y-%m-%d %H:%M:%S %Z') Cypress run finished ====="
} >>"$LOG_FILE" 2>&1
