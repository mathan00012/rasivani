// Shared helpers for the Cloudflare Pages Functions in /functions/api.
// Secrets (set in Cloudflare → Pages project → Settings → Variables and secrets):
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET  – from Razorpay Dashboard → Account & Settings → API keys
//   RESEND_API_KEY                         – from resend.com → API keys
//   MAIL_FROM     e.g. "RasiVani <reports@rasivani.com>" (domain verified in Resend)
//   SUPPORT_EMAIL e.g. "hello@rasivani.com"

// Prices in paise. The browser never decides the price.
export const PRICES = { career: 4900, marriage: 4900, birth: 4900, complete: 9900 };
export const MAX_EMAILS = 5;

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

const enc = new TextEncoder();
export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
// The unlock token ties one payment to one product and one person's birth data
export const unlockToken = (env, paymentId, product, key) => hmacHex(env.RAZORPAY_KEY_SECRET, `unlock|${paymentId}|${product}|${key}`).then((h) => h.slice(0, 40));

export const validKey = (k) => typeof k === 'string' && /^-?\d{4}-\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}-(-?\d{1,3}\.\d{2})-(-?\d{1,3}\.\d{2})$/.test(k);
export const validEmail = (e) => typeof e === 'string' && e.length < 200 && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/.test(e);

export async function rzp(env, method, path, body) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { Authorization: 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(`razorpay ${res.status}`); e.data = data; throw e; }
  return data;
}

// Confirms a payment is paid (capturing it if needed) and belongs to an order made by /api/order.
export async function paidOrder(env, paymentId) {
  let pay = await rzp(env, 'GET', `/payments/${encodeURIComponent(paymentId)}`);
  if (!pay.order_id) return null;
  const order = await rzp(env, 'GET', `/orders/${encodeURIComponent(pay.order_id)}`);
  const n = order.notes || {};
  if (!PRICES[n.product] || pay.amount !== PRICES[n.product] || pay.currency !== 'INR') return null;
  if (pay.status === 'authorized') pay = await rzp(env, 'POST', `/payments/${pay.id}/capture`, { amount: pay.amount, currency: 'INR' });
  if (pay.status !== 'captured') return null;
  return { pay, order, notes: n };
}
