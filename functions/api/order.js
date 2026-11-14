// POST /api/order  { product, key, lang, email, name }  ->  { order_id, amount, key_id }
import { PRICES, json, rzp, validKey, validEmail } from '../../lib/rv-pay.js';

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return json({ error: 'not_configured' }, 503);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const product = String(b.product || '');
  if (!PRICES[product] || !validKey(b.key) || !validEmail(b.email)) return json({ error: 'bad_input' }, 400);
  try {
    const order = await rzp(env, 'POST', '/orders', {
      amount: PRICES[product], currency: 'INR', receipt: `rv-${Date.now().toString(36)}`,
      notes: { product, key: b.key, lang: String(b.lang || 'en').slice(0, 5), email: b.email, name: String(b.name || '').slice(0, 60) }
    });
    return json({ order_id: order.id, amount: order.amount, key_id: env.RAZORPAY_KEY_ID });
  } catch (e) {
    return json({ error: 'gateway' }, 502);
  }
}
