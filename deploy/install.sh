#!/bin/bash
# VRS server: one-time install on an Ubuntu server (Oracle Cloud Always Free).
# Usage (in the folder where you unzipped vrs-server.zip):   bash app/deploy/install.sh tradevrs.duckdns.org
# It installs Python + Caddy (automatic https), puts VRS in /opt/vrs, starts it as a service that restarts by itself,
# opens ports 80/443 and makes a daily backup of the accounts database. Safe to run again.
set -e
DOMAIN="$1"
if [ -z "$DOMAIN" ]; then echo "Usage: bash app/deploy/install.sh yourname.duckdns.org"; exit 1; fi
SRC="$(cd "$(dirname "$0")/.." && pwd)"     # the unzipped app/ folder
echo "== VRS install for https://$DOMAIN =="

sudo apt-get update -y
sudo apt-get install -y python3-venv python3-pip curl gnupg debian-keyring debian-archive-keyring apt-transport-https sqlite3
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y && sudo apt-get install -y caddy
fi

# the app (your data folder and settings are never overwritten)
sudo mkdir -p /opt/vrs/saas/data /opt/vrs/backups
sudo cp -r "$SRC"/. /opt/vrs/
sudo chown -R "$USER":"$USER" /opt/vrs
python3 -m venv /opt/vrs/.venv
/opt/vrs/.venv/bin/pip install -q --upgrade pip
/opt/vrs/.venv/bin/pip install -q -r /opt/vrs/saas/requirements.txt

# settings: made once, then only you change them (nano /opt/vrs/vrs.env, then: sudo systemctl restart vrs)
if [ ! -f /opt/vrs/vrs.env ]; then
  ADMIN="$(openssl rand -hex 16)"
  cat > /opt/vrs/vrs.env <<EOF
# VRS server settings. After a change: sudo systemctl restart vrs
GP_PUBLIC_URL=https://$DOMAIN
GP_ADMIN_TOKEN=$ADMIN
# Your owner account (admin automatically when you sign up / log in with it)
GP_OWNER_EMAILS=
# VT Markets partner link:  vtmarkets=https://...
GP_BROKER_LINKS=
# Stripe (empty = test mode, nothing is charged)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# Alerts for you: WhatsApp (CallMeBot) and/or email (Gmail app password)
GP_NOTIFY_WHATSAPP=
GP_CALLMEBOT_KEY=
GP_NOTIFY_EMAIL=
GP_SMTP_USER=
GP_SMTP_PASS=
EOF
  chmod 600 /opt/vrs/vrs.env
  echo; echo "   >>> YOUR ADMIN TOKEN (save it somewhere safe): $ADMIN"; echo
fi

# the service: starts at boot, restarts if it ever stops
sudo tee /etc/systemd/system/vrs.service >/dev/null <<EOF
[Unit]
Description=VRS license server + website
After=network-online.target
[Service]
User=$USER
WorkingDirectory=/opt/vrs
EnvironmentFile=/opt/vrs/vrs.env
ExecStart=/opt/vrs/.venv/bin/uvicorn saas.license_server:app --host 127.0.0.1 --port 8800 --proxy-headers --forwarded-allow-ips=127.0.0.1
Restart=always
RestartSec=3
[Install]
WantedBy=multi-user.target
EOF

# https on your fixed address (Caddy gets and renews the certificate by itself)
sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN {
  encode gzip
  reverse_proxy 127.0.0.1:8800
}
EOF

# open the web ports in the server's own firewall (Oracle images block everything except SSH)
for P in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport $P -m state --state NEW -j ACCEPT 2>/dev/null; then
    N="$(sudo iptables -L INPUT --line-numbers -n | awk '/REJECT/{print $1; exit}')"   # just above Oracle's "reject all" rule
    sudo iptables -I INPUT "${N:-1}" -p tcp --dport $P -m state --state NEW -j ACCEPT
  fi
done
command -v netfilter-persistent >/dev/null && sudo netfilter-persistent save || true

# daily backup of the accounts database (keeps 14 days)
( crontab -l 2>/dev/null | grep -v vrs-backup || true; echo "30 3 * * * sqlite3 /opt/vrs/saas/data/licenses.db \".backup /opt/vrs/backups/licenses-\$(date +\%F).db\" && find /opt/vrs/backups -name 'licenses-*.db' -mtime +14 -delete # vrs-backup" ) | crontab -

sudo systemctl daemon-reload
sudo systemctl enable --now vrs
sudo systemctl restart caddy
sleep 4
if curl -fsS http://127.0.0.1:8800/api/plans >/dev/null; then echo "== VRS is running. Open https://$DOMAIN (the https certificate can take a minute the first time) =="
else echo "!! VRS did not start. Show the error with:  sudo journalctl -u vrs -n 50 --no-pager"; fi
