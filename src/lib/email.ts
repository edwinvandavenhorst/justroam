// JustRoam e-mail: one card layout for every mail (after the Gearhive
// templates, in JustRoam colours) and a Brevo send. Text per language
// lives with each mail; this file only knows the frame.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Mail clients can only show images from a public address, and staging is
// behind a login. This logo is already on the live site; after the cutover
// a small dedicated email logo can replace it.
const LOGO_URL = 'https://justroam.nl/images/Logo_JustRoam_ClearBackground.png';

export const FROM = { name: 'JustRoam', email: process.env.MAIL_FROM || 'info@justroam.nl' };
export const INBOX = process.env.NOTIFY_TO || 'info@justroam.nl';

// Vercel sets VERCEL_ENV per deployment; anything but production is a test
const IS_TEST = process.env.VERCEL_ENV !== 'production';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const testBanner = (lang: 'en' | 'nl') => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto 12px; background: #fde68a; color: #713f12; padding: 10px 14px; font-size: 12.5px; line-height: 1.5; border-radius: 8px; border: 2px dashed #b45309;">
    <strong style="font-size: 11px; letter-spacing: 0.08em;">TEST &middot; STAGING</strong><br>
    ${lang === 'nl' ? 'Deze mail komt van de testsite van JustRoam (staging.justroam.nl).' : 'This email comes from the JustRoam test site (staging.justroam.nl).'}
  </div>`;

/** The card: header with logo, white body, small footer line. */
export function shell(inner: string, footer: string, lang: 'en' | 'nl'): string {
    return `${IS_TEST ? testBanner(lang) : ''}
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto;">
    <div style="background: #f5e6c8; padding: 14px 20px; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" width="128" height="72" alt="JustRoam" style="display: block;">
    </div>
    <div style="background: #ffffff; border: 1px solid #e6d8bf; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
      ${inner}
      <p style="font-size: 11px; color: #9a8463; line-height: 1.5; margin: 22px 0 0; border-top: 1px solid #efe4d0; padding-top: 12px;">${footer}</p>
    </div>
  </div>`;
}

export const h1 = (t: string) => `<h1 style="font-size: 18px; color: #421c04; margin: 0 0 12px;">${t}</h1>`;
export const p = (t: string, extra = '') => `<p style="font-size: 13px; color: #2b1d12; line-height: 1.6; margin: 0 0 16px;${extra}">${t}</p>`;
export const button = (href: string, label: string) =>
    `<a href="${href}" style="display: inline-block; background: #2c5f2d; color: #ffffff; font-weight: 700; font-size: 13px; padding: 11px 20px; border-radius: 999px; text-decoration: none;">${label}</a>`;

/** Rows of label and value, on a light sand background. */
export function rows(list: [string, string][]): string {
    const tr = list.map(([k, v], i) => {
        const line = i < list.length - 1 ? ' border-bottom: 1px solid #efe4d0;' : '';
        return `<tr><td style="padding: 9px 12px; color: #6e5f4f; width: 110px;${line}">${k}</td><td style="padding: 9px 12px; color: #2b1d12; font-weight: 700;${line}">${v}</td></tr>`;
    }).join('');
    return `<table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 0 0 18px; background: #fbf6ec; border-radius: 8px;">${tr}</table>`;
}

export async function send(args: { to: { email: string; name?: string }; subject: string; html: string; replyTo?: { email: string; name?: string } }): Promise<boolean> {
    const key = process.env.BREVO_API_KEY;
    if (!key) {
        console.error(`email: BREVO_API_KEY is not set, not sent: "${args.subject}"`);
        return false;
    }
    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
            sender: FROM,
            to: [args.to],
            subject: IS_TEST ? `[TEST] ${args.subject}` : args.subject,
            htmlContent: args.html,
            ...(args.replyTo ? { replyTo: args.replyTo } : {})
        })
    });
    if (!res.ok) console.error(`email: Brevo answered ${res.status} for "${args.subject}":`, await res.text());
    return res.ok;
}
