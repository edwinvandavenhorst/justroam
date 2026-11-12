// JustRoam availability proxy (slimmed down, November 2026).
// Deploy: paste this whole file into the Cloudflare Worker editor and deploy.
//
// What it does, and nothing more:
//   GET /ranger          busy days from the own (iCloud) Ranger calendar
//   GET /ranger-goboony  busy days from the Goboony calendar
//   GET /ranger-prices   day prices read from the public Goboony listing
//
// Privacy: calendar feeds are passed on as dates only. Titles, descriptions,
// locations, attendees and UIDs are dropped here, so whatever ends up in the
// source calendar (renter names, Gearhive booking details, holidays) never
// reaches the public.
//
// Required settings (Worker Settings -> Variables and Secrets), both secret:
//   CAL_RANGER    published iCal link of the own Ranger calendar
//   CAL_GOBOONY   iCal export link of the Goboony listing
// The links are secrets on purpose: anyone with a published calendar link can
// read the full calendar.
//
// The old booking system (requests, approvals, admin, Mollie, Brevo, CalDAV)
// has been removed. Old links to /booking/* or /admin* get a short notice.

const GOBOONY_LISTING_URL = 'https://www.goboony.nl/campers/nederland/zuid-holland/voorburg/92756';
const UA = { 'User-Agent': 'JustRoam-Availability-Worker' };

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

const SECURITY = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS });
        }

        if (path.startsWith('/booking') || path.startsWith('/admin') || path === '/login') {
            return gone();
        }

        if (request.method !== 'GET') {
            return text('Method not allowed', 405);
        }

        if (path === '/ranger') return calendar(env.CAL_RANGER);
        if (path === '/ranger-goboony') return calendar(env.CAL_GOBOONY);
        if (path === '/ranger-prices') return prices();

        return text('Not found', 404);
    }
};

function text(body, status) {
    return new Response(body, { status, headers: { ...CORS, ...SECURITY, 'Content-Type': 'text/plain; charset=utf-8' } });
}

function gone() {
    const html =
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="robots" content="noindex">' +
        '<title>JustRoam</title>' +
        '<style>body{font-family:-apple-system,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#2b1d12;line-height:1.5}h1{color:#2c5f2d;font-size:1.4rem}a{color:#2c5f2d}</style>' +
        '</head><body>' +
        '<h1>This page is no longer in use</h1>' +
        '<p>Bookings for our roof box and bike carrier now go through <a href="https://gearhive.nl">Gearhive</a>. Questions? Mail <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>' +
        '<p lang="nl">Deze pagina wordt niet meer gebruikt. Boekingen voor onze dakkoffer en fietsendrager lopen nu via Gearhive.</p>' +
        '</body></html>';
    return new Response(html, { status: 410, headers: { ...SECURITY, 'Content-Type': 'text/html; charset=utf-8' } });
}

// ---- Calendars, dates only ----

async function calendar(source) {
    if (!source) return text('Calendar not configured', 502);
    try {
        const upstream = await fetch(source, { headers: UA });
        if (!upstream.ok) return text('Upstream error: ' + upstream.status, 502);
        const ical = await upstream.text();
        if (!ical.includes('BEGIN:VCALENDAR')) return text('Not a calendar', 502);
        return new Response(datesOnly(ical), {
            headers: {
                ...CORS,
                ...SECURITY,
                'Content-Type': 'text/calendar; charset=utf-8',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (err) {
        return text('Fetch failed', 502);
    }
}

// Rebuilds the feed with one bare event per busy period: start and end date,
// nothing else. Date-times are cut back to their date.
function datesOnly(ical) {
    const unfolded = ical.replace(/\r?\n[ \t]/g, '');
    const out = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JustRoam//Availability//EN'];
    let n = 0;
    for (const block of unfolded.split('BEGIN:VEVENT').slice(1)) {
        const start = block.match(/^DTSTART[^:\r\n]*:(\d{8})/m);
        const end = block.match(/^DTEND[^:\r\n]*:(\d{8})/m);
        if (!start) continue;
        if (/^STATUS:CANCELLED/m.test(block)) continue;
        n++;
        out.push('BEGIN:VEVENT');
        out.push('UID:busy-' + n + '@justroam.nl');
        out.push('SUMMARY:Busy');
        out.push('DTSTART;VALUE=DATE:' + start[1]);
        out.push('DTEND;VALUE=DATE:' + (end ? end[1] : start[1]));
        out.push('END:VEVENT');
    }
    out.push('END:VCALENDAR');
    return out.join('\r\n') + '\r\n';
}

// ---- Ranger day prices, read from the public Goboony listing ----
// Goboony has no price feed, but the listing page carries the renter price in
// an inline script: a base_rate, and a custom_rate per day in a season. This
// reads page markup, so it answers 502 if Goboony restructures the page; the
// calendar on the site then shows no prices instead of wrong ones.

function parseGoboonyPrices(html) {
    const baseMatch = html.match(/base_rate\s*=\s*([\d.]+)/);
    if (!baseMatch) return null;
    const base = Math.round(parseFloat(baseMatch[1]));
    if (!isFinite(base) || base < 1 || base > 5000) return null;
    const days = {};
    const re = /custom_rate\s*=\s*([\d.]+);[\s\S]*?data-date="(\d{4}-\d{2}-\d{2})"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
        const rate = Math.round(parseFloat(m[1]));
        if (isFinite(rate) && rate >= 1 && rate <= 5000) days[m[2]] = rate;
    }
    return { base, days };
}

async function prices() {
    try {
        const upstream = await fetch(GOBOONY_LISTING_URL, { headers: UA, cf: { cacheTtl: 3600, cacheEverything: true } });
        if (!upstream.ok) return text('Upstream error: ' + upstream.status, 502);
        const data = parseGoboonyPrices(await upstream.text());
        if (!data) return text('Prices not found', 502);
        return new Response(JSON.stringify(data), {
            headers: {
                ...CORS,
                ...SECURITY,
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        return text('Fetch failed', 502);
    }
}
