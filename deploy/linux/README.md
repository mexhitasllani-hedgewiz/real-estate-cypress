# Run Cypress Every 10 Minutes On Linux

This project already exposes `npm run cypress:run`. The files in this folder provide a Linux-friendly wrapper and a `systemd` timer so the run can execute every 10 minutes on a server.

## 1. Prepare the server

Install:

- Node.js 18
- npm
- Git
- Cypress Linux dependencies

For Ubuntu/Debian, this is the usual baseline:

```bash
sudo apt update
sudo apt install -y git curl xvfb libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
  libnss3 libxss1 libasound2t64 libxtst6 xauth libatk-bridge2.0-0 libcups2 libdrm2
```

Install `nvm` and Node 18 if you want to keep the runner aligned with the script defaults:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 18
nvm use 18
```

## 2. Deploy the project

```bash
sudo mkdir -p /opt/real-estate
sudo chown "$USER":"$USER" /opt/real-estate
git clone <your-repo-url> /opt/real-estate
cd /opt/real-estate
npm ci
```

Add the project `.env` file if your tasks depend on it.

## 3. Test one manual run

```bash
chmod +x /opt/real-estate/deploy/linux/run-cypress.sh
APP_DIR=/opt/real-estate /opt/real-estate/deploy/linux/run-cypress.sh
tail -n 100 /opt/real-estate/logs/cypress-run.log
```

## 4. Install the timer

Update `deploy/linux/cypress-run.service` and replace `User=CHANGE_ME` with the Linux user that owns the app.

Then install:

```bash
sudo cp /opt/real-estate/deploy/linux/cypress-run.service /etc/systemd/system/
sudo cp /opt/real-estate/deploy/linux/cypress-run.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now cypress-run.timer
```

Check status:

```bash
systemctl status cypress-run.timer
systemctl list-timers --all | grep cypress-run
journalctl -u cypress-run.service -n 100 --no-pager
```

## 5. Cron alternative

If you prefer cron instead of `systemd`, add this with `crontab -e`:

```cron
*/10 * * * * APP_DIR=/opt/real-estate /opt/real-estate/deploy/linux/run-cypress.sh
```

`systemd` is usually the better option on a server because it keeps logs, survives reboots cleanly, and is easier to inspect.
