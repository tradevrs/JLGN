"""VRS online from THIS PC: the license server + website, public on your fixed Tailscale Funnel address.

Start with: deploy\\START VRS ONLINE.bat   (keep the window open; the PC must stay on)
- Your settings live in saas\\data\\server.env (private: saas\\data is never uploaded or zipped). Made the first time.
- The public address (https://<pc-name>.<tailnet>.ts.net) is found by itself and never changes.
- If the server stops, it starts again by itself.
"""
from __future__ import annotations

import json
import os
import secrets
import shutil
import subprocess
import sys
import time
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent          # backend/
ENV = BASE / "saas" / "data" / "server.env"
PORT = 8800
TEMPLATE = """# VRS online server settings (PRIVATE: this folder is never uploaded or zipped).
# After a change: close the VRS ONLINE window and start it again.
GP_ADMIN_TOKEN={admin}
# Your public address. Empty = found by itself from Tailscale.
GP_PUBLIC_URL=
# VT Markets partner link:  vtmarkets=https://...
GP_BROKER_LINKS=
# Stripe (empty = test mode: nothing is charged)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
# Alerts for you: WhatsApp (CallMeBot) and/or email (Gmail app password)
GP_NOTIFY_WHATSAPP=
GP_CALLMEBOT_KEY=
GP_NOTIFY_EMAIL=
GP_SMTP_USER=
GP_SMTP_PASS=
"""


def tailscale() -> str:
    exe = shutil.which("tailscale") or r"C:\Program Files\Tailscale\tailscale.exe"
    return exe if Path(exe).is_file() or shutil.which("tailscale") else ""


def ts_address(exe: str) -> str:
    try:
        st = json.loads(subprocess.run([exe, "status", "--json"], capture_output=True, text=True, timeout=20).stdout or "{}")
        name = (st.get("Self") or {}).get("DNSName", "").rstrip(".")
        return f"https://{name}" if name else ""
    except Exception:
        return ""


def main():
    ENV.parent.mkdir(parents=True, exist_ok=True)
    if not ENV.is_file():
        admin = secrets.token_hex(16)
        ENV.write_text(TEMPLATE.format(admin=admin), encoding="utf-8")
        print(f"\n  Made your settings file: {ENV}\n  >>> YOUR ADMIN TOKEN (save it): {admin}\n")
    for line in ENV.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            if v.strip():
                os.environ[k.strip()] = v.strip()

    # your own (admin) account on the site talks to YOUR bridge on this PC: use its key (read here, never printed)
    try:
        own = json.loads((BASE / "config.json").read_text(encoding="utf-8-sig")).get("api_key", "")
        if own and not os.environ.get("GP_OWNER_BRIDGE_KEY"):
            os.environ["GP_OWNER_BRIDGE_KEY"] = own
    except Exception:
        pass

    exe = tailscale()
    url = os.environ.get("GP_PUBLIC_URL", "")
    if exe:
        url = url or ts_address(exe)
        # The first time Tailscale prints a link to allow Funnel and WAITS until you approve it: show its message, keep waiting.
        print("  Switching on the public link (Tailscale Funnel)…")
        print("  The first time: open the link below in your browser, click Enable, and this continues by itself.\n")
        p = subprocess.Popen([exe, "funnel", "--bg", str(PORT)])
        try:
            code = p.wait(timeout=900)
            if code != 0:
                print("\n  !! Tailscale Funnel did not switch on (see the message above). The site works on this PC only for now.\n")
        except subprocess.TimeoutExpired:
            p.kill()
            print("\n  !! Funnel was not approved within 15 minutes. Approve the link above, then start this window again.\n")
    else:
        print("  !! Tailscale is not installed: the site only works on this PC. See deploy\\PC-SERVER-SETUP.md\n")
    if url:
        os.environ["GP_PUBLIC_URL"] = url

    print("=" * 64)
    print(f"  VRS ONLINE   {url or 'http://127.0.0.1:%d (this PC only)' % PORT}")
    print(f"  Admin        {url or 'http://127.0.0.1:%d' % PORT}/#admin")
    print("  Keep this window open. The PC must stay on (and not go to sleep).")
    print("=" * 64 + "\n")

    cmd = [sys.executable, "-m", "uvicorn", "saas.license_server:app", "--host", "127.0.0.1", "--port", str(PORT),
           "--proxy-headers", "--forwarded-allow-ips", "127.0.0.1"]
    while True:  # if it ever stops, start again
        code = subprocess.call(cmd, cwd=str(BASE))
        print(f"\n  Server stopped (code {code}). Starting again in 5 s… (close this window to stop)\n")
        time.sleep(5)


if __name__ == "__main__":
    main()
