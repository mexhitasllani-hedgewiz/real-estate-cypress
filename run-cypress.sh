#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /Users/mexhit/WebstormProjects/real-estate || exit 1
npm run cypress:run >> /Users/mexhit/WebstormProjects/real-estate/cron.log 2>&1
