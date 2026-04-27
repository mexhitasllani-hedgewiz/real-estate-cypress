#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

log "Starting GitHub Actions workflow dispatch script"

ENV_FILE="/etc/real-estate/github-actions.env"
log "Loading environment variables from ${ENV_FILE}"

. "${ENV_FILE}"

log "Environment loaded"
log "Repository: ${OWNER}/${REPO}"
log "Workflow file: ${WORKFLOW_FILE}"
log "Ref: ${REF}"

API_URL="https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches"

log "Sending POST request to GitHub API: ${API_URL}"

HTTP_CODE=$(curl -sS -o /tmp/github_dispatch_response.json -w "%{http_code}" -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API_URL}" \
  -d "{\"ref\":\"${REF}\"}")

log "GitHub API responded with HTTP status: ${HTTP_CODE}"

if [[ "${HTTP_CODE}" == "204" ]]; then
  log "Workflow dispatch triggered successfully"
else
  log "Failed to trigger workflow"
  log "Response body:"
  cat /tmp/github_dispatch_response.json
  exit 1
fi

log "Script completed successfully"
