// POST /api/verify
//  After checkout: { order_id, payment_id, signature, product, key }
//  Recovery:       { payment_id, key }   (same birth details, payment ID from the Razorpay receipt)
// -> { payment_id, product, token, email }
import { json, hmacHex, safeEqual, unlockToken, validKey, paidOrder } from '../../lib/rv-pay.js';

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: 'not_configured' }, 503);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const pid = String(b.payment_id || '');
  if (!/^pay_[A-Za-z0-9]{6,30}$/.test(pid) || !validKey(b.key)) return json({ error: 'bad_input' }, 400);
  if (b.signature) {
    const expect = await hmacHex(env.RAZORPAY_KEY_SECRET, `${b.order_id}|${pid}`);
    if (!safeEqual(expect, String(b.signature))) return json({ error: 'bad_signature' }, 400);
  }
  try {
    const paid = await paidOrder(env, pid);
    if (!paid || paid.notes.key !== b.key || (b.signature && paid.order.id !== b.order_id)) return json({ error: 'not_found' }, 404);
    const product = paid.notes.product;
    return json({ payment_id: pid, product, token: await unlockToken(env, pid, product, b.key), email: paid.notes.email || paid.pay.email || '' });
  } catch (e) {
    return json({ error: 'not_found' }, 404);
  }
}
