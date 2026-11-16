import type { APIRoute } from 'astro';

// "Keep me posted" for the JustRoam module. Sends Edwin an email through
// Brevo; nothing is stored. Needs BREVO_API_KEY in the Vercel project.
// NOTIFY_TO and MAIL_FROM are optional (both default to info@justroam.nl;
// the sender must be a verified sender in Brevo).
export const prerender = false;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const json = (body: object, status: number) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
    let data: Record<string, unknown>;
    try {
        data = await request.json();
    } catch {
        return json({ ok: false }, 400);
    }

    // honeypot: people never fill this field, bots often do
    if (clean(data.website, 100)) return json({ ok: true }, 200);

    const name = clean(data.name, 100);
    const email = clean(data.email, 200);
    const phone = clean(data.phone, 40);
    const lang = data.lang === 'nl' ? 'NL' : 'EN';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false }, 400);

    const key = process.env.BREVO_API_KEY;
    if (!key) {
        console.error('module-interest: BREVO_API_KEY is not set');
        return json({ ok: false }, 503);
    }
    const to = process.env.NOTIFY_TO || 'info@justroam.nl';
    const from = process.env.MAIL_FROM || 'info@justroam.nl';

    const text = [
        `${name} would like to hear when the JustRoam module is ready.`,
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || '(not given)'}`,
        `Site language: ${lang}`,
        '',
        `If you reply to this email, your answer goes straight to ${name}.`
    ].join('\n');

    try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({
                sender: { name: 'JustRoam website', email: from },
                to: [{ email: to }],
                replyTo: { email, name },
                subject: 'Interested in JustRoam module',
                textContent: text
            })
        });
        if (!res.ok) {
            console.error('module-interest: Brevo answered', res.status, await res.text());
            return json({ ok: false }, 502);
        }
        return json({ ok: true }, 200);
    } catch (err) {
        console.error('module-interest: send failed', err);
        return json({ ok: false }, 502);
    }
};
