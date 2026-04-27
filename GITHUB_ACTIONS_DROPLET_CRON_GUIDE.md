# Droplet Cron Trigger for GitHub Actions

This guide explains how to use a small Linux server or Droplet to trigger the GitHub Actions Cypress workflow every 15 minutes.

## Overview

The idea is:

1. Keep the actual Cypress run inside GitHub Actions.
2. Use a Droplet cron job every 15 minutes.
3. Have the Droplet call GitHub's `workflow_dispatch` API.

This avoids running Cypress on a low-memory VPS while still giving you a predictable schedule.

## Prerequisites

- A GitHub repository with the Cypress workflow already committed.
- The workflow must include `workflow_dispatch`.
- A GitHub Personal Access Token with permission to trigger workflows.
- A Linux server or Droplet with `curl` installed.

## 1. Confirm the GitHub workflow supports manual dispatch

Your workflow file should include:

```yaml
on:
  workflow_dispatch:
```

If you also use `schedule`, that is fine, but it is optional for this setup.

## 2. Create a GitHub token

Create a GitHub token that can trigger workflows for the repository.

For a private repository, use one of these:

- Fine-grained token with repository access and Actions write permission
- Classic token with `repo` scope

## 3. Create a secure environment file on the Droplet

Create a directory for configuration:

```bash
mkdir -p /etc/real-estate
chmod 700 /etc/real-estate
```

Create the environment file:

```bash
nano /etc/real-estate/github-actions.env
chmod 600 /etc/real-estate/github-actions.env
```

Add this content:

```bash
GITHUB_TOKEN=your_github_token_here
OWNER=your_github_username_or_org
REPO=real-estate-analytics
WORKFLOW_FILE=cypress.yml
REF=master
```

Notes:

- `OWNER` is your GitHub username or organization name.
- `REPO` is the repository name.
- `WORKFLOW_FILE` should match the workflow filename in `.github/workflows/`.
- `REF` should be your default branch, for example `main` or `master`.

## 4. Create the trigger script

Create a scripts directory:

```bash
mkdir -p /opt/real-estate/bin
```

Create the script:

```bash
nano /opt/real-estate/bin/trigger-github-action.sh
chmod +x /opt/real-estate/bin/trigger-github-action.sh
```

Use this script:

```bash
#!/usr/bin/env bash
set -euo pipefail

. /etc/real-estate/github-actions.env

curl -sS -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches" \
  -d "{\"ref\":\"${REF}\"}"
```

## 5. Test the trigger manually

Run:

```bash
/opt/real-estate/bin/trigger-github-action.sh
```

Then open GitHub and check:

`Actions -> Cypress Runner`

You should see a new run start.

## 6. Create a log directory

```bash
mkdir -p /opt/real-estate/logs
```

## 7. Add the cron job

Open crontab:

```bash
crontab -e
```

Add this line:

```cron
*/15 * * * * /opt/real-estate/bin/trigger-github-action.sh >> /opt/real-estate/logs/github-action-trigger.log 2>&1
```

This triggers the GitHub workflow every 15 minutes.

## 8. Verify cron is installed

List your cron jobs:

```bash
crontab -l
```

Watch the log:

```bash
tail -f /opt/real-estate/logs/github-action-trigger.log
```

## 9. Recommended GitHub Actions concurrency protection

If a workflow run can take longer than 15 minutes, multiple runs may overlap.

To prevent that, add this to your workflow:

```yaml
concurrency:
  group: cypress-runner
  cancel-in-progress: true
```

This keeps old runs from piling up.

## 10. Troubleshooting

If nothing runs in GitHub:

- Check that `REF` matches the repository default branch.
- Check that `WORKFLOW_FILE` matches the real workflow filename.
- Check that the token has permission to trigger workflows.
- Run the script manually to verify the API call works.

If cron does not execute:

- Check cron service status.
- Check file permissions for the script.
- Check the log file in `/opt/real-estate/logs/github-action-trigger.log`.

If GitHub Actions runs overlap:

- Add the `concurrency` block shown above.
- Increase the cron interval if needed.

## Useful commands

Manual trigger:

```bash
/opt/real-estate/bin/trigger-github-action.sh
```

Check cron entries:

```bash
crontab -l
```

Watch trigger log:

```bash
tail -f /opt/real-estate/logs/github-action-trigger.log
```
