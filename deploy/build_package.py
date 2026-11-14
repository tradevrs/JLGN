"""Builds deploy/vrs-server.zip: everything the online VRS server needs, and NOTHING private.

Run:  double-click deploy/BUILD_SERVER_PACKAGE.bat   (or: python deploy/build_package.py)
Then upload vrs-server.zip to your Oracle server (see deploy/ORACLE-SETUP.md).

Never included: config.json, accounts_extra.json, paper_accounts.json, copy_settings.json, targets.json,
license.json / license_cache.json, any key file, saas/data (your accounts database, signing key, owners.txt).
"""
from pathlib import Path
import zipfile

BASE = Path(__file__).resolve().parent.parent          # backend/
OUT = BASE / "deploy" / "vrs-server.zip"

FILES = [
    # the license server
    "saas/license_server.py", "saas/requirements.txt", "gp_sign.py",
    # the website it serves
    "index.html", "legal.html", "rulebook.html", "terminal.html", "journal.html", "lab.html", "indicator.html",
    "gp-shared.js", "gp-theme.css", "vrs-icon.png", "vrs-og.png",
    "tradingview/VRS-Indicator-Lite.pine", "ebook/VRS-Playbook.pdf",
    # the files that go into a customer's VRSBridge.zip
    "app.py", "paper.py", "licensing.py", "requirements.txt", "run_bridge.py", "start_customer.bat",
    # the server scripts
    "deploy/install.sh", "deploy/update.sh",
]
PATTERNS = ["lp-*.jpg", "lp-*.mp4"]                   # landing page screenshots / clips
NEVER = {"config.json", "accounts_extra.json", "paper_accounts.json", "copy_settings.json", "targets.json",
         "license.json", "license_cache.json", "owners.txt", "signing_seed", "session_secret", "licenses.db"}

files = [BASE / f for f in FILES] + [p for pat in PATTERNS for p in sorted(BASE.glob(pat))]
missing = [str(p.relative_to(BASE)) for p in files if not p.is_file()]
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for p in files:
        if not p.is_file():
            continue
        rel = p.relative_to(BASE).as_posix()
        assert p.name not in NEVER and "/data/" not in rel and "key" not in p.name.lower(), f"refusing private file {rel}"
        z.write(p, "app/" + rel)
print(f"Built {OUT} ({OUT.stat().st_size / 1e6:.1f} MB, {len(files) - len(missing)} files)")
if missing:
    print("Not found (skipped):", ", ".join(missing))
