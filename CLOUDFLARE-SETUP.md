# Put RasiVani live on rasivani.com with Cloudflare Pages (free)

Takes about 20 minutes. You need a GitHub account and a Cloudflare account (both free).

## Step 1. Put the site on GitHub
1. github.com → **New repository** → name `rasivani` → Public → Create.
2. On the empty repo page, click **uploading an existing file**. Unzip `rasivani-site.zip` on your computer
   and drag in everything inside it (including the `.github` and `.well-known` folders; on Windows/Mac turn on
   "show hidden files" if you can't see them). Click **Commit changes**.
   If the browser upload refuses the hidden folders, install GitHub Desktop and drag the folder in there instead.

## Step 2. Get rasivani.com onto Cloudflare
- **If you bought the domain at Cloudflare:** it is already there. Skip to Step 3.
- **If you bought it somewhere else (GoDaddy, Hostinger, Namecheap…):**
  1. dash.cloudflare.com → **Add a domain** → type `rasivani.com` → choose the **Free** plan.
  2. Cloudflare shows two nameservers (like `xxx.ns.cloudflare.com`).
  3. At the shop where you bought the domain → Manage → **Nameservers** → "Custom" → paste the two Cloudflare
     nameservers → Save. Delete any old ones.
  4. Wait until Cloudflare emails "rasivani.com is now active" (usually under an hour, at most 24 hours).

## Step 3. Create the Pages project
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
2. Sign in to GitHub when asked, allow access to the `rasivani` repository, select it → **Begin setup**.
3. Fill in:
   - Project name: `rasivani`
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `node tools/daily.mjs`
   - Build output directory: `/`
4. **Save and Deploy**. In about a minute you get a test address like `rasivani.pages.dev`. Open it and check it works.

## Step 4. Connect the domain
1. In the Pages project → **Custom domains** → **Set up a custom domain** → `rasivani.com` → Continue →
   **Activate domain**. Cloudflare adds the DNS record for you.
2. Repeat for `www.rasivani.com`.
3. Wait 5–15 minutes, then open https://rasivani.com. The padlock appears by itself (free SSL).
4. Optional: Rules → **Redirect Rules** → use the template "Redirect from WWW to root" so everyone lands on
   `rasivani.com` (keeps Google from seeing two copies).

## Step 5. The one button (daily rasi palan)
1. GitHub → your `rasivani` repo → **Actions** tab → if asked, click "I understand… enable workflows".
2. Click **Publish site** → **Run workflow** → green button. It writes today's rasi palan in all 10 languages,
   commits it, and Cloudflare publishes it within a minute or two.
3. From now on it runs by itself every night at 00:05 India time. You only press the button if you want an
   update right away. GitHub emails you if a run fails.

## Step 6. Email (hello@rasivani.com)
Cloudflare dashboard → rasivani.com → **Email** → **Email Routing** → Get started → create `hello@rasivani.com`
→ forward to your Gmail → verify the link Cloudflare emails you. Free, and it's the address the site shows.
To reply *from* hello@rasivani.com in Gmail, use Gmail → Settings → Accounts → "Send mail as" (needs a free
SMTP like Brevo), or simply reply from your Gmail.

## Done? Then
- Search Console: search.google.com/search-console → Add property → Domain `rasivani.com` → it gives a TXT
  record → add it in Cloudflare DNS → Verify → submit `https://rasivani.com/sitemap.xml`.
- AdSense: apply after 2–4 weeks of daily pages (see LAUNCH-CHECKLIST.md).
- Android app: pwabuilder.com → enter https://rasivani.com → Android → package id `com.rasivani.app`.
