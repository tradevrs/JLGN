#!/bin/bash
# VRS server: put a new version live (your accounts, settings and keys stay as they are).
# 1) On your PC: double-click deploy\BUILD_SERVER_PACKAGE.bat   2) upload vrs-server.zip (see ORACLE-SETUP.md)
# 3) On the server:   rm -rf app && unzip -oq vrs-server.zip && bash app/deploy/update.sh
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
sqlite3 /opt/vrs/saas/data/licenses.db ".backup /opt/vrs/backups/licenses-before-update-$(date +%F-%H%M).db" 2>/dev/null || true
rsync -a --exclude 'saas/data/' --exclude 'vrs.env' --exclude '.venv/' --exclude 'backups/' "$SRC"/ /opt/vrs/ 2>/dev/null || cp -r "$SRC"/. /opt/vrs/
/opt/vrs/.venv/bin/pip install -q -r /opt/vrs/saas/requirements.txt
sudo systemctl restart vrs
sleep 3
curl -fsS http://127.0.0.1:8800/api/plans >/dev/null && echo "== Updated and running ==" || echo "!! Not running: sudo journalctl -u vrs -n 50 --no-pager"
