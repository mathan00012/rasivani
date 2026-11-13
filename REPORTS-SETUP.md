# Switch on paid reports (₹49 / ₹99)

The reports page (`reports.html`) works as soon as the site is live: anyone can see the free preview. The **Unlock** button only works after the three steps below. Until then it shows "Payments are not switched on yet".

| Report | Price | Sections |
|---|---|---|
| Career & Money | ₹49 | 10 |
| Marriage & Mangal Dosha | ₹49 | 10 |
| Complete Life Report | ₹99 | 19 |

Prices are fixed on the server in `lib/rv-pay.js` (`PRICES`, in paise). Change them there and in `js/report-text.js` (`PRODUCTS`) together.

## How it works

1. The visitor enters birth details. The chart and the report are worked out **in their browser**, as with the free jathagam.
2. They pay through Razorpay (UPI, cards, net banking, wallets).
3. `functions/api/verify.js` checks the payment with Razorpay and returns an unlock code. The full report appears, a PDF downloads, and `functions/api/email.js` emails the PDF through Resend.
4. Lost the page? "Already paid?" with the payment ID and the same birth details opens it again on any device.

The only things sent to our server are the email address and a short chart code (date, time, rounded place). Names and full birth details stay on the phone.

## Step 1. Fill in your legal name and address

Open `tools/build.mjs` and change these two lines near the top:

```js
seller: 'RasiVani (proprietor: YOUR FULL NAME)',
address: 'YOUR CITY, STATE, PIN CODE, India',
```

They appear on the new Terms and Refund pages. Razorpay checks these pages before approving you, and Indian e-commerce rules require a named seller and an address.

## Step 2. Razorpay (payments)

1. Sign up at **razorpay.com** as an individual / proprietor. You need PAN, a bank account in your name, and the website URL `https://rasivani.com`.
2. For "business category" choose something like *Services → Other services* and describe it as "Online astrology reports (digital PDF)". Astrology sites such as Astrotalk use Razorpay, so the category is accepted.
3. Razorpay asks for these page links. They are already on the site:
   - Terms: `https://rasivani.com/terms.html`
   - Refunds and delivery: `https://rasivani.com/refund.html`
   - Privacy: `https://rasivani.com/privacy.html`
   - Contact: `https://rasivani.com/contact.html`
4. After KYC is approved: **Settings → API Keys → Generate Live Key**. Copy the Key ID (`rzp_live_…`) and the Key Secret. The secret is shown only once.
5. **Settings → Payment capture → Automatic.** (The site also captures payments itself, so this is a safety net.)
6. Razorpay fees are about 2% per payment (about ₹1 on ₹49, ₹2 on ₹99). Money reaches your bank in about 2 working days.

Test first: use the Test Mode keys (`rzp_test_…`) in step 4 below and pay with Razorpay's test UPI ID `success@razorpay`. Swap to live keys when it works.

## Step 3. Resend (sending the PDF by email)

1. Sign up at **resend.com** (free: 3,000 emails a month, 100 a day).
2. **Domains → Add domain → `rasivani.com`.** Resend shows 3 DNS records. Add them in Cloudflare → rasivani.com → DNS. Wait until Resend says *Verified* (usually minutes).
3. **API Keys → Create API key** with "Sending access". Copy it (`re_…`).

If you skip Resend, reports still work: the PDF downloads on screen, and the "Email" button shows an apology with your support address.

## Step 4. Add the keys to Cloudflare Pages

Cloudflare dashboard → Workers & Pages → `rasivani` → **Settings → Variables and secrets** → Production → add each one as **Secret**:

| Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_live_…` |
| `RAZORPAY_KEY_SECRET` | the Razorpay key secret |
| `RESEND_API_KEY` | `re_…` |
| `MAIL_FROM` | `RasiVani <reports@rasivani.com>` |
| `SUPPORT_EMAIL` | `hello@rasivani.com` |

Then **Deployments → latest → Retry deployment** (variables only apply to new deployments). Nothing else changes: the `functions/` folder is picked up by Cloudflare Pages automatically, free plan included (100,000 requests a day).

## Step 5. Check it end to end

1. Open `https://rasivani.com/reports.html` on your phone, enter your own details, and press **Show free preview**.
2. Press **Unlock** and pay ₹49 (with live keys, refund yourself afterwards from the Razorpay dashboard).
3. The full report shows, a PDF downloads, and an email arrives within 5 minutes (check spam the first time).
4. Open the page in another browser, use **Already paid?** with the `pay_…` ID from the receipt: the same report opens.

## Rules to keep in mind

- **Refunds.** The Refund page promises a full refund if a paid report is not delivered and the buyer writes within 7 days. Do it from the Razorpay dashboard (Payments → the payment → Refund).
- **GST.** Below ₹20 lakh turnover a year, GST registration is usually not needed for services sold inside India. The site says "price includes all taxes". Check with a CA once sales grow, and before selling to buyers outside India.
- **Income tax.** Report the earnings in your income tax return (business income). Razorpay gives a monthly statement.
- **Play Store app.** Google requires Play Billing (15% fee) for digital goods sold inside Android apps. To keep things simple, the app **hides** the Reports link and shows "Detailed reports are not available in the app" if someone reaches the page. The website keeps selling as normal. Do not add a "buy on our website" link inside the app; that also breaks Play policy.
- **Google Ads / AdSense.** Advertising rules ban "unreliable claims". Report text already avoids guarantees and medical claims, and the health section says it is not medical advice. If you ever advertise the reports, do not promise outcomes ("you will get a job", "your marriage will happen by…").
- **Wording.** All report text is our own, written from classical Parashari rules. Do not paste text from other astrology sites into it.

## Where things live

| File | What it does |
|---|---|
| `reports.html` | The page (built by `tools/build.mjs`) |
| `js/report.js` | Astrology rules: houses, yogas, doshas, dasha periods, Sade Sati |
| `js/report-text.js` | Turns the results into sections; product list |
| `js/rt/<lang>.js` | Report wording in each of the 10 languages |
| `js/reports-page.js` | Form, preview, Razorpay checkout, PDF, email, "Already paid?" |
| `css/reports.css` | Styles, including the white PDF sheet |
| `functions/api/order.js`, `verify.js`, `email.js` | Server side (Cloudflare Pages Functions) |
| `lib/rv-pay.js` | Prices and shared server code |
| `terms.html`, `refund.html` | Policy pages Razorpay needs |
