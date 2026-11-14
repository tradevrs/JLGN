# VRS online from your own PC (free, fixed address, no router settings)

Result: an address like **https://vrs.your-tailnet.ts.net** with your website, logins, trials, the challenge and the bridge downloads.
Free, with https, and the address **never changes**. Your current accounts stay.
**The PC has to stay on.** Move to a real server later, when customers pay.

About 15 minutes.

---

## 1 · Install Tailscale (3 min)
1. Go to **tailscale.com/download** → **Windows** → install.
2. Click the Tailscale icon (bottom right, next to the clock) → **Log in** → sign in with **Google**. It's the free personal plan, no card.

## 2 · Give your PC a nice name (1 min, optional)
1. Go to **login.tailscale.com/admin/machines**.
2. **⋯** next to your PC → **Edit machine name** → `vrs` → Save.
   Your address becomes `https://vrs.<your-tailnet>.ts.net`.
3. Optional: **DNS** (top menu) → *Tailnet name* → **Rename tailnet…** → pick one of the fun names. This is possible only once, so pick one you like.

## 3 · Start VRS online (2 min)
1. Double-click **`backend\deploy\START VRS ONLINE.bat`**.
2. **The first time**, Tailscale shows a message with a **link to allow Funnel** (Funnel is what makes it public).
   Open that link → **Enable** → close the VRS window → double-click the .bat again.
3. The window then shows:
   `VRS ONLINE   https://vrs.xxxx.ts.net`
   **That is your fixed address.** Send it to Claude, so the redirect page and your links use it.
4. Your **admin token** is in `backend\saas\data\server.env` (private file, never uploaded).

## 4 · Keep it running (3 min)
- **No sleep:** Windows Settings → System → Power → *Screen and sleep* → **When plugged in, put my device to sleep after: Never**.
- **Start by itself after a restart:** press **Win + R** → type `shell:startup` → Enter → right-click in that folder → **New → Shortcut** → browse to `backend\deploy\START VRS ONLINE.bat` → Finish.
- Your trading bridge still runs separately with **start_bridge.bat** (restart it once now: it no longer runs a second copy of the website inside it).

## 5 · Check (3 min)
1. On your **phone, with Wi-Fi off** (so from outside): open your `https://vrs.xxxx.ts.net` address. The VRS page loads with a 🔒.
2. Log in with your own email (from `owners.txt`): you're admin.
3. Private window: make a test account → **Setup** → Download works.

## 6 · Settings (when you're ready)
Open `backend\saas\data\server.env` in Notepad, fill in, save, and restart the VRS ONLINE window:
- `GP_BROKER_LINKS=vtmarkets=https://…` (your VT Markets link)
- the WhatsApp / email alert settings
- later: the Stripe keys (webhook address: `https://vrs.xxxx.ts.net/api/billing/webhook`)

---

## Something wrong?
- **"Tailscale is not installed"**: do step 1, then start the .bat again.
- **The page doesn't load from your phone:** look in the VRS window for a Funnel message, and do step 3.2.
- **Moving to a real server later:** the same files work (see ORACLE-SETUP.md). Only the address changes once, and the GitHub redirect page takes care of old links.
