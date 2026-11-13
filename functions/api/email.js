// POST /api/email { payment_id, product, key, token, email, lang, name, title, filename, pdf (base64) }
// Emails the PDF made in the browser. Only to the address on the order or the Razorpay payment,
// at most MAX_EMAILS times per payment, so it cannot be used to send mail to strangers.
import { json, safeEqual, unlockToken, validKey, paidOrder, rzp, MAX_EMAILS } from '../../lib/rv-pay.js';

const clean = (s, n) => String(s || '').replace(/[\r\n<>]/g, ' ').slice(0, n);

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_SECRET || !env.RESEND_API_KEY || !env.MAIL_FROM) return json({ error: 'not_configured' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 12e6) return json({ error: 'too_large' }, 413);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'bad_json' }, 400); }
  const pid = String(b.payment_id || '');
  if (!/^pay_[A-Za-z0-9]{6,30}$/.test(pid) || !validKey(b.key) || typeof b.pdf !== 'string' || !b.pdf.startsWith('JVBERi0')) return json({ error: 'bad_input' }, 400);
  if (!safeEqual(await unlockToken(env, pid, String(b.product), b.key), String(b.token || ''))) return json({ error: 'bad_token' }, 403);
  let paid;
  try { paid = await paidOrder(env, pid); } catch (e) { return json({ error: 'gateway' }, 502); }
  if (!paid || paid.notes.key !== b.key) return json({ error: 'not_found' }, 404);
  const allowed = [paid.notes.email, paid.pay.email].filter(Boolean).map((e) => e.toLowerCase());
  const to = String(b.email || '').toLowerCase();
  if (!allowed.includes(to)) return json({ error: 'email_mismatch' }, 403);
  const sent = Number((paid.pay.notes && paid.pay.notes.mailed) || 0);
  if (sent >= MAX_EMAILS) return json({ error: 'limit' }, 429);

  const title = clean(b.title, 80) || 'Your RasiVani report';
  const name = clean(b.name, 60);
  const site = new URL(request.url).origin;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#23163f">
    <p>Namaste${name ? ' ' + name : ''},</p>
    <p>Thank you for your order. Your <strong>${title}</strong> is attached as a PDF.</p>
    <p>You can also reopen it any time at <a href="${site}/reports.html">${site}/reports.html</a> → "Already paid?" with payment ID <strong>${pid}</strong> and the same birth details.</p>
    <p style="color:#6b5f7a;font-size:13px">Astrology is a traditional belief system, not science. Please use this report as cultural guidance only.<br>
    Questions or a delivery problem? Reply to this email${env.SUPPORT_EMAIL ? ` or write to ${env.SUPPORT_EMAIL}` : ''}.</p>
    <p>— RasiVani</p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM, to: [to], reply_to: env.SUPPORT_EMAIL || undefined,
      subject: `${title} – RasiVani`, html,
      attachments: [{ filename: clean(b.filename, 80).replace(/[^\p{L}\p{N}._-]/gu, '-') || 'RasiVani-report.pdf', content: b.pdf }]
    })
  });
  if (!res.ok) return json({ error: 'mail_failed' }, 502);
  try { await rzp(env, 'PATCH', `/payments/${pid}`, { notes: Object.assign({}, paid.pay.notes || {}, { mailed: String(sent + 1) }) }); } catch (e) { /* count is best effort */ }
  return json({ ok: true });
}
