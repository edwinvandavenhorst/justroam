import type { APIRoute } from 'astro';
import { INBOX, button, esc, h1, p, rows, send, shell } from '../../lib/email';

// "Keep me posted" for the JustRoam module. Two mails through Brevo, both in
// the language of the site the visitor used: a notification to JustRoam and
// a confirmation to the visitor. Nothing is stored. Needs BREVO_API_KEY.
export const prerender = false;

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const json = (body: object, status: number) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const text = {
    en: {
        kicker: 'JustRoam module',
        notifySubject: 'Interested in JustRoam module',
        notifyTitle: 'New interest in the module',
        notifyLine: (n: string) => `${n} would like to hear when the JustRoam module is ready.`,
        labels: ['Name', 'Email', 'Phone', 'Site'],
        noPhone: 'not given',
        mailBtn: (n: string) => `Email ${n}`,
        notifyFooter: 'Sent by the "Keep me posted" button on the build page of justroam.nl.',
        confirmSubject: 'We will keep you posted about the JustRoam module',
        thanks: (n: string) => `Thank you, ${n}`,
        onList: 'You are on the list. As soon as the JustRoam module is ready, you will be among the first to hear.',
        moduleT: 'The JustRoam module',
        moduleP: 'A complete camping unit with a slide-out kitchen, fridge, water, a second battery and storage, that slides in under the canopy you already have.',
        noWait: 'Do not want to wait? See what we already build into your vehicle.',
        buildBtn: 'See the build packages',
        buildUrl: 'https://justroam.nl/build.html',
        questions: 'Questions? Just reply to this email and it will reach us.',
        confirmFooter: 'You receive this email because you left your details on justroam.nl. We only use them to tell you about the module.<br>JustRoam &middot; Voorburg &middot; justroam.nl'
    },
    nl: {
        kicker: 'JustRoam-module',
        notifySubject: 'Interesse in de JustRoam-module',
        notifyTitle: 'Nieuwe interesse in de module',
        notifyLine: (n: string) => `${n} wil graag horen wanneer de JustRoam-module klaar is.`,
        labels: ['Naam', 'E-mail', 'Telefoon', 'Site'],
        noPhone: 'niet opgegeven',
        mailBtn: (n: string) => `Mail ${n}`,
        notifyFooter: 'Verstuurd via de knop "Houd me op de hoogte" op de ombouwpagina van justroam.nl.',
        confirmSubject: 'We houden je op de hoogte van de JustRoam-module',
        thanks: (n: string) => `Bedankt, ${n}`,
        onList: 'Je staat op de lijst. Zodra de JustRoam-module klaar is, hoor je het als een van de eersten.',
        moduleT: 'De JustRoam-module',
        moduleP: 'Een complete kampeerunit met uitschuifkeuken, koelkast, water, tweede accu en opbergruimte, die je onder de opbouw schuift die je al hebt.',
        noWait: 'Wil je niet wachten? Bekijk wat we nu al in je auto bouwen.',
        buildBtn: 'Bekijk de ombouwpakketten',
        buildUrl: 'https://justroam.nl/nl/build.html',
        questions: 'Vragen? Antwoord gewoon op deze mail, dan komt hij bij ons binnen.',
        confirmFooter: 'Je krijgt deze mail omdat je je gegevens achterliet op justroam.nl. We gebruiken ze alleen om je over de module te informeren.<br>JustRoam &middot; Voorburg &middot; justroam.nl'
    }
};

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
    const lang = data.lang === 'nl' ? 'nl' : 'en';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false }, 400);
    if (!process.env.BREVO_API_KEY) {
        console.error('module-interest: BREVO_API_KEY is not set');
        return json({ ok: false }, 503);
    }

    const t = text[lang];
    const n = esc(name);
    const first = esc(name.split(' ')[0]);

    const notify = shell(
        `<p style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2c5f2d; margin: 0 0 6px;">${t.kicker}</p>
        ${h1(t.notifyTitle)}
        ${p(t.notifyLine(n))}
        ${rows([[t.labels[0], n], [t.labels[1], esc(email)], [t.labels[2], phone ? esc(phone) : t.noPhone], [t.labels[3], lang.toUpperCase()]])}
        ${button(`mailto:${encodeURIComponent(email)}`, t.mailBtn(first))}`,
        t.notifyFooter,
        lang
    );

    const confirm = shell(
        `${h1(t.thanks(first))}
        ${p(t.onList, ' margin-bottom: 14px;')}
        <div style="background: #f1dfbd; border-radius: 10px; padding: 14px 16px; margin: 0 0 18px;">
          <p style="font-size: 12px; font-weight: 700; color: #421c04; margin: 0 0 4px;">${t.moduleT}</p>
          <p style="font-size: 12.5px; color: #2b1d12; line-height: 1.55; margin: 0;">${t.moduleP}</p>
        </div>
        ${p(t.noWait)}
        ${button(t.buildUrl, t.buildBtn)}
        <p style="font-size: 12px; color: #6e5f4f; line-height: 1.6; margin: 20px 0 0;">${t.questions}</p>`,
        t.confirmFooter,
        lang
    );

    try {
        const sent = await send({ to: { email: INBOX }, subject: t.notifySubject, html: notify, replyTo: { email, name } });
        if (!sent) return json({ ok: false }, 502);
        // the confirmation is a courtesy: if it fails, the interest still reached JustRoam
        await send({ to: { email, name }, subject: t.confirmSubject, html: confirm, replyTo: { email: INBOX, name: 'JustRoam' } });
        return json({ ok: true }, 200);
    } catch (err) {
        console.error('module-interest: send failed', err);
        return json({ ok: false }, 502);
    }
};
