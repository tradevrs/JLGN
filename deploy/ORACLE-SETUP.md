# Put VRS online for free, on a fixed address (Oracle Cloud + DuckDNS)

Result: **https://tradevrs.duckdns.org**, your website, logins, trials, the challenge, the bridge downloads and (later) payments.
Always on, with https, and the address **never changes**. Cost: €0.

Takes about 45 minutes. Do the parts in order. ⏸ = waiting is normal.

---

## Part A · Your fixed name (DuckDNS, 2 min)
1. Go to **duckdns.org** and sign in (Google or GitHub).
2. Under *domains*, type **`tradevrs`** and click **add domain**.
   - Taken? Pick another name (e.g. `vrs-trading`) and tell Claude, so the files use that name.
3. Leave this tab open: you'll put the server's IP address here in Part D.

## Part B · Oracle account (10 min + ⏸)
1. Go to **oracle.com/cloud/free** and click **Start for free**.
2. Country **Belgium**. **Home region: Germany Central (Frankfurt)** or **Netherlands Northwest (Amsterdam)**. You can't change it later.
3. Fill in the card details: it's only a check, nothing is charged for "Always Free" resources.
4. ⏸ Wait for the email "Your account is ready" (minutes, sometimes a few hours).

## Part C · Create the server (10 min)
1. Log in at **cloud.oracle.com**. Top left **☰ → Compute → Instances → Create instance**.
2. **Name:** `vrs`
3. **Image and shape → Edit:**
   - Image: **Change image → Ubuntu → Canonical Ubuntu 24.04** → Select.
   - Shape: **Change shape → AMD → VM.Standard.E2.1.Micro** (it says *Always Free-eligible*) → Select.
     (Or *Ampere → VM.Standard.A1.Flex*, 1 OCPU / 6 GB, also free, if it's available.)
4. **Networking:** leave as it is, with **Assign a public IPv4 address = yes**.
5. **Add SSH keys:** choose **Generate a key pair for me** → click **Save private key**.
   Save it as `C:\Users\nicol\.ssh\vrs.key` (make the `.ssh` folder if it doesn't exist).
6. Click **Create**. ⏸ Wait until the status is **Running** (1–2 min).

## Part D · Make the address fixed (5 min)
1. In your instance: **Attached VNICs** (left, under Resources) → click the VNIC name.
2. **IPv4 Addresses** (left) → **⋮** on the row → **Edit**.
3. Choose **No public IP** → **Update**.
4. **⋮ → Edit** again → choose **Reserved public IP** → **Create a new reserved IP**, name `vrs-ip` → **Update**.
5. Copy the **public IP address** shown (looks like `141.147.12.34`). This one never changes.
6. Back on **duckdns.org**: paste it in the *current ip* field of `tradevrs` → **update ip**.

## Part E · Open the web ports in Oracle (3 min)
1. Back in your instance: **Instance details → Subnet** (click the subnet link).
2. **Security Lists** → **Default Security List for …** → **Add Ingress Rules**.
3. Source CIDR **`0.0.0.0/0`**, IP Protocol **TCP**, Destination Port Range **`80,443`** → **Add Ingress Rules**.

## Part F · Install VRS on the server (10 min)
Open **PowerShell** on your PC and run these one by one (replace `141.147.12.34` with your IP):

1. Lock the key file (Windows refuses keys that others can read):
   ```
   icacls $env:USERPROFILE\.ssh\vrs.key /inheritance:r /grant:r "$($env:USERNAME):R"
   ```
2. Build the package: double-click **`backend\deploy\BUILD_SERVER_PACKAGE.bat`**. It makes `vrs-server.zip`, without any of your private files.
3. Upload it:
   ```
   scp -i $env:USERPROFILE\.ssh\vrs.key C:\Users\nicol\Desktop\TD\gomez_mt5_demo\backend\deploy\vrs-server.zip ubuntu@141.147.12.34:~
   ```
   (The first time it asks "Are you sure…?": type `yes`.)
4. Log in to the server:
   ```
   ssh -i $env:USERPROFILE\.ssh\vrs.key ubuntu@141.147.12.34
   ```
5. On the server (the prompt now says `ubuntu@vrs`), install everything with one command:
   ```
   python3 -m zipfile -e vrs-server.zip . && bash app/deploy/install.sh tradevrs.duckdns.org
   ```
   ⏸ 3–5 minutes. At the end it shows **YOUR ADMIN TOKEN**: save it (password manager or a note).
   It ends with "VRS is running".
6. Your settings (your email as owner, VT Markets link, alerts):
   ```
   nano /opt/vrs/vrs.env
   ```
   Fill in at least `GP_OWNER_EMAILS=` with your email. Save with **Ctrl+O, Enter**, close with **Ctrl+X**, then:
   ```
   sudo systemctl restart vrs
   ```

## Part G · Check (5 min)
1. Open **https://tradevrs.duckdns.org**. The VRS landing page should load with a 🔒.
2. **Sign up** with the email you put in `GP_OWNER_EMAILS`: that account is your admin account.
3. **Admin → 🔔 Test alert** (once you filled in the alert settings).
4. Private window: make a test customer, and check that **Setup → Download** works.

## Part H · The old address and your links
1. On GitHub, in your `chart` folder, **replace `index.html`** with `backend\deploy\github-pages-redirect\index.html`.
   The old link `tradevrs.github.io/chart` then sends everyone to the new address.
2. Change the link in your **Instagram and TikTok bio** to `https://tradevrs.duckdns.org`.

---

## Later: putting a new version live (2 min)
1. Double-click **BUILD_SERVER_PACKAGE.bat** → upload with the same `scp` command as in F3.
2. `ssh` in (F4), then:
   ```
   rm -rf app && python3 -m zipfile -e vrs-server.zip . && bash app/deploy/update.sh
   ```
   Your accounts, settings and keys stay. A backup is made first.

## Later: real payments (Stripe)
- In `/opt/vrs/vrs.env`: `STRIPE_SECRET_KEY=` and `STRIPE_WEBHOOK_SECRET=`, then `sudo systemctl restart vrs`.
- In Stripe, add the webhook address: `https://tradevrs.duckdns.org/api/billing/webhook`.

## Something wrong?
- **The site doesn't load:** check Part E (ports 80 and 443), and that DuckDNS has the right IP.
- **Logs of VRS:** `sudo journalctl -u vrs -n 50 --no-pager`
- **Logs of https (Caddy):** `sudo journalctl -u caddy -n 50 --no-pager`
- **Backups** of the accounts: `/opt/vrs/backups` (one a day, 14 days kept).
- **Oracle mails about an "idle" instance:** upgrade the account to **Pay As You Go** (Billing → Upgrade). Always Free resources stay free, and they then never get reclaimed.
