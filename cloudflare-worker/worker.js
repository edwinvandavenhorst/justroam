// JustRoam - availability proxy + booking request/approve/reject/manage + admin dashboard + Mollie payments
// Deploy: paste this whole file into the Cloudflare Worker editor and deploy.
// Required bindings (Worker Settings -> Variables and Secrets):
//   BREVO_API_KEY     (secret)      - Brevo transactional email API key
//   ADMIN_EMAIL       (plain text)  - where new-request notifications are sent
//   ADMIN_USERNAME    (secret)      - admin dashboard sign-in username
//   ADMIN_PASSWORD    (secret)      - admin dashboard sign-in password
//   MOLLIE_API_KEY    (secret)      - Mollie payments API key
//   BOOKINGS          (KV namespace binding)
//
// Note: amounts entered in the admin dashboard / paid via Mollie become part
// of your income/VAT records. This Worker computes net/VAT/gross from what
// is entered, but it is not a substitute for proper bookkeeping - reconcile
// against your own records / accountant before filing.
//
// Payments: rental fee + refundable deposit are charged together as ONE
// Mollie payment (to minimise per-transaction fees). The deposit is refunded
// - in full, or reduced for damage - as a single refund against that same
// payment. Only the rental fee (plus any deposit you keep for damage) counts
// toward income/VAT; the refunded portion never does. Refunds are never
// issued automatically - you always type the amount and click the button
// yourself in this dashboard. Cancellation fees follow the same pattern:
// you're notified of the policy tier and process any refund yourself.

const CALENDARS = {
    roofbox: 'https://p149-caldav.icloud.com/published/2/MTEwOTM1MjI5NTExMDkzNY70qKIvNyg31YIFZnfGOz4ZqFztE59SUolnlYU9kiNQr0rvKpNBQwrSPXH4NyUlipVDUgkKwO2Rf1hdpkNtTi0',
    carrier: 'https://p149-caldav.icloud.com/published/2/MTEwOTM1MjI5NTExMDkzNY70qKIvNyg31YIFZnfGOz5hBELvF4dNteHFXFrNHmg-AiAY7SExJ5S84WFl1tHyB_8KJJham0pokNyo-SxAgc4',
    ranger: 'https://p149-caldav.icloud.com/published/2/MTEwOTM1MjI5NTExMDkzNY70qKIvNyg31YIFZnfGOz4OAX7ZZYYoJwnziPCkHBSlPLp2FHiZYWs_ZI-_0DEg4d_0IUaVj8HBauNausIGS8c',
    'ranger-goboony': 'https://www.goboony.nl/icalendars/izFii1B6KiwSCdiDyu7rVwcJ.ics'
};

const BASE_URL = 'https://justroam-availability.edwinvandavenhorst.workers.dev';
const MIN_FORM_FILL_MS = 3000; // reject submissions faster than this - likely a bot
const VAT_RATE = 0.21;

// Fallback rate card, used only if no card has been added yet in the admin
// dashboard (Rate cards page). Matches the rates published on rent-gear.html
// at the time this Worker was written. Tiers are tried largest-first, with
// any leftover days charged at the daily rate. Weekend = Friday pickup,
// Sunday afternoon return (exactly 3 days, Fri/Sat/Sun).
const DEFAULT_RATE_CARD = {
    effectiveFrom: '2000-01-01',
    roofbox: { day: 9, weekend: 20, deposit: 250, tiers: [{ days: 21, price: 110 }, { days: 14, price: 80 }, { days: 7, price: 45 }] },
    carrier: { day: 8, weekend: 20, deposit: 250, tiers: [{ days: 7, price: 40 }] },
    bundle: { day: 15, weekend: 40, deposit: 400, tiers: [{ days: 7, price: 75 }] }
};

function itemKey(item) {
    if (item === 'Roof box') return 'roofbox';
    if (item === 'Bike carrier') return 'carrier';
    if (item === 'Bundle') return 'bundle';
    return null;
}

// Display-only translation of the item name. The stored booking.item value
// itself always stays English ('Roof box' / 'Bike carrier' / 'Bundle') since
// itemKey() and admin tooling match against it literally.
function localizedItem(item, locale) {
    if (locale === 'nl') {
        if (item === 'Roof box') return 'Dakkoffer';
        if (item === 'Bike carrier') return 'Fietsendrager';
        if (item === 'Bundle') return 'Bundel';
    }
    return item;
}

async function getRateCards(env) {
    const list = await env.BOOKINGS.list({ prefix: 'ratecard:' });
    const cards = [];
    for (const key of list.keys) {
        const raw = await env.BOOKINGS.get(key.name);
        if (raw) cards.push(JSON.parse(raw));
    }
    cards.sort(function (a, b) { return a.effectiveFrom.localeCompare(b.effectiveFrom); });
    return cards;
}

async function getActiveRateCard(env, dateStr) {
    const cards = await getRateCards(env);
    let active = DEFAULT_RATE_CARD;
    cards.forEach(function (card) {
        if (card.effectiveFrom <= dateStr) active = card;
    });
    return active;
}

function calcSingleItemFee(itemCard, days, isWeekendPattern) {
    if (isWeekendPattern) return itemCard.weekend;
    const tiersDesc = itemCard.tiers.slice().sort(function (a, b) { return b.days - a.days; });
    let remaining = days;
    let total = 0;
    tiersDesc.forEach(function (tier) {
        while (remaining >= tier.days) {
            total += tier.price;
            remaining -= tier.days;
        }
    });
    total += remaining * itemCard.day;
    return total;
}

function calcRentalFee(item, startDate, endDate, card) {
    const key = itemKey(item);
    if (!key || !card[key]) return null;
    const itemCard = card[key];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.round((end - start) / 86400000) + 1;
    if (days <= 0) return null;

    const isWeekendPattern = days === 3 && start.getDay() === 5 && end.getDay() === 0;
    let total = calcSingleItemFee(itemCard, days, isWeekendPattern);

    // Safety net: the bundle should never cost more than renting both items
    // separately, even if the rate card is ever filled in inconsistently.
    if (key === 'bundle' && card.roofbox && card.carrier) {
        const separateTotal = calcSingleItemFee(card.roofbox, days, isWeekendPattern) + calcSingleItemFee(card.carrier, days, isWeekendPattern);
        total = Math.min(total, separateTotal);
    }

    return { days: days, isWeekend: isWeekendPattern, rentalFee: Math.round(total * 100) / 100, depositAmount: itemCard.deposit };
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method === 'POST' && path === '/booking/request') {
            return handleBookingRequest(request, env, corsHeaders);
        }

        if (request.method === 'GET' && path === '/booking/approve') {
            return handleBookingDecision(url.searchParams.get('id'), url.searchParams.get('token'), env, corsHeaders, 'approved', null);
        }

        if (request.method === 'GET' && path === '/booking/reject') {
            return handleRejectForm(url, env, corsHeaders);
        }

        if (request.method === 'POST' && path === '/booking/reject') {
            return handleRejectSubmit(request, env, corsHeaders);
        }

        if (request.method === 'GET' && path === '/booking/agreement') {
            return handleBookingAgreement(url, env, corsHeaders);
        }

        if (request.method === 'GET' && path === '/booking/manage') {
            return handleBookingManage(url, env, corsHeaders);
        }

        if (request.method === 'POST' && path === '/booking/manage') {
            return handleBookingManageSubmit(request, env, corsHeaders);
        }

        if (request.method === 'POST' && path === '/booking/cancel') {
            return handleRenterCancel(request, env, corsHeaders);
        }

        if (request.method === 'POST' && path === '/booking/retry-payment') {
            return handleRetryPayment(request, env, corsHeaders);
        }

        if (request.method === 'POST' && path === '/booking/mollie-webhook') {
            return handleMollieWebhook(request, env, corsHeaders);
        }

        if (path === '/admin' || path.startsWith('/admin/')) {
            if (!checkAdminAuth(request, env)) {
                return requireAdminAuth();
            }
            if (request.method === 'GET' && path === '/admin') {
                return handleAdminDashboard(url, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/complete') {
                return handleAdminComplete(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/cancel') {
                return handleAdminCancel(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/edit') {
                return handleAdminEdit(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/archive') {
                return handleAdminArchive(request, env, corsHeaders, true);
            }
            if (request.method === 'POST' && path === '/admin/unarchive') {
                return handleAdminArchive(request, env, corsHeaders, false);
            }
            if (request.method === 'POST' && path === '/admin/delete') {
                return handleAdminDelete(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/send-payment') {
                return handleAdminSendPayment(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/refund-deposit') {
                return handleAdminRefundDeposit(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/approve') {
                return handleAdminApprove(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/reject') {
                return handleAdminReject(request, env, corsHeaders);
            }
            if (request.method === 'GET' && path === '/admin/rate-cards') {
                return handleAdminRateCardsPage(env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/rate-cards/create') {
                return handleAdminRateCardsCreate(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/rate-cards/delete') {
                return handleAdminRateCardsDelete(request, env, corsHeaders);
            }
            if (request.method === 'POST' && path === '/admin/save-id') {
                return handleAdminSaveId(request, env, corsHeaders);
            }
        }

        if (request.method === 'GET') {
            const key = path.replace(/^\//, '');
            const target = CALENDARS[key];
            if (target) {
                return fetchCalendar(target, corsHeaders, key, env);
            }
        }

        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
};

// Roof box / bike carrier requests we've received but not yet approved or
// rejected should already block the dates on the public calendar, the same
// as confirmed (approved) bookings - otherwise two people could request the
// same dates before we get to review the first one.
const ITEM_FOR_CALENDAR_KEY = { roofbox: 'Roof box', carrier: 'Bike carrier' };

async function buildPendingBookingVEvents(env, item) {
    const list = await env.BOOKINGS.list({ prefix: 'booking:' });
    const lines = [];
    for (const key of list.keys) {
        const raw = await env.BOOKINGS.get(key.name);
        if (!raw) continue;
        const b = JSON.parse(raw);
        if (b.status !== 'pending' && b.status !== 'approved') continue;
        if (!itemsConflict(item, b.item)) continue;
        const dtStart = b.startDate.replace(/-/g, '');
        const dtEndExclusive = new Date(b.endDate);
        dtEndExclusive.setDate(dtEndExclusive.getDate() + 1);
        const dtEnd = dtEndExclusive.toISOString().slice(0, 10).replace(/-/g, '');
        lines.push('BEGIN:VEVENT');
        lines.push('UID:justroam-booking-' + b.id);
        lines.push('SUMMARY:JustRoam booking (' + b.status + ')');
        lines.push('DTSTART;VALUE=DATE:' + dtStart);
        lines.push('DTEND;VALUE=DATE:' + dtEnd);
        lines.push('END:VEVENT');
    }
    return lines;
}

async function fetchCalendar(target, corsHeaders, calendarKey, env) {
    try {
        const upstream = await fetch(target, {
            headers: { 'User-Agent': 'JustRoam-Availability-Worker' }
        });
        if (!upstream.ok) {
            return new Response('Upstream error: ' + upstream.status, {
                status: 502,
                headers: corsHeaders
            });
        }
        let text = await upstream.text();

        const item = ITEM_FOR_CALENDAR_KEY[calendarKey];
        if (item) {
            const extraLines = await buildPendingBookingVEvents(env, item);
            if (extraLines.length > 0) {
                text = text.replace(/END:VCALENDAR\s*$/, extraLines.join('\r\n') + '\r\nEND:VCALENDAR\r\n');
            }
        }

        return new Response(text, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/calendar; charset=utf-8',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (err) {
        return new Response('Fetch failed: ' + err.message, {
            status: 502,
            headers: corsHeaders
        });
    }
}

// ---- Anti-bot + conflict helpers ----

function itemsConflict(a, b) {
    if (a === b) return true;
    if (a === 'Bundle' || b === 'Bundle') return true;
    return false;
}

async function hasOverlappingBooking(env, item, startDate, endDate, excludeId) {
    const list = await env.BOOKINGS.list({ prefix: 'booking:' });
    for (const key of list.keys) {
        const id = key.name.slice('booking:'.length);
        if (id === excludeId) continue;
        const raw = await env.BOOKINGS.get(key.name);
        if (!raw) continue;
        const b = JSON.parse(raw);
        if (b.status !== 'pending' && b.status !== 'approved') continue;
        if (!itemsConflict(b.item, item)) continue;
        const overlap = startDate <= b.endDate && endDate >= b.startDate;
        if (overlap) return true;
    }
    return false;
}

// Length-based checks per country - not full carrier-pattern validation, just
// enough to catch obvious typos. NL mobiles are reliably 9 digits; BE numbers
// are 8 (landline) or 9 (mobile) digits; DE numbering is far less uniform
// (area codes vary 2-5 digits), so it's kept deliberately lenient.
function isValidPhone(countryCode, localNumber) {
    const digits = String(localNumber || '').replace(/\D/g, '');
    if (countryCode === '+31') return digits.length === 9;
    if (countryCode === '+32') return digits.length === 8 || digits.length === 9;
    if (countryCode === '+49') return digits.length >= 6 && digits.length <= 11;
    return digits.length >= 6 && digits.length <= 12;
}

const SUPPORTED_COUNTRIES = ['Netherlands', 'Belgium', 'Germany'];

async function findBookingByMolliePaymentId(env, paymentId) {
    const list = await env.BOOKINGS.list({ prefix: 'booking:' });
    for (const key of list.keys) {
        const raw = await env.BOOKINGS.get(key.name);
        if (!raw) continue;
        const b = JSON.parse(raw);
        if (b.molliePaymentId === paymentId) {
            return { key: key.name, booking: b };
        }
    }
    return null;
}

// ---- Booking number (YY### per year, starting at 100) ----

async function getNextBookingNumber(env, date) {
    const year = date.getFullYear();
    const yy = String(year).slice(-2);
    const counterKey = 'counter:' + year;
    const raw = await env.BOOKINGS.get(counterKey);
    const next = raw ? parseInt(raw, 10) : 100;
    await env.BOOKINGS.put(counterKey, String(next + 1));
    return yy + String(next);
}

// ---- Cancellation policy ----
// Pending: always free. Approved: free if >=7 days to pickup, 50% if 2-6 days,
// 80% if <2 days. After the pickup date: not possible via self-service.
function getCancellationPolicy(booking) {
    const locale = booking.locale === 'nl' ? 'nl' : 'en';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.startDate);
    const daysUntil = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));

    if (booking.status === 'pending') {
        return { eligible: true, feePercent: 0, reason: locale === 'nl' ? 'Je aanvraag is nog niet geaccepteerd, dus annuleren is gratis.' : 'Your request hasn\'t been approved yet, so cancelling is free.' };
    }
    if (booking.status !== 'approved') {
        return { eligible: false, reason: locale === 'nl' ? 'Deze boeking kan hier niet worden geannuleerd.' : 'This booking is not in a state that can be cancelled here.' };
    }
    if (daysUntil < 0) {
        return { eligible: false, reason: locale === 'nl' ? 'De ophaaldatum is al verstreken, dus dit kan hier niet meer worden geannuleerd.' : 'The pickup date has already passed, so this can no longer be cancelled here.' };
    }
    if (daysUntil >= 7) {
        return { eligible: true, feePercent: 0, reason: locale === 'nl' ? 'Meer dan een week voor het ophalen, dus annuleren is gratis.' : 'More than a week before pickup, so cancelling is free.' };
    }
    if (daysUntil >= 2) {
        return { eligible: true, feePercent: 50, reason: locale === 'nl' ? 'Minder dan een week maar meer dan 48 uur voor het ophalen, dus er geldt een annuleringskosten van 50%.' : 'Less than a week but more than 48 hours before pickup, so a 50% cancellation fee applies.' };
    }
    return { eligible: true, feePercent: 80, reason: locale === 'nl' ? 'Minder dan 48 uur voor het ophalen, dus er geldt een annuleringskosten van 80%.' : 'Less than 48 hours before pickup, so an 80% cancellation fee applies.' };
}

function cancelSection(id, token, policy, locale) {
    if (!policy.eligible) {
        return '<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-lighter);">' +
            '<h2>' + (locale === 'nl' ? 'Boeking annuleren' : 'Cancel this booking') + '</h2>' +
            '<p>' + escapeHtml(policy.reason) + '</p>' +
            '<p>' + (locale === 'nl' ? 'Neem contact op via' : 'Please contact') + ' <a href="mailto:info@justroam.nl">info@justroam.nl</a>' + (locale === 'nl' ? ' als je wilt annuleren.' : ' if you need to cancel.') + '</p>' +
            '</div>';
    }
    if (locale === 'nl') {
        const feeText = policy.feePercent === 0 ? 'gratis' : ('met <strong>' + policy.feePercent + '%</strong> annuleringskosten');
        const confirmMsg = policy.feePercent === 0
            ? 'Deze boeking annuleren?'
            : 'Deze boeking annuleren? Er geldt ' + policy.feePercent + '% annuleringskosten volgens ons beleid.';
        return '<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-lighter);">' +
            '<h2>Boeking annuleren</h2>' +
            '<p>Volgens ons annuleringsbeleid kun je ' + feeText + ' annuleren.</p>' +
            '<form method="POST" action="/booking/cancel" onsubmit="return confirm(&quot;' + confirmMsg + '&quot;);">' +
            '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
            '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
            '<button type="submit" class="btn btn-primary" style="background:#c62828;">Boeking annuleren</button>' +
            '</form>' +
            '</div>';
    }
    const feeText = policy.feePercent === 0 ? 'free of charge' : ('with a <strong>' + policy.feePercent + '%</strong> cancellation fee');
    const confirmMsg = policy.feePercent === 0
        ? 'Cancel this booking?'
        : 'Cancel this booking? A ' + policy.feePercent + '% cancellation fee will apply per our policy.';
    return '<div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-lighter);">' +
        '<h2>Cancel this booking</h2>' +
        '<p>Based on our cancellation policy, you can cancel ' + feeText + '.</p>' +
        '<form method="POST" action="/booking/cancel" onsubmit="return confirm(&quot;' + confirmMsg + '&quot;);">' +
        '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
        '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
        '<button type="submit" class="btn btn-primary" style="background:#c62828;">Cancel booking</button>' +
        '</form>' +
        '</div>';
}

// ---- Mollie ----

async function createMolliePayment(env, booking, amount) {
    const response = await fetch('https://api.mollie.com/v2/payments', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + env.MOLLIE_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: { currency: 'EUR', value: amount.toFixed(2) },
            description: 'JustRoam rental #' + (booking.bookingNumber || booking.id) + ' - ' + booking.item,
            redirectUrl: 'https://justroam.nl/booking/?id=' + booking.id + '&token=' + booking.renterToken,
            webhookUrl: BASE_URL + '/booking/mollie-webhook'
        })
    });
    if (!response.ok) {
        const errText = await response.text();
        console.error('Mollie create payment failed:', response.status, errText);
        return { error: true, status: response.status, body: errText };
    }
    return response.json();
}

async function createMollieRefund(env, paymentId, amount) {
    const response = await fetch('https://api.mollie.com/v2/payments/' + paymentId + '/refunds', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + env.MOLLIE_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: { currency: 'EUR', value: amount.toFixed(2) }
        })
    });
    if (!response.ok) {
        const errText = await response.text();
        console.error('Mollie refund failed:', response.status, errText);
        return null;
    }
    return response.json();
}

async function handleMollieWebhook(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid', { status: 400, headers: corsHeaders });
    }
    const paymentId = (form.get('id') || '').toString();
    if (!paymentId) {
        return new Response('Missing id', { status: 400, headers: corsHeaders });
    }

    // Mollie's webhook body is just a ping - always re-fetch the payment from
    // Mollie's own API to get the verified, authoritative status.
    let payment;
    try {
        const resp = await fetch('https://api.mollie.com/v2/payments/' + paymentId, {
            headers: { 'Authorization': 'Bearer ' + env.MOLLIE_API_KEY }
        });
        if (!resp.ok) {
            return new Response('OK', { headers: corsHeaders });
        }
        payment = await resp.json();
    } catch (err) {
        return new Response('OK', { headers: corsHeaders });
    }

    const found = await findBookingByMolliePaymentId(env, paymentId);
    if (!found) {
        return new Response('OK', { headers: corsHeaders });
    }

    if (payment.status === 'paid' && !found.booking.paid) {
        found.booking.paid = true;
        found.booking.paidAt = new Date().toISOString();
        await env.BOOKINGS.put(found.key, JSON.stringify(found.booking));

        const depositLine = found.booking.depositAmount
            ? '<p><strong>Includes deposit:</strong> &euro;' + Number(found.booking.depositAmount).toFixed(2) + ' (refundable)</p>'
            : '';

        await sendEmail(env, env.ADMIN_EMAIL, 'Payment received - booking #' + (found.booking.bookingNumber || ''),
            '<h2>Payment received</h2>' +
            '<p><strong>' + escapeHtml(found.booking.renterName) + '</strong>, ' + escapeHtml(found.booking.item) + '</p>' +
            '<p>' + escapeHtml(found.booking.startDate) + ' to ' + escapeHtml(found.booking.endDate) + '</p>' +
            '<p><strong>Rental fee:</strong> &euro;' + Number(found.booking.quotedAmount || 0).toFixed(2) + '</p>' +
            depositLine
        );
    }

    return new Response('OK', { headers: corsHeaders });
}

// ---- Admin auth ----

function checkAdminAuth(request, env) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Basic ')) return false;
    let decoded;
    try {
        decoded = atob(auth.slice(6));
    } catch (err) {
        return false;
    }
    const idx = decoded.indexOf(':');
    if (idx === -1) return false;
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    return user === env.ADMIN_USERNAME && pass === env.ADMIN_PASSWORD;
}

function requireAdminAuth() {
    return new Response('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="JustRoam Admin"' }
    });
}

// ---- Booking request (new submission) ----

async function handleBookingRequest(request, env, corsHeaders) {
    const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    let data;
    try {
        data = await request.json();
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    // Honeypot: real users never see or fill this field. If it's filled, it's a bot,
    // pretend success so the bot doesn't learn it was caught, but do nothing.
    if (data.website) {
        return new Response(JSON.stringify({ ok: true, id: 'noop' }), { headers: jsonHeaders });
    }

    // Timing check: bots tend to submit near-instantly after the page loads.
    const elapsed = Date.now() - Number(data.formLoadedAt || 0);
    if (!data.formLoadedAt || elapsed < MIN_FORM_FILL_MS) {
        return new Response(JSON.stringify({ ok: true, id: 'noop' }), { headers: jsonHeaders });
    }

    const locale = data.locale === 'nl' ? 'nl' : 'en';

    const required = ['item', 'startDate', 'endDate', 'name', 'email', 'phone', 'street', 'houseNumber', 'postcode', 'city', 'country'];
    for (const field of required) {
        if (!data[field]) {
            return new Response(JSON.stringify({ error: 'Missing field: ' + field }), {
                status: 400,
                headers: jsonHeaders
            });
        }
    }

    if (!SUPPORTED_COUNTRIES.includes(data.country)) {
        const message = locale === 'nl'
            ? 'We verwerken aanvragen automatisch alleen voor Nederland, België en Duitsland. Mail ons op info@justroam.nl voor een handmatige boeking.'
            : 'We currently only process bookings automatically for the Netherlands, Belgium and Germany. Please email info@justroam.nl for a manual booking.';
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    const fullAddress = data.street + ' ' + data.houseNumber + (data.addition ? '/' + data.addition : '') +
        ', ' + data.postcode + ' ' + data.city + ', ' + data.country;

    if (data.phone && !isValidPhone(data.phoneCountry, data.phone)) {
        const message = locale === 'nl' ? 'Vul een geldig telefoonnummer in.' : 'Please enter a valid phone number.';
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    if (new Date(data.endDate) < new Date(data.startDate)) {
        const message = locale === 'nl' ? 'De einddatum moet op of na de startdatum liggen.' : 'End date must be on or after the start date.';
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: jsonHeaders
        });
    }

    const conflict = await hasOverlappingBooking(env, data.item, data.startDate, data.endDate, null);
    if (conflict) {
        const message = locale === 'nl'
            ? 'Helaas overlappen deze data met een bestaande boeking. Kies andere data of neem contact op via info@justroam.nl.'
            : 'Sorry, those dates overlap with an existing booking. Please pick different dates or contact info@justroam.nl.';
        return new Response(JSON.stringify({ error: 'overlap', message: message }), {
            status: 409,
            headers: jsonHeaders
        });
    }

    const id = crypto.randomUUID();
    const adminToken = crypto.randomUUID();
    const renterToken = crypto.randomUUID();
    const fullPhone = data.phone ? (data.phoneCountry || '+31') + ' ' + data.phone : '';
    const now = new Date();
    const bookingNumber = await getNextBookingNumber(env, now);

    const rateCard = await getActiveRateCard(env, data.startDate);
    const fee = calcRentalFee(data.item, data.startDate, data.endDate, rateCard);

    const booking = {
        id: id,
        bookingNumber: bookingNumber,
        status: 'pending',
        archived: false,
        paid: false,
        item: data.item,
        startDate: data.startDate,
        endDate: data.endDate,
        renterName: data.name,
        renterEmail: data.email,
        renterPhone: fullPhone,
        renterAddress: fullAddress,
        renterIdType: '',
        renterIdNumber: '',
        locale: locale,
        message: data.message || '',
        createdAt: now.toISOString(),
        adminToken: adminToken,
        renterToken: renterToken,
        rateCardEffectiveFrom: rateCard.effectiveFrom,
        suggestedRentalFee: fee ? fee.rentalFee : null,
        suggestedDepositAmount: fee ? fee.depositAmount : null
    };

    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    const approveUrl = BASE_URL + '/booking/approve?id=' + id + '&token=' + adminToken;
    const rejectUrl = BASE_URL + '/booking/reject?id=' + id + '&token=' + adminToken;
    const manageUrl = BASE_URL + '/booking/manage?id=' + id + '&token=' + renterToken;

    const adminHtml =
        '<h2>New gear rental request - #' + escapeHtml(bookingNumber) + '</h2>' +
        '<p><strong>Item:</strong> ' + escapeHtml(data.item) + '</p>' +
        '<p><strong>Dates:</strong> ' + escapeHtml(data.startDate) + ' to ' + escapeHtml(data.endDate) + '</p>' +
        '<p><strong>Name:</strong> ' + escapeHtml(data.name) + '</p>' +
        '<p><strong>Email:</strong> ' + escapeHtml(data.email) + '</p>' +
        '<p><strong>Phone:</strong> ' + escapeHtml(fullPhone || '-') + '</p>' +
        '<p><strong>Address:</strong> ' + escapeHtml(fullAddress) + '</p>' +
        '<p><strong>Message:</strong> ' + escapeHtml(data.message || '-') + '</p>' +
        '<p>' +
        '<a href="' + approveUrl + '" style="background:#2c5f2d;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-right:10px;">Approve</a>' +
        '<a href="' + rejectUrl + '" style="background:#c62828;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Reject</a>' +
        '</p>';

    const renterHtml = locale === 'nl'
        ? '<h2>We hebben je aanvraag ontvangen</h2>' +
        '<p>Hoi ' + escapeHtml(data.name) + ',</p>' +
        '<p><strong>Boekingsnummer:</strong> ' + escapeHtml(bookingNumber) + '<br>' +
        '<strong>Item:</strong> ' + escapeHtml(localizedItem(data.item, locale)) + '<br>' +
        '<strong>Startdatum:</strong> ' + escapeHtml(data.startDate) + '<br>' +
        '<strong>Einddatum:</strong> ' + escapeHtml(data.endDate) + '</p>' +
        '<p>We bevestigen de beschikbaarheid en nemen snel contact met je op met de betaalgegevens.</p>' +
        '<p><a href="' + manageUrl + '">Bekijk of beheer je boeking</a></p>' +
        emailSignature(locale)
        : '<h2>We have received your request</h2>' +
        '<p>Hi ' + escapeHtml(data.name) + ',</p>' +
        '<p><strong>Booking number:</strong> ' + escapeHtml(bookingNumber) + '<br>' +
        '<strong>Item:</strong> ' + escapeHtml(data.item) + '<br>' +
        '<strong>Start date:</strong> ' + escapeHtml(data.startDate) + '<br>' +
        '<strong>End date:</strong> ' + escapeHtml(data.endDate) + '</p>' +
        '<p>We will confirm availability and get back to you shortly with payment details.</p>' +
        '<p><a href="' + manageUrl + '">View or manage your booking</a></p>' +
        emailSignature(locale);

    await Promise.all([
        sendEmail(env, env.ADMIN_EMAIL, 'New gear rental request #' + bookingNumber, adminHtml),
        sendEmail(env, data.email, locale === 'nl' ? 'We hebben je huuraanvraag ontvangen' : 'We\'ve received your rental request', renterHtml)
    ]);

    return new Response(JSON.stringify({ ok: true, id: id, bookingNumber: bookingNumber }), { headers: jsonHeaders });
}

// ---- Reject (admin-facing form + submit) ----

async function handleRejectForm(url, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    const id = url.searchParams.get('id');
    const token = url.searchParams.get('token');

    if (!id || !token) {
        return new Response(renderPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderPage('Not found', '<p>This booking request could not be found. It may have been removed.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }

    const booking = JSON.parse(raw);

    if (booking.adminToken !== token) {
        return new Response(renderPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    if (booking.status !== 'pending') {
        return new Response(renderPage('Already handled', '<p>This request was already marked as <strong>' + escapeHtml(booking.status) + '</strong>. No further action was taken.</p>'), {
            headers: htmlHeaders
        });
    }

    const body =
        '<h1>Reject this request?</h1>' +
        '<p><strong>' + escapeHtml(booking.renterName) + '</strong>, ' + escapeHtml(booking.item) + '</p>' +
        '<p>' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '</p>' +
        '<form method="POST" action="/booking/reject">' +
        '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
        '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
        '<p><label for="comment">Optional message to include in the email to the requester:</label><br>' +
        '<textarea name="comment" id="comment" rows="4" style="width:100%;max-width:500px;font-family:inherit;padding:8px;box-sizing:border-box;"></textarea></p>' +
        '<button type="submit" style="background:#c62828;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">Reject &amp; send</button>' +
        '</form>';

    return new Response(renderPage('Reject this request?', body), { headers: htmlHeaders });
}

async function handleRejectSubmit(request, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response(renderPage('Error', '<p>Could not read the form submission.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const id = (form.get('id') || '').toString();
    const token = (form.get('token') || '').toString();
    const comment = (form.get('comment') || '').toString().trim();

    return handleBookingDecision(id, token, env, corsHeaders, 'rejected', comment);
}

// Core decision logic shared by the email-link flow (token-checked, below)
// and the dashboard's one-click New Bookings actions (Basic-Auth-checked,
// no token needed since the dashboard route itself is already authenticated).
async function applyBookingDecision(booking, key, env, newStatus, comment) {
    booking.status = newStatus;
    booking.decidedAt = new Date().toISOString();
    if (comment) {
        booking.comment = comment;
    }
    await env.BOOKINGS.put(key, JSON.stringify(booking));

    const locale = booking.locale === 'nl' ? 'nl' : 'en';
    let renterSubject, renterHtml;

    if (newStatus === 'approved') {
        if (locale === 'nl') {
            renterSubject = 'Je JustRoam huuraanvraag is geaccepteerd';
            renterHtml =
                '<h2>Goed nieuws!</h2>' +
                '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
                '<p>Je aanvraag voor de <strong>' + escapeHtml(localizedItem(booking.item, locale)) + '</strong> van <strong>' + escapeHtml(booking.startDate) + '</strong> tot <strong>' + escapeHtml(booking.endDate) + '</strong> is geaccepteerd.</p>' +
                '<p>We nemen snel contact met je op met de betaalgegevens om je boeking te bevestigen.</p>' +
                emailSignature(locale);
        } else {
            renterSubject = 'Your JustRoam rental request has been approved';
            renterHtml =
                '<h2>Good news!</h2>' +
                '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
                '<p>Your request for the <strong>' + escapeHtml(booking.item) + '</strong> from <strong>' + escapeHtml(booking.startDate) + '</strong> to <strong>' + escapeHtml(booking.endDate) + '</strong> has been approved.</p>' +
                '<p>We will be in touch shortly with payment details to confirm your booking.</p>' +
                emailSignature(locale);
        }
    } else {
        if (locale === 'nl') {
            renterSubject = 'Over je JustRoam huuraanvraag';
            renterHtml =
                '<h2>Bedankt voor je aanvraag</h2>' +
                '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
                '<p>Helaas kunnen we de <strong>' + escapeHtml(localizedItem(booking.item, locale)) + '</strong> niet beschikbaar stellen voor <strong>' + escapeHtml(booking.startDate) + '</strong> tot <strong>' + escapeHtml(booking.endDate) + '</strong>.</p>' +
                (comment ? '<p>' + escapeHtml(comment).replace(/\n/g, '<br>') + '</p>' : '') +
                '<p>Kijk gerust naar andere data op onze site, of neem contact op als je vragen hebt.</p>' +
                emailSignature(locale);
        } else {
            renterSubject = 'About your JustRoam rental request';
            renterHtml =
                '<h2>Thank you for your request</h2>' +
                '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
                '<p>Unfortunately we are unable to accommodate the <strong>' + escapeHtml(booking.item) + '</strong> for <strong>' + escapeHtml(booking.startDate) + '</strong> to <strong>' + escapeHtml(booking.endDate) + '</strong>.</p>' +
                (comment ? '<p>' + escapeHtml(comment).replace(/\n/g, '<br>') + '</p>' : '') +
                '<p>Feel free to check other dates on our site, or get in touch if you have questions.</p>' +
                emailSignature(locale);
        }
    }

    await sendEmail(env, booking.renterEmail, renterSubject, renterHtml);
}

async function handleBookingDecision(id, token, env, corsHeaders, newStatus, comment) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };

    if (!id || !token) {
        return new Response(renderPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const key = 'booking:' + id;
    const raw = await env.BOOKINGS.get(key);
    if (!raw) {
        return new Response(renderPage('Not found', '<p>This booking request could not be found. It may have been removed.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }

    const booking = JSON.parse(raw);

    if (booking.adminToken !== token) {
        return new Response(renderPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    if (booking.status !== 'pending') {
        return new Response(renderPage('Already handled', '<p>This request was already marked as <strong>' + escapeHtml(booking.status) + '</strong>. No further action was taken.</p>'), {
            headers: htmlHeaders
        });
    }

    await applyBookingDecision(booking, key, env, newStatus, comment);

    const adminHtml = newStatus === 'approved'
        ? ('<h1>Approved</h1>' +
            '<p><strong>' + escapeHtml(booking.renterName) + '</strong>, ' + escapeHtml(booking.item) + '</p>' +
            '<p>' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '</p>' +
            '<p>Contact: ' + escapeHtml(booking.renterEmail) + (booking.renterPhone ? ' / ' + escapeHtml(booking.renterPhone) : '') + '</p>' +
            '<p><strong>Next steps:</strong></p>' +
            '<ul>' +
            '<li>Block these dates on your iCloud calendar yourself for now - automatic calendar sync on approval is not built yet.</li>' +
            '<li>Go to the <a href="' + BASE_URL + '/admin">admin dashboard</a> and use "Send payment request" to charge the rental fee + deposit via Mollie in one go.</li>' +
            '<li>When the item is returned, refund the deposit (minus any damage costs) and mark the booking as completed.</li>' +
            '</ul>')
        : ('<h1>Rejected</h1>' +
            '<p><strong>' + escapeHtml(booking.renterName) + '</strong>, ' + escapeHtml(booking.item) + '</p>' +
            '<p>' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '</p>' +
            (comment ? '<p><strong>Your message:</strong> ' + escapeHtml(comment) + '</p>' : '') +
            '<p>The renter has been notified.</p>');

    return new Response(renderPage(newStatus === 'approved' ? 'Approved' : 'Rejected', adminHtml), {
        headers: htmlHeaders
    });
}

// ---- Manage / edit / cancel (renter-facing, branded) ----

async function handleBookingAgreement(url, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    const id = url.searchParams.get('id');
    const token = url.searchParams.get('token');

    if (!id || !token) {
        return new Response(renderBrandedPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderBrandedPage('Not found', '<p>This agreement could not be found.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }

    const booking = JSON.parse(raw);

    if (booking.renterToken !== token) {
        return new Response(renderBrandedPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    if (typeof booking.quotedAmount !== 'number') {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Nog niet beschikbaar' : 'Not available yet', locale === 'nl'
            ? '<p>De huurovereenkomst voor deze boeking is nog niet beschikbaar. Deze wordt gegenereerd zodra een betaalverzoek is verstuurd.</p>'
            : '<p>The agreement for this booking is not available yet. It\'s generated once a payment request has been sent.</p>', locale), {
            headers: htmlHeaders
        });
    }

    const total = Math.round((booking.quotedAmount + (booking.depositAmount || 0)) * 100) / 100;
    const body = buildAgreementBody(booking, booking.quotedAmount, booking.depositAmount || 0, total);

    return new Response(renderBrandedPage((locale === 'nl' ? 'Huurovereenkomst #' : 'Rental Agreement #') + (booking.bookingNumber || booking.id), body, locale), { headers: htmlHeaders });
}

async function handleBookingManage(url, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    const id = url.searchParams.get('id');
    const token = url.searchParams.get('token');

    if (!id || !token) {
        return new Response(renderBrandedPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderBrandedPage('Not found', '<p>This booking could not be found.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }

    const booking = JSON.parse(raw);

    if (booking.renterToken !== token) {
        return new Response(renderBrandedPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    const statusLabels = locale === 'nl' ? {
        pending: 'In beoordeling',
        approved: 'Geaccepteerd',
        rejected: 'Niet beschikbaar',
        cancelled: 'Geannuleerd',
        completed: 'Afgerond'
    } : {
        pending: 'Pending review',
        approved: 'Approved',
        rejected: 'Not available',
        cancelled: 'Cancelled',
        completed: 'Completed'
    };

    let statusText = statusLabels[booking.status] || booking.status;
    if (booking.status === 'approved') {
        if (locale === 'nl') {
            statusText += booking.paid ? ' - betaling ontvangen' : (booking.molliePaymentId ? ' - in afwachting van betaling' : '');
        } else {
            statusText += booking.paid ? ' - payment received' : (booking.molliePaymentId ? ' - awaiting payment' : '');
        }
    }

    let body = locale === 'nl'
        ? '<p><strong>Boekingsnummer:</strong> ' + escapeHtml(booking.bookingNumber || '-') + '<br>' +
        '<strong>Item:</strong> ' + escapeHtml(localizedItem(booking.item, locale)) + '<br>' +
        '<strong>Startdatum:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
        '<strong>Einddatum:</strong> ' + escapeHtml(booking.endDate) + '<br>' +
        '<strong>Status:</strong> ' + escapeHtml(statusText) + '</p>'
        : '<p><strong>Booking number:</strong> ' + escapeHtml(booking.bookingNumber || '-') + '<br>' +
        '<strong>Item:</strong> ' + escapeHtml(booking.item) + '<br>' +
        '<strong>Start date:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
        '<strong>End date:</strong> ' + escapeHtml(booking.endDate) + '<br>' +
        '<strong>Status:</strong> ' + escapeHtml(statusText) + '</p>';

    if (booking.paid && booking.depositRefunded) {
        body += locale === 'nl'
            ? '<p><strong>Borg terugbetaald:</strong> &euro;' + Number(booking.depositRefundAmount || 0).toFixed(2) + '</p>'
            : '<p><strong>Deposit refunded:</strong> &euro;' + Number(booking.depositRefundAmount || 0).toFixed(2) + '</p>';
    }

    if (booking.status === 'pending') {
        if (locale === 'nl') {
            body +=
                '<h2>Wijzig je aanvraag</h2>' +
                '<p>Je aanvraag is nog niet beoordeeld, dus je kunt de gegevens hieronder nog aanpassen.</p>' +
                '<form method="POST" action="/booking/manage">' +
                '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
                '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
                '<div class="form-group"><label for="item">Item</label>' +
                '<select name="item" id="item">' +
                itemOption('Roof box', booking.item, locale) +
                itemOption('Bike carrier', booking.item, locale) +
                itemOption('Bundle', booking.item, locale) +
                '</select></div>' +
                '<div class="form-group"><label for="startDate">Startdatum</label>' +
                '<input type="date" name="startDate" id="startDate" value="' + escapeHtml(booking.startDate) + '"></div>' +
                '<div class="form-group"><label for="endDate">Einddatum</label>' +
                '<input type="date" name="endDate" id="endDate" value="' + escapeHtml(booking.endDate) + '"></div>' +
                '<button type="submit" class="btn btn-primary">Wijzigingen opslaan</button>' +
                '</form>';
        } else {
            body +=
                '<h2>Edit your request</h2>' +
                '<p>Your request hasn\'t been reviewed yet, so you can still change the details below.</p>' +
                '<form method="POST" action="/booking/manage">' +
                '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
                '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
                '<div class="form-group"><label for="item">Item</label>' +
                '<select name="item" id="item">' +
                itemOption('Roof box', booking.item, locale) +
                itemOption('Bike carrier', booking.item, locale) +
                itemOption('Bundle', booking.item, locale) +
                '</select></div>' +
                '<div class="form-group"><label for="startDate">Start date</label>' +
                '<input type="date" name="startDate" id="startDate" value="' + escapeHtml(booking.startDate) + '"></div>' +
                '<div class="form-group"><label for="endDate">End date</label>' +
                '<input type="date" name="endDate" id="endDate" value="' + escapeHtml(booking.endDate) + '"></div>' +
                '<button type="submit" class="btn btn-primary">Save changes</button>' +
                '</form>';
        }
        body += cancelSection(id, token, getCancellationPolicy(booking), locale);
    } else if (booking.status === 'approved') {
        if (!booking.paid && booking.molliePaymentId && typeof booking.quotedAmount === 'number') {
            body += locale === 'nl'
                ? '<div style="margin-top:16px;">' +
                '<form method="POST" action="/booking/retry-payment">' +
                '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
                '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
                '<button type="submit" class="btn btn-primary">Nu betalen</button>' +
                '</form>' +
                '<p style="font-size:0.85rem;color:#666;">Als een eerdere betaalpoging niet is geslaagd, klik dan hierboven om het opnieuw te proberen.</p>' +
                '</div>'
                : '<div style="margin-top:16px;">' +
                '<form method="POST" action="/booking/retry-payment">' +
                '<input type="hidden" name="id" value="' + escapeHtml(id) + '">' +
                '<input type="hidden" name="token" value="' + escapeHtml(token) + '">' +
                '<button type="submit" class="btn btn-primary">Pay now</button>' +
                '</form>' +
                '<p style="font-size:0.85rem;color:#666;">If a previous payment attempt did not go through, click above to try again.</p>' +
                '</div>';
        }
        body += cancelSection(id, token, getCancellationPolicy(booking), locale);
    } else {
        body += locale === 'nl'
            ? '<p>Wil je iets wijzigen? Reageer op je bevestigingsmail of neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>'
            : '<p>Need to make a change? Reply to your confirmation email or contact <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>';
    }

    return new Response(renderBrandedPage(locale === 'nl' ? 'Je boeking' : 'Your booking', body, locale), { headers: htmlHeaders });
}

async function handleBookingManageSubmit(request, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response(renderBrandedPage('Error', '<p>Could not read the form submission.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const id = (form.get('id') || '').toString();
    const token = (form.get('token') || '').toString();
    const item = (form.get('item') || '').toString();
    const startDate = (form.get('startDate') || '').toString();
    const endDate = (form.get('endDate') || '').toString();

    if (!id || !token) {
        return new Response(renderBrandedPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderBrandedPage('Not found', '<p>This booking could not be found.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }

    const booking = JSON.parse(raw);

    if (booking.renterToken !== token) {
        return new Response(renderBrandedPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    if (booking.status !== 'pending') {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Kan niet wijzigen' : 'Cannot edit', locale === 'nl'
            ? '<p>Deze aanvraag is al ' + escapeHtml(booking.status) + ' en kan niet meer worden gewijzigd. Neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a> als je iets moet aanpassen.</p>'
            : '<p>This request has already been ' + escapeHtml(booking.status) + ' and can no longer be edited. Please contact <a href="mailto:info@justroam.nl">info@justroam.nl</a> if you need to make changes.</p>', locale), {
            headers: htmlHeaders
        });
    }

    if (!item || !startDate || !endDate) {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Informatie ontbreekt' : 'Missing information', locale === 'nl'
            ? '<p>Vul het item en beide data in.</p>'
            : '<p>Please fill in the item and both dates.</p>', locale), {
            status: 400,
            headers: htmlHeaders
        });
    }

    if (new Date(endDate) < new Date(startDate)) {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Ongeldige data' : 'Invalid dates', locale === 'nl'
            ? '<p>De einddatum moet op of na de startdatum liggen.</p>'
            : '<p>The end date must be on or after the start date.</p>', locale), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const conflict = await hasOverlappingBooking(env, item, startDate, endDate, id);
    if (conflict) {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Data niet beschikbaar' : 'Dates not available', locale === 'nl'
            ? '<p>Helaas overlappen de nieuwe data met een andere boeking. We kunnen deze wijziging niet automatisch doorvoeren. Neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a> zodat we je direct kunnen helpen.</p>'
            : '<p>Sorry, the new dates you selected overlap with another booking. We can\'t make this change automatically - please contact <a href="mailto:info@justroam.nl">info@justroam.nl</a> so we can help directly.</p>', locale), {
            status: 409,
            headers: htmlHeaders
        });
    }

    booking.item = item;
    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.updatedAt = new Date().toISOString();
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    const approveUrl = BASE_URL + '/booking/approve?id=' + id + '&token=' + booking.adminToken;
    const rejectUrl = BASE_URL + '/booking/reject?id=' + id + '&token=' + booking.adminToken;

    const adminHtml =
        '<h2>Rental request updated by requester</h2>' +
        '<p><strong>Item:</strong> ' + escapeHtml(booking.item) + '</p>' +
        '<p><strong>Dates:</strong> ' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '</p>' +
        '<p><strong>Name:</strong> ' + escapeHtml(booking.renterName) + '</p>' +
        '<p><strong>Email:</strong> ' + escapeHtml(booking.renterEmail) + '</p>' +
        '<p><strong>Phone:</strong> ' + escapeHtml(booking.renterPhone || '-') + '</p>' +
        '<p>' +
        '<a href="' + approveUrl + '" style="background:#2c5f2d;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;margin-right:10px;">Approve</a>' +
        '<a href="' + rejectUrl + '" style="background:#c62828;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Reject</a>' +
        '</p>';

    await sendEmail(env, env.ADMIN_EMAIL, 'Rental request updated', adminHtml);

    const body = locale === 'nl'
        ? '<p>Je boekingsaanvraag is bijgewerkt:</p>' +
        '<p><strong>Item:</strong> ' + escapeHtml(localizedItem(booking.item, locale)) + '<br>' +
        '<strong>Startdatum:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
        '<strong>Einddatum:</strong> ' + escapeHtml(booking.endDate) + '</p>' +
        '<p>We beoordelen je bijgewerkte aanvraag en nemen contact met je op.</p>'
        : '<p>Your booking request has been updated:</p>' +
        '<p><strong>Item:</strong> ' + escapeHtml(booking.item) + '<br>' +
        '<strong>Start date:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
        '<strong>End date:</strong> ' + escapeHtml(booking.endDate) + '</p>' +
        '<p>We will review your updated request and get back to you.</p>';

    return new Response(renderBrandedPage(locale === 'nl' ? 'Wijzigingen opgeslagen' : 'Changes saved', body, locale), { headers: htmlHeaders });
}

async function handleRetryPayment(request, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response(renderBrandedPage('Error', '<p>Could not read the form submission.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const id = (form.get('id') || '').toString();
    const token = (form.get('token') || '').toString();

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderBrandedPage('Not found', '<p>This booking could not be found.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }
    const booking = JSON.parse(raw);

    if (booking.renterToken !== token) {
        return new Response(renderBrandedPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    if (booking.status !== 'approved' || booking.paid || typeof booking.quotedAmount !== 'number') {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Kan niet betalen' : 'Cannot pay', locale === 'nl'
            ? '<p>Deze boeking is niet in afwachting van betaling. Neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a> als je denkt dat dit niet klopt.</p>'
            : '<p>This booking is not awaiting payment. Please contact <a href="mailto:info@justroam.nl">info@justroam.nl</a> if you believe this is a mistake.</p>', locale), {
            headers: htmlHeaders
        });
    }

    const total = Math.round((booking.quotedAmount + (booking.depositAmount || 0)) * 100) / 100;
    const payment = await createMolliePayment(env, booking, total);
    if (!payment || payment.error || !payment._links || !payment._links.checkout) {
        const detail = payment && payment.error
            ? '<p><strong>Mollie response (' + escapeHtml(String(payment.status)) + '):</strong></p><pre style="background:#f5f5f5;padding:10px;overflow:auto;">' + escapeHtml(payment.body) + '</pre>'
            : '';
        return new Response(renderBrandedPage(locale === 'nl' ? 'Betaalfout' : 'Payment error', (locale === 'nl'
            ? '<p>Kon geen nieuwe betaling starten. Probeer het later opnieuw of neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>'
            : '<p>Could not start a new payment. Please try again later or contact <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>') + detail, locale), {
            status: 502,
            headers: htmlHeaders
        });
    }

    booking.molliePaymentId = payment.id;
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    return Response.redirect(payment._links.checkout.href, 303);
}

async function handleRenterCancel(request, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response(renderBrandedPage('Error', '<p>Could not read the form submission.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const id = (form.get('id') || '').toString();
    const token = (form.get('token') || '').toString();

    if (!id || !token) {
        return new Response(renderBrandedPage('Missing information', '<p>This link is missing required information.</p>'), {
            status: 400,
            headers: htmlHeaders
        });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response(renderBrandedPage('Not found', '<p>This booking could not be found.</p>'), {
            status: 404,
            headers: htmlHeaders
        });
    }
    const booking = JSON.parse(raw);

    if (booking.renterToken !== token) {
        return new Response(renderBrandedPage('Invalid link', '<p>This link is not valid.</p>'), {
            status: 403,
            headers: htmlHeaders
        });
    }

    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    const policy = getCancellationPolicy(booking);
    if (!policy.eligible) {
        return new Response(renderBrandedPage(locale === 'nl' ? 'Kan niet annuleren' : 'Cannot cancel', locale === 'nl'
            ? '<p>' + escapeHtml(policy.reason) + '</p><p>Neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>'
            : '<p>' + escapeHtml(policy.reason) + '</p><p>Please contact <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>', locale), {
            headers: htmlHeaders
        });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = 'renter';
    booking.cancellationFeePercent = policy.feePercent;
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    const paidNote = booking.paid
        ? '<p><strong>Note:</strong> this booking was already paid via Mollie (&euro;' + (Number(booking.quotedAmount || 0) + Number(booking.depositAmount || 0)).toFixed(2) + ' total, including a &euro;' + Number(booking.depositAmount || 0).toFixed(2) + ' deposit). Process any refund manually from the admin dashboard, applying the fee tier above.</p>'
        : '';

    const adminHtml =
        '<h2>Booking cancelled by requester</h2>' +
        '<p><strong>Booking number:</strong> ' + escapeHtml(booking.bookingNumber || '-') + '</p>' +
        '<p><strong>' + escapeHtml(booking.renterName) + '</strong>, ' + escapeHtml(booking.item) + '</p>' +
        '<p>' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '</p>' +
        '<p><strong>Cancellation fee per policy:</strong> ' + policy.feePercent + '%</p>' +
        paidNote +
        '<p>Please process any refund/charge manually based on the agreed price.</p>';
    await sendEmail(env, env.ADMIN_EMAIL, 'Booking #' + (booking.bookingNumber || '') + ' cancelled by requester', adminHtml);

    let feeMessage, body;
    if (locale === 'nl') {
        feeMessage = policy.feePercent === 0
            ? '<p>Er zijn geen annuleringskosten van toepassing.</p>'
            : '<p>Volgens ons annuleringsbeleid geldt een <strong>' + policy.feePercent + '%</strong> annuleringskosten. We nemen contact met je op over een eventuele terugbetaling.</p>';
        body =
            '<p>Boekingsnummer ' + escapeHtml(booking.bookingNumber || '-') + ' voor de <strong>' + escapeHtml(localizedItem(booking.item, locale)) + '</strong> (' + escapeHtml(booking.startDate) + ' tot ' + escapeHtml(booking.endDate) + ') is geannuleerd.</p>' +
            feeMessage +
            '<p>Heb je vragen? Neem contact op via <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>';
    } else {
        feeMessage = policy.feePercent === 0
            ? '<p>No cancellation fee applies.</p>'
            : '<p>Per our cancellation policy, a <strong>' + policy.feePercent + '%</strong> cancellation fee applies. We will follow up regarding any refund due.</p>';
        body =
            '<p>Booking number ' + escapeHtml(booking.bookingNumber || '-') + ' for the <strong>' + escapeHtml(booking.item) + '</strong> (' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + ') has been cancelled.</p>' +
            feeMessage +
            '<p>If you have any questions, contact <a href="mailto:info@justroam.nl">info@justroam.nl</a>.</p>';
    }

    return new Response(renderBrandedPage(locale === 'nl' ? 'Boeking geannuleerd' : 'Booking cancelled', body, locale), { headers: htmlHeaders });
}

function itemOption(value, current, locale) {
    const selected = value === current ? ' selected' : '';
    return '<option value="' + escapeHtml(value) + '"' + selected + '>' + escapeHtml(localizedItem(value, locale)) + '</option>';
}

// ---- Admin: Mollie payment + deposit refund ----

async function handleAdminSendPayment(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    const rentalFee = parseFloat(form.get('rentalFee'));
    const deposit = parseFloat(form.get('deposit')) || 0;

    if (!id || isNaN(rentalFee) || rentalFee <= 0 || deposit < 0) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    if (booking.status !== 'approved') {
        return new Response('Booking is not in an approved state', { status: 400, headers: corsHeaders });
    }

    const total = Math.round((rentalFee + deposit) * 100) / 100;
    const payment = await createMolliePayment(env, booking, total);
    if (!payment || payment.error || !payment._links || !payment._links.checkout) {
        const detail = payment && payment.error
            ? '<p><strong>Mollie response (' + escapeHtml(String(payment.status)) + '):</strong></p><pre style="background:#f5f5f5;padding:10px;overflow:auto;">' + escapeHtml(payment.body) + '</pre>'
            : '';
        return new Response(renderAdminPage('Mollie error', '<p>Could not create the Mollie payment. Confirm MOLLIE_API_KEY is set correctly.</p>' + detail + '<p><a href="/admin">Go back</a></p>'), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    booking.quotedAmount = Math.round(rentalFee * 100) / 100; // rental fee only - this is what counts toward income/VAT
    booking.depositAmount = Math.round(deposit * 100) / 100;
    booking.molliePaymentId = payment.id;
    booking.paid = false;
    booking.depositRefunded = false;
    booking.agreementSentAt = new Date().toISOString();
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    const checkoutUrl = payment._links.checkout.href;
    const agreementUrl = BASE_URL + '/booking/agreement?id=' + id + '&token=' + booking.renterToken;
    const locale = booking.locale === 'nl' ? 'nl' : 'en';

    const renterHtml = locale === 'nl'
        ? '<h2>Betaalverzoek voor je JustRoam boeking</h2>' +
        '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
        '<p>Voltooi de betaling voor je boeking - <strong>' + escapeHtml(localizedItem(booking.item, locale)) + '</strong>, ' + escapeHtml(booking.startDate) + ' tot ' + escapeHtml(booking.endDate) + '.</p>' +
        '<p><strong>Huurprijs:</strong> &euro;' + booking.quotedAmount.toFixed(2) + '<br>' +
        (booking.depositAmount > 0 ? '<strong>Terugbetaalbare borg:</strong> &euro;' + booking.depositAmount.toFixed(2) + '<br>' : '') +
        '<strong>Totaal te betalen:</strong> &euro;' + total.toFixed(2) + '</p>' +
        (booking.depositAmount > 0 ? '<p>Je borg wordt na de huurperiode terugbetaald, eventueel verminderd met kosten voor schade.</p>' : '') +
        '<p><a href="' + checkoutUrl + '" style="background:#2c5f2d;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Nu betalen</a></p>' +
        '<p style="font-size:0.85rem;color:#666;">Werkt de knop niet? Kopieer en plak deze link in je browser:<br>' + escapeHtml(checkoutUrl) + '</p>' +
        '<p>Je kunt je <a href="' + agreementUrl + '">huurovereenkomst hier bekijken</a>. Door de betaling te voltooien, ga je hiermee akkoord.</p>' +
        emailSignature(locale)
        : '<h2>Payment request for your JustRoam booking</h2>' +
        '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
        '<p>Please complete payment for your booking - <strong>' + escapeHtml(booking.item) + '</strong>, ' + escapeHtml(booking.startDate) + ' to ' + escapeHtml(booking.endDate) + '.</p>' +
        '<p><strong>Rental fee:</strong> &euro;' + booking.quotedAmount.toFixed(2) + '<br>' +
        (booking.depositAmount > 0 ? '<strong>Refundable deposit:</strong> &euro;' + booking.depositAmount.toFixed(2) + '<br>' : '') +
        '<strong>Total to pay now:</strong> &euro;' + total.toFixed(2) + '</p>' +
        (booking.depositAmount > 0 ? '<p>Your deposit will be refunded after the rental, minus any costs for damage if applicable.</p>' : '') +
        '<p><a href="' + checkoutUrl + '" style="background:#2c5f2d;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Pay now</a></p>' +
        '<p style="font-size:0.85rem;color:#666;">If the button does not work, copy and paste this link into your browser:<br>' + escapeHtml(checkoutUrl) + '</p>' +
        '<p>You can view your <a href="' + agreementUrl + '">rental agreement here</a>. By completing payment, you accept it.</p>' +
        emailSignature(locale);

    await sendEmail(env, booking.renterEmail, (locale === 'nl' ? 'Betaalverzoek - JustRoam boeking #' : 'Payment request - JustRoam booking #') + (booking.bookingNumber || ''), renterHtml);

    return adminRedirect(form);
}

async function handleAdminRefundDeposit(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    const refundAmount = parseFloat(form.get('refundAmount'));

    if (!id || isNaN(refundAmount) || refundAmount < 0) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    if (!booking.molliePaymentId || !booking.paid) {
        return new Response('No paid Mollie payment found for this booking', { status: 400, headers: corsHeaders });
    }
    if (refundAmount > (booking.depositAmount || 0)) {
        return new Response('Refund amount cannot exceed the deposit amount', { status: 400, headers: corsHeaders });
    }

    if (refundAmount > 0) {
        const refund = await createMollieRefund(env, booking.molliePaymentId, refundAmount);
        if (!refund) {
            return new Response(renderAdminPage('Mollie error', '<p>Could not process the refund. Check the Worker logs. <a href="/admin">Go back</a></p>'), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
    }

    booking.depositRefunded = true;
    booking.depositRefundAmount = Math.round(refundAmount * 100) / 100;
    booking.depositRefundedAt = new Date().toISOString();
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    if (refundAmount > 0) {
        const locale = booking.locale === 'nl' ? 'nl' : 'en';
        const refundHtml = locale === 'nl'
            ? '<h2>Borg terugbetaald</h2>' +
            '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
            '<p>We hebben &euro;' + booking.depositRefundAmount.toFixed(2) + ' van je borg teruggestort voor boeking #' + escapeHtml(booking.bookingNumber || '') + '.</p>' +
            '<p>Dit zou binnen een paar dagen op je rekening moeten staan, afhankelijk van je bank.</p>' +
            emailSignature(locale)
            : '<h2>Deposit refunded</h2>' +
            '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
            '<p>We have refunded &euro;' + booking.depositRefundAmount.toFixed(2) + ' of your deposit for booking #' + escapeHtml(booking.bookingNumber || '') + '.</p>' +
            '<p>It should appear back in your account within a few days, depending on your bank.</p>' +
            emailSignature(locale);
        await sendEmail(env, booking.renterEmail, (locale === 'nl' ? 'Je borg is terugbetaald - JustRoam boeking #' : 'Your deposit has been refunded - JustRoam booking #') + (booking.bookingNumber || ''), refundHtml);
    }

    return adminRedirect(form);
}

// ---- Admin: one-click approve/reject from the New Bookings section ----
// No adminToken check here - the dashboard route itself is already gated by
// Basic Auth, which is the authorization for these.

async function handleAdminApprove(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    if (!id) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const key = 'booking:' + id;
    const raw = await env.BOOKINGS.get(key);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    if (booking.status === 'pending') {
        await applyBookingDecision(booking, key, env, 'approved', null);
    }

    return adminRedirect(form);
}

async function handleAdminReject(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    const comment = (form.get('comment') || '').toString().trim();
    if (!id) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const key = 'booking:' + id;
    const raw = await env.BOOKINGS.get(key);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    if (booking.status === 'pending') {
        await applyBookingDecision(booking, key, env, 'rejected', comment);
    }

    return adminRedirect(form);
}

// ---- Admin dashboard ----

function buildAdminQuery(params) {
    var qs = [];
    if (params.year) qs.push('year=' + encodeURIComponent(params.year));
    if (params.archived) qs.push('archived=' + encodeURIComponent(params.archived));
    if (params.q) qs.push('q=' + encodeURIComponent(params.q));
    return qs.length ? '?' + qs.join('&') : '';
}

function renderNewBookingsSection(pendingBookings, params) {
    if (pendingBookings.length === 0) return '';
    const qs = buildAdminQuery(params);
    const hiddenRedirect = '<input type="hidden" name="redirect" value="' + escapeHtml(qs) + '">';
    let html = '<div style="background:#fff8e1;border:1px solid #f0c674;padding:16px;border-radius:8px;margin-bottom:24px;">' +
        '<h2 style="margin-top:0;">New bookings (' + pendingBookings.length + ')</h2>';
    pendingBookings.forEach(function (b) {
        html += '<div style="background:#fff;border-radius:6px;padding:12px;margin-bottom:10px;">' +
            '<p style="margin:0 0 6px;"><strong>#' + escapeHtml(b.bookingNumber || '') + '</strong> &mdash; ' +
            escapeHtml(b.item || '') + ' &mdash; ' + escapeHtml(b.startDate || '') + ' to ' + escapeHtml(b.endDate || '') + '</p>' +
            '<p style="margin:0 0 6px;font-size:0.9rem;">' + escapeHtml(b.renterName || '') + ' &lt;' + escapeHtml(b.renterEmail || '') + '&gt;' +
            (b.renterPhone ? ' &nbsp; ' + escapeHtml(b.renterPhone) : '') + '</p>' +
            (b.message ? '<p style="margin:0 0 6px;font-size:0.85rem;color:#555;">"' + escapeHtml(b.message) + '"</p>' : '') +
            '<form method="POST" action="/admin/approve" style="display:inline;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' +
            hiddenRedirect +
            '<button type="submit" style="background:#2c5f2d;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;">Approve</button>' +
            '</form> ' +
            '<form method="POST" action="/admin/reject" style="display:inline;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' +
            hiddenRedirect +
            '<input type="text" name="comment" placeholder="Optional comment to renter" style="padding:5px;width:240px;">' +
            ' <button type="submit" style="background:#a33;color:#fff;border:none;padding:6px 14px;border-radius:4px;cursor:pointer;">Reject</button>' +
            '</form>' +
            '</div>';
    });
    html += '</div>';
    return html;
}

async function handleAdminDashboard(url, env, corsHeaders) {
    const htmlHeaders = { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8', 'Referrer-Policy': 'no-referrer' };
    const yearParam = url.searchParams.get('year');
    const selectedYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const includeArchived = url.searchParams.get('archived') === 'include';
    const query = (url.searchParams.get('q') || '').trim();
    const queryLower = query.toLowerCase();

    const list = await env.BOOKINGS.list({ prefix: 'booking:' });
    const allBookings = [];
    for (const key of list.keys) {
        const raw = await env.BOOKINGS.get(key.name);
        if (!raw) continue;
        allBookings.push(JSON.parse(raw));
    }

    allBookings.sort(function (a, b) {
        return a.startDate.localeCompare(b.startDate);
    });

    // Income totals respect the archived toggle: archived bookings only count
    // toward the summary when "include archived" is checked.
    let yearNet = 0, yearVat = 0, yearGross = 0;
    let allNet = 0, allVat = 0, allGross = 0;
    allBookings.forEach(function (b) {
        if (b.status === 'completed' && typeof b.grossAmount === 'number') {
            if (b.archived && !includeArchived) return;
            allNet += b.netAmount;
            allVat += b.vatAmount;
            allGross += b.grossAmount;
            if (b.completedAt && new Date(b.completedAt).getFullYear() === selectedYear) {
                yearNet += b.netAmount;
                yearVat += b.vatAmount;
                yearGross += b.grossAmount;
            }
        }
    });

    // The visible list also respects the archived toggle, plus the search query.
    const visibleBookings = allBookings.filter(function (b) {
        if (b.archived && !includeArchived) return false;
        if (queryLower) {
            const haystack = [
                b.renterName || '',
                b.renterEmail || '',
                b.bookingNumber || ''
            ].join(' ').toLowerCase();
            if (haystack.indexOf(queryLower) === -1) return false;
        }
        return true;
    });

    const yearLinks = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map(function (y) {
        var style = y === selectedYear ? 'font-weight:700;' : '';
        var qs = buildAdminQuery({ year: y, archived: includeArchived ? 'include' : '', q: query });
        return '<a href="/admin' + qs + '" style="margin-right:12px;' + style + '">' + y + '</a>';
    }).join('');

    const currentParams = { year: selectedYear, archived: includeArchived ? 'include' : '', q: query };
    const pendingBookings = allBookings.filter(function (b) { return b.status === 'pending'; });

    let html = '<h1>JustRoam admin</h1>';
    html += '<p><a href="/admin/rate-cards">Manage rate cards &rarr;</a></p>';

    html += '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:24px;">' +
        '<h2 style="margin-top:0;">Income summary - ' + selectedYear + '</h2>' +
        '<p>Net: &euro;' + yearNet.toFixed(2) + ' &nbsp; VAT (21%): &euro;' + yearVat.toFixed(2) + ' &nbsp; Gross: &euro;' + yearGross.toFixed(2) + '</p>' +
        '<p style="font-size:0.85rem;color:#666;">All-time total - Net: &euro;' + allNet.toFixed(2) + ' &nbsp; VAT: &euro;' + allVat.toFixed(2) + ' &nbsp; Gross: &euro;' + allGross.toFixed(2) + '</p>' +
        '<p style="font-size:0.9rem;">' + yearLinks + '</p>' +
        '<p style="font-size:0.8rem;color:#999;">For reference only - reconcile against your own bookkeeping before filing VAT. Refundable deposits are never counted as income unless you keep part of one for damage.' +
        (includeArchived ? ' Archived bookings are currently <strong>included</strong> in these totals.' : ' Archived bookings are currently excluded.') +
        '</p>' +
        '</div>';

    html += renderNewBookingsSection(pendingBookings, currentParams);

    html += '<form method="GET" action="/admin" style="margin-bottom:16px;">' +
        '<input type="hidden" name="year" value="' + selectedYear + '">' +
        '<input type="text" name="q" value="' + escapeHtml(query) + '" placeholder="Search name, email, or booking number" style="padding:6px;width:280px;">' +
        ' <label style="font-size:0.9rem;"><input type="checkbox" name="archived" value="include"' + (includeArchived ? ' checked' : '') + '> Include archived</label>' +
        ' <button type="submit">Search</button>' +
        (query || includeArchived ? ' <a href="/admin?year=' + selectedYear + '">Clear filters</a>' : '') +
        '</form>';

    html += '<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">' +
        '<tr style="background:#2c5f2d;color:#fff;text-align:left;">' +
        '<th style="padding:8px;">#</th><th style="padding:8px;">Dates</th><th style="padding:8px;">Item</th><th style="padding:8px;">Renter</th>' +
        '<th style="padding:8px;">Status</th><th style="padding:8px;">Payment</th><th style="padding:8px;">Actions</th>' +
        '</tr>';

    visibleBookings.forEach(function (b) {
        html += renderAdminRow(b, currentParams);
    });

    if (visibleBookings.length === 0) {
        html += '<tr><td colspan="7" style="padding:16px;text-align:center;color:#999;">No bookings match this view.</td></tr>';
    }

    html += '</table>';

    return new Response(renderAdminPage('JustRoam admin', html), { headers: htmlHeaders });
}

function renderAdminRow(b, params) {
    var amountCell = '-';
    if (b.status === 'completed' && typeof b.grossAmount === 'number') {
        amountCell = '&euro;' + b.grossAmount.toFixed(2) + ' total<br><span style="font-size:0.8rem;color:#666;">net &euro;' + b.netAmount.toFixed(2) + ', VAT &euro;' + b.vatAmount.toFixed(2) + '</span>';
    } else if (typeof b.quotedAmount === 'number') {
        amountCell = 'Rental: &euro;' + b.quotedAmount.toFixed(2);
        if (b.depositAmount) {
            amountCell += '<br>Deposit: &euro;' + Number(b.depositAmount).toFixed(2);
        }
        amountCell += '<br><span style="font-size:0.8rem;color:' + (b.paid ? '#2c5f2d' : '#c62828') + ';">' + (b.paid ? 'Paid via Mollie' : 'Awaiting payment') + '</span>';
        if (b.depositRefunded) {
            amountCell += '<br><span style="font-size:0.8rem;color:#2c5f2d;">Deposit refunded: &euro;' + Number(b.depositRefundAmount || 0).toFixed(2) + '</span>';
        }
        if (b.agreementSentAt) {
            amountCell += '<br><span style="font-size:0.75rem;color:#888;">Agreement sent ' + escapeHtml(new Date(b.agreementSentAt).toLocaleDateString()) + '</span>';
        }
    }

    var redirectQs = buildAdminQuery(params);
    var hiddenRedirect = '<input type="hidden" name="redirect" value="' + escapeHtml(redirectQs) + '">';

    var actions = '';
    if (b.status === 'pending' || b.status === 'approved') {
        actions +=
            '<form method="POST" action="/admin/edit" style="margin-bottom:6px;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<select name="item" style="font-size:0.8rem;">' +
            itemOption('Roof box', b.item) + itemOption('Bike carrier', b.item) + itemOption('Bundle', b.item) +
            '</select><br>' +
            '<input type="date" name="startDate" value="' + escapeHtml(b.startDate) + '" style="font-size:0.8rem;width:120px;"> ' +
            '<input type="date" name="endDate" value="' + escapeHtml(b.endDate) + '" style="font-size:0.8rem;width:120px;"><br>' +
            '<button type="submit" style="font-size:0.8rem;margin-top:4px;">Save changes</button>' +
            '</form>' +
            '<form method="POST" action="/admin/cancel" onsubmit="return confirm(&quot;Cancel this booking? The renter will be notified and a full refund is recommended.&quot;);">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<button type="submit" style="font-size:0.8rem;background:#c62828;color:#fff;border:none;padding:4px 8px;border-radius:4px;">Cancel booking</button>' +
            '</form>';
    }
    if (b.status === 'approved' && !b.paid) {
        actions +=
            '<form method="POST" action="/admin/send-payment" style="margin-top:6px;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<input type="number" step="0.01" min="0.01" name="rentalFee" placeholder="Rental fee" value="' + (typeof b.quotedAmount === 'number' ? b.quotedAmount : (typeof b.suggestedRentalFee === 'number' ? b.suggestedRentalFee : '')) + '" style="font-size:0.8rem;width:100px;" required> ' +
            '<input type="number" step="0.01" min="0" name="deposit" placeholder="Deposit" value="' + (typeof b.depositAmount === 'number' ? b.depositAmount : (typeof b.suggestedDepositAmount === 'number' ? b.suggestedDepositAmount : '')) + '" style="font-size:0.8rem;width:90px;"><br>' +
            (typeof b.suggestedRentalFee === 'number' ? '<span style="font-size:0.75rem;color:#888;">Suggested from rate card: &euro;' + b.suggestedRentalFee.toFixed(2) + ' + &euro;' + b.suggestedDepositAmount.toFixed(2) + ' deposit</span><br>' : '') +
            '<button type="submit" style="font-size:0.8rem;margin-top:4px;">' + (b.molliePaymentId ? 'Resend payment request' : 'Send payment request') + '</button>' +
            '</form>';
    }
    if (b.paid && b.depositAmount > 0 && !b.depositRefunded) {
        actions +=
            '<form method="POST" action="/admin/refund-deposit" style="margin-top:6px;" onsubmit="return confirm(&quot;Refund this amount from the deposit?&quot;);">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<input type="number" step="0.01" min="0" max="' + b.depositAmount + '" name="refundAmount" value="' + b.depositAmount + '" style="font-size:0.8rem;width:100px;" required>' +
            '<button type="submit" style="font-size:0.8rem;">Refund deposit</button>' +
            '</form>';
    }
    if (b.status === 'approved' || b.status === 'completed') {
        var suggestedTotal = (b.quotedAmount || 0) + (b.depositRefunded ? (b.depositAmount || 0) - (b.depositRefundAmount || 0) : 0);
        actions +=
            '<form method="POST" action="/admin/complete" style="margin-top:6px;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<input type="number" step="0.01" min="0" name="grossAmount" placeholder="Total charged (incl. VAT)" value="' + (typeof b.grossAmount === 'number' ? b.grossAmount : (suggestedTotal || '')) + '" style="font-size:0.8rem;width:170px;" required>' +
            '<button type="submit" style="font-size:0.8rem;">' + (b.status === 'completed' ? 'Update amount' : 'Mark completed') + '</button>' +
            '</form>';
    }

    if (b.archived) {
        actions +=
            '<form method="POST" action="/admin/unarchive" style="margin-top:6px;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<button type="submit" style="font-size:0.8rem;">Unarchive</button>' +
            '</form>';
    } else {
        actions +=
            '<form method="POST" action="/admin/archive" style="margin-top:6px;" onsubmit="return confirm(&quot;Archive this booking?&quot;);">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
            '<button type="submit" style="font-size:0.8rem;">Archive</button>' +
            '</form>';
    }

    actions +=
        '<form method="POST" action="/admin/delete" style="margin-top:6px;" onsubmit="return confirm(&quot;Permanently delete this booking? This cannot be undone.&quot;);">' +
        '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' + hiddenRedirect +
        '<button type="submit" style="font-size:0.8rem;background:#444;color:#fff;border:none;padding:4px 8px;border-radius:4px;">Delete</button>' +
        '</form>';

    var statusLabel = escapeHtml(b.status) + (b.archived ? ' <span style="color:#999;">(archived)</span>' : '');
    if (b.status === 'cancelled' && b.cancelledBy) {
        statusLabel += '<br><span style="font-size:0.75rem;color:#999;">by ' + escapeHtml(b.cancelledBy) + (typeof b.cancellationFeePercent === 'number' ? ', ' + b.cancellationFeePercent + '% fee' : '') + '</span>';
    }

    return '<tr style="border-bottom:1px solid #e0e0e0;vertical-align:top;' + (b.archived ? 'opacity:0.6;' : '') + '">' +
        '<td style="padding:8px;font-weight:600;">' + escapeHtml(b.bookingNumber || '-') + '</td>' +
        '<td style="padding:8px;">' + escapeHtml(b.startDate) + '<br>to ' + escapeHtml(b.endDate) + '</td>' +
        '<td style="padding:8px;">' + escapeHtml(b.item) + '</td>' +
        '<td style="padding:8px;">' + escapeHtml(b.renterName) + '<br><span style="color:#666;font-size:0.8rem;">' + escapeHtml(b.renterEmail) + (b.renterPhone ? '<br>' + escapeHtml(b.renterPhone) : '') + (b.renterAddress ? '<br>' + escapeHtml(b.renterAddress) : '') + '</span>' +
            '<form method="POST" action="/admin/save-id" style="margin-top:6px;">' +
            '<input type="hidden" name="id" value="' + escapeHtml(b.id) + '">' +
            hiddenRedirect +
            '<input type="text" name="idType" placeholder="ID type" value="' + escapeHtml(b.renterIdType || '') + '" style="font-size:0.75rem;width:80px;"> ' +
            '<input type="text" name="idNumber" placeholder="ID number" value="' + escapeHtml(b.renterIdNumber || '') + '" style="font-size:0.75rem;width:90px;"> ' +
            '<button type="submit" style="font-size:0.75rem;">Save ID</button>' +
            '</form></td>' +
        '<td style="padding:8px;">' + statusLabel + '</td>' +
        '<td style="padding:8px;">' + amountCell + '</td>' +
        '<td style="padding:8px;">' + actions + '</td>' +
        '</tr>';
}

function adminRedirect(form) {
    const redirect = (form.get('redirect') || '').toString();
    return Response.redirect(BASE_URL + '/admin' + redirect, 303);
}

async function handleAdminComplete(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    const grossAmount = parseFloat(form.get('grossAmount'));

    if (!id || isNaN(grossAmount) || grossAmount < 0) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    const netAmount = grossAmount / (1 + VAT_RATE);
    const vatAmount = grossAmount - netAmount;

    booking.status = 'completed';
    booking.grossAmount = Math.round(grossAmount * 100) / 100;
    booking.netAmount = Math.round(netAmount * 100) / 100;
    booking.vatAmount = Math.round(vatAmount * 100) / 100;
    booking.completedAt = booking.completedAt || new Date().toISOString();

    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    return adminRedirect(form);
}

async function handleAdminCancel(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    if (!id) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = 'admin';
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    const locale = booking.locale === 'nl' ? 'nl' : 'en';
    const renterHtml = locale === 'nl'
        ? '<h2>Je boeking is geannuleerd</h2>' +
        '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
        '<p>Helaas moeten we je boeking voor de <strong>' + escapeHtml(localizedItem(booking.item, locale)) + '</strong> van <strong>' + escapeHtml(booking.startDate) + '</strong> tot <strong>' + escapeHtml(booking.endDate) + '</strong> annuleren. Dit ligt aan onze kant, niet aan jou, dus een volledige terugbetaling wordt geregeld als er al is betaald.</p>' +
        '<p>Onze excuses voor het ongemak, we hopen je een andere keer te kunnen helpen.</p>' +
        emailSignature(locale)
        : '<h2>Your booking has been cancelled</h2>' +
        '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
        '<p>Unfortunately we need to cancel your booking for the <strong>' + escapeHtml(booking.item) + '</strong> from <strong>' + escapeHtml(booking.startDate) + '</strong> to <strong>' + escapeHtml(booking.endDate) + '</strong>. This is on our side, not yours, so a full refund will be arranged if any payment was made.</p>' +
        '<p>We are sorry for the inconvenience and hope to help you another time.</p>' +
        emailSignature(locale);

    await sendEmail(env, booking.renterEmail, locale === 'nl' ? 'Je JustRoam boeking is geannuleerd' : 'Your JustRoam booking has been cancelled', renterHtml);

    return adminRedirect(form);
}

async function handleAdminSaveId(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    if (!id) {
        return new Response('Missing id', { status: 400, headers: corsHeaders });
    }
    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);
    booking.renterIdType = (form.get('idType') || '').toString();
    booking.renterIdNumber = (form.get('idNumber') || '').toString();
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));
    return adminRedirect(form);
}

async function handleAdminEdit(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    const item = (form.get('item') || '').toString();
    const startDate = (form.get('startDate') || '').toString();
    const endDate = (form.get('endDate') || '').toString();

    if (!id || !item || !startDate || !endDate) {
        return new Response('Missing fields', { status: 400, headers: corsHeaders });
    }
    if (new Date(endDate) < new Date(startDate)) {
        return new Response('End date must be on or after the start date', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);

    const conflict = await hasOverlappingBooking(env, item, startDate, endDate, id);
    if (conflict) {
        return new Response(renderAdminPage('Conflict', '<p>These dates overlap with another booking for the same item. <a href="/admin">Go back</a></p>'), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    const changed = booking.startDate !== startDate || booking.endDate !== endDate || booking.item !== item;

    booking.item = item;
    booking.startDate = startDate;
    booking.endDate = endDate;
    booking.updatedAt = new Date().toISOString();
    booking.updatedBy = 'admin';

    if (changed && !booking.paid) {
        const rateCard = await getActiveRateCard(env, startDate);
        const fee = calcRentalFee(item, startDate, endDate, rateCard);
        booking.rateCardEffectiveFrom = rateCard.effectiveFrom;
        booking.suggestedRentalFee = fee ? fee.rentalFee : null;
        booking.suggestedDepositAmount = fee ? fee.depositAmount : null;
    }

    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    if (changed) {
        const locale = booking.locale === 'nl' ? 'nl' : 'en';
        const renterHtml = locale === 'nl'
            ? '<h2>Je boeking is aangepast</h2>' +
            '<p>Hoi ' + escapeHtml(booking.renterName) + ',</p>' +
            '<p>We hebben je boeking moeten aanpassen. Deze is nu:</p>' +
            '<p><strong>Item:</strong> ' + escapeHtml(localizedItem(booking.item, locale)) + '<br>' +
            '<strong>Startdatum:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
            '<strong>Einddatum:</strong> ' + escapeHtml(booking.endDate) + '</p>' +
            '<p>Als dit niet voor je werkt, reageer dan op deze e-mail of neem contact op via info@justroam.nl.</p>' +
            emailSignature(locale)
            : '<h2>Your booking has been updated</h2>' +
            '<p>Hi ' + escapeHtml(booking.renterName) + ',</p>' +
            '<p>We have had to adjust your booking. It is now:</p>' +
            '<p><strong>Item:</strong> ' + escapeHtml(booking.item) + '<br>' +
            '<strong>Start date:</strong> ' + escapeHtml(booking.startDate) + '<br>' +
            '<strong>End date:</strong> ' + escapeHtml(booking.endDate) + '</p>' +
            '<p>If this does not work for you, please reply to this email or contact info@justroam.nl.</p>' +
            emailSignature(locale);
        await sendEmail(env, booking.renterEmail, locale === 'nl' ? 'Je JustRoam boeking is aangepast' : 'Your JustRoam booking has been updated', renterHtml);
    }

    return adminRedirect(form);
}

async function handleAdminArchive(request, env, corsHeaders, archived) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    if (!id) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    const raw = await env.BOOKINGS.get('booking:' + id);
    if (!raw) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
    }
    const booking = JSON.parse(raw);
    booking.archived = archived;
    await env.BOOKINGS.put('booking:' + id, JSON.stringify(booking));

    return adminRedirect(form);
}

async function handleAdminDelete(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const id = (form.get('id') || '').toString();
    if (!id) {
        return new Response('Invalid input', { status: 400, headers: corsHeaders });
    }

    await env.BOOKINGS.delete('booking:' + id);

    return adminRedirect(form);
}

// ---- Shared helpers ----

async function sendEmail(env, toEmail, subject, htmlContent, attachments) {
    const payload = {
        sender: { name: 'JustRoam', email: 'info@justroam.nl' },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
    };
    if (attachments && attachments.length > 0) {
        payload.attachment = attachments;
    }
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        console.error('Brevo send failed:', response.status, errText);
    }
    return response;
}

function emailSignature(locale) {
    return (
        '<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e0e0e0;font-family:-apple-system,sans-serif;color:#333;">' +
        '<img src="https://justroam.nl/images/Logo_JustRoam_RearCar.png" alt="Just Roam" width="140" style="width:140px;height:auto;display:block;margin-bottom:8px;">' +
        '<p style="margin:0;">Edwin van Davenhorst<br>Just Roam - Rent &amp; Custom builds</p>' +
        '<p style="margin:12px 0;">🚙 Custom Overland Builds &bull; Rentals &bull; Adventure Setups</p>' +
        '<p style="margin:0;">🌐 <a href="https://justroam.nl">justroam.nl</a><br>' +
        '📧 <a href="mailto:info@justroam.nl">info@justroam.nl</a></p>' +
        '<p style="margin:12px 0 0;">' + (locale === 'nl' ? 'Volg onze bouwprojecten en reizen:' : 'Follow our builds &amp; trips:') + '<br>📷 <a href="https://instagram.com/_justroam_">_justroam_</a></p>' +
        '</div>'
    );
}

// Plain utility page - used for admin-facing screens only (reject form, decision
// confirmations). Not shown to renters.
function renderPage(title, bodyHtml) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + escapeHtml(title) + '</title>' +
        '<style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:60px auto;padding:0 20px;color:#333;}h1,h2{color:#2c5f2d;}</style>' +
        '</head><body>' + bodyHtml + '</body></html>';
}

// ---- Rate cards ----

function rateCardForm() {
    return '<form method="POST" action="/admin/rate-cards/create" style="background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:24px;">' +
        '<h2 style="margin-top:0;">Add a new rate card</h2>' +
        '<p><label>Effective from <input type="date" name="effectiveFrom" required></label> ' +
        '<span style="font-size:0.85rem;color:#666;">Bookings requested on or after this date use these rates. Earlier bookings keep whatever card was active when they were requested.</span></p>' +
        ['roofbox', 'carrier', 'bundle'].map(function (key) {
            var label = key === 'roofbox' ? 'Roof box' : key === 'carrier' ? 'Bike carrier' : 'Bundle';
            return '<fieldset style="margin-bottom:12px;border:1px solid #ddd;border-radius:6px;padding:10px;">' +
                '<legend>' + label + '</legend>' +
                '<label>Per day &euro; <input type="number" step="0.01" min="0" name="' + key + '_day" required style="width:80px;"></label> ' +
                '<label>1 week &euro; <input type="number" step="0.01" min="0" name="' + key + '_week" required style="width:80px;"></label> ' +
                (key === 'roofbox' ?
                    '<label>2 weeks &euro; <input type="number" step="0.01" min="0" name="roofbox_2week" style="width:80px;"></label> ' +
                    '<label>3 weeks &euro; <input type="number" step="0.01" min="0" name="roofbox_3week" style="width:80px;"></label> '
                    : '') +
                '<label>Weekend &euro; <input type="number" step="0.01" min="0" name="' + key + '_weekend" required style="width:80px;"></label> ' +
                '<label>Deposit &euro; <input type="number" step="0.01" min="0" name="' + key + '_deposit" required style="width:80px;"></label>' +
                '</fieldset>';
        }).join('') +
        '<button type="submit">Save rate card</button>' +
        '</form>';
}

function renderRateCardRow(card) {
    function itemSummary(key, label) {
        var c = card[key];
        if (!c) return '';
        var tiers = c.tiers.slice().sort(function (a, b) { return a.days - b.days; })
            .map(function (t) { return t.days + 'd: &euro;' + t.price; }).join(', ');
        return '<p style="margin:2px 0;"><strong>' + label + ':</strong> &euro;' + c.day + '/day, ' + tiers + ', weekend &euro;' + c.weekend + ', deposit &euro;' + c.deposit + '</p>';
    }
    return '<div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:10px;">' +
        '<p style="margin:0 0 6px;"><strong>Effective from ' + escapeHtml(card.effectiveFrom) + '</strong></p>' +
        itemSummary('roofbox', 'Roof box') + itemSummary('carrier', 'Bike carrier') + itemSummary('bundle', 'Bundle') +
        '<form method="POST" action="/admin/rate-cards/delete" style="margin-top:8px;" onsubmit="return confirm(\'Delete this rate card? Bookings already made will keep their stored suggested price.\');">' +
        '<input type="hidden" name="effectiveFrom" value="' + escapeHtml(card.effectiveFrom) + '">' +
        '<button type="submit" style="background:#a33;color:#fff;border:none;padding:5px 12px;border-radius:4px;cursor:pointer;">Delete</button>' +
        '</form>' +
        '</div>';
}

async function handleAdminRateCardsPage(env, corsHeaders) {
    const cards = await getRateCards(env);
    let html = '<h1>Rate cards</h1>' +
        '<p><a href="/admin">&larr; Back to dashboard</a></p>' +
        '<p style="color:#666;">New booking requests automatically use whichever rate card is active on the request date. Existing bookings keep the price suggested at the time they were requested, even if you add a new card later.</p>';
    html += rateCardForm();
    html += '<h2>Existing cards</h2>';
    if (cards.length === 0) {
        html += '<p style="color:#999;">No custom rate cards yet - bookings are using the built-in default rates.</p>';
    } else {
        cards.slice().reverse().forEach(function (c) { html += renderRateCardRow(c); });
    }
    return new Response(renderAdminPage('Rate cards', html), { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleAdminRateCardsCreate(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const effectiveFrom = (form.get('effectiveFrom') || '').toString();
    if (!effectiveFrom) {
        return new Response('Missing effective date', { status: 400, headers: corsHeaders });
    }

    function num(name) {
        const v = parseFloat(form.get(name));
        return isNaN(v) ? 0 : v;
    }

    const card = {
        effectiveFrom: effectiveFrom,
        roofbox: {
            day: num('roofbox_day'), weekend: num('roofbox_weekend'), deposit: num('roofbox_deposit'),
            tiers: [{ days: 7, price: num('roofbox_week') }, { days: 14, price: num('roofbox_2week') }, { days: 21, price: num('roofbox_3week') }].filter(function (t) { return t.price > 0; })
        },
        carrier: {
            day: num('carrier_day'), weekend: num('carrier_weekend'), deposit: num('carrier_deposit'),
            tiers: [{ days: 7, price: num('carrier_week') }].filter(function (t) { return t.price > 0; })
        },
        bundle: {
            day: num('bundle_day'), weekend: num('bundle_weekend'), deposit: num('bundle_deposit'),
            tiers: [{ days: 7, price: num('bundle_week') }].filter(function (t) { return t.price > 0; })
        }
    };

    await env.BOOKINGS.put('ratecard:' + effectiveFrom, JSON.stringify(card));
    return Response.redirect(BASE_URL + '/admin/rate-cards', 303);
}

async function handleAdminRateCardsDelete(request, env, corsHeaders) {
    let form;
    try {
        form = await request.formData();
    } catch (err) {
        return new Response('Invalid form submission', { status: 400, headers: corsHeaders });
    }
    const effectiveFrom = (form.get('effectiveFrom') || '').toString();
    if (!effectiveFrom) {
        return new Response('Missing effective date', { status: 400, headers: corsHeaders });
    }
    await env.BOOKINGS.delete('ratecard:' + effectiveFrom);
    return Response.redirect(BASE_URL + '/admin/rate-cards', 303);
}

function renderAdminPage(title, bodyHtml) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + escapeHtml(title) + '</title>' +
        '<style>body{font-family:-apple-system,sans-serif;max-width:1200px;margin:30px auto;padding:0 20px;color:#333;}h1,h2{color:#2c5f2d;}table{box-shadow:0 1px 3px rgba(0,0,0,0.1);}</style>' +
        '</head><body>' + bodyHtml + '</body></html>';
}

// Branded page - used for every screen a renter sees (manage/edit/cancel and
// their error states). Reuses the real site's stylesheet and logo so it looks
// like part of justroam.nl rather than a bare utility page.
function renderBrandedPage(title, bodyHtml, locale) {
    const rights = locale === 'nl' ? 'Alle rechten voorbehouden.' : 'All rights reserved.';
    return '<!DOCTYPE html><html lang="' + (locale === 'nl' ? 'nl' : 'en') + '"><head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<meta name="referrer" content="no-referrer">' +
        '<title>' + escapeHtml(title) + ' | JustRoam</title>' +
        '<link rel="stylesheet" href="https://justroam.nl/styles.css">' +
        '<link rel="icon" type="image/png" href="https://justroam.nl/favicon.png">' +
        '</head><body>' +
        '<nav class="navbar"><div class="nav-container">' +
        '<a href="https://justroam.nl" class="nav-logo"><img src="https://justroam.nl/images/Logo_JustRoam.svg" alt="JustRoam" class="logo-img"></a>' +
        '</div></nav>' +
        '<section class="page-header"><div class="container"><h1>' + escapeHtml(title) + '</h1></div></section>' +
        '<section class="rent-content"><div class="container">' +
        '<div class="details-card" style="max-width:600px;margin:0 auto;">' + bodyHtml + '</div>' +
        '</div></section>' +
        '<footer class="footer"><div class="container"><div class="footer-bottom"><p>&copy; JustRoam. ' + rights + '</p></div></div></footer>' +
        '</body></html>';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Fills in the digital rental agreement with this booking's real data, as a
// body fragment for renderBrandedPage - served as a real page on the site
// (via /booking/agreement) rather than an email attachment, since most email
// clients (Gmail included) don't render HTML attachments and show raw source
// instead. Linked from the payment-request email; completing payment is
// treated as accepting it, per the T&Cs.
function describeEquipment(item, locale) {
    if (locale === 'nl') {
        if (item === 'Roof box') return 'Dakkoffer (Hapro Traxer 6.6, 410 L)';
        if (item === 'Bike carrier') return 'Fietsendrager (Thule VeloCompact 926, 3 fietsen / max 2 e-bikes)';
        if (item === 'Bundle') return 'Bundel: Dakkoffer (Hapro Traxer 6.6, 410 L) en Fietsendrager (Thule VeloCompact 926, 3 fietsen / max 2 e-bikes)';
        return item;
    }
    if (item === 'Roof box') return 'Roof box (Hapro Traxer 6.6, 410 L)';
    if (item === 'Bike carrier') return 'Bike carrier (Thule VeloCompact 926, 3 bikes / max 2 e-bikes)';
    if (item === 'Bundle') return 'Bundle: Roof box (Hapro Traxer 6.6, 410 L) and Bike carrier (Thule VeloCompact 926, 3 bikes / max 2 e-bikes)';
    return item;
}

function buildAgreementBody(booking, rentalFee, depositAmount, total) {
    const locale = booking.locale === 'nl' ? 'nl' : 'en';
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const numDays = Math.round((end - start) / 86400000) + 1;
    const now = new Date();
    const dateLocale = locale === 'nl' ? 'nl-NL' : 'en-GB';
    const agreementDate = now.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
    const sentAt = now.toLocaleString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (locale === 'nl') {
        return '<p><strong>Huurovereenkomst nr.</strong> ' + escapeHtml(booking.bookingNumber || booking.id) + '<br>' +
            '<strong>Datum:</strong> ' + escapeHtml(agreementDate) + '</p>' +
            '<h2>Partijen</h2>' +
            '<p><strong>Verhuurder:</strong> JustRoam, KVK 71621865, Populierendreef 850, Voorburg, NL. info@justroam.nl · +31 6 1133 4832<br>' +
            '<strong>Huurder:</strong> ' + escapeHtml(booking.renterName) + ', ' + escapeHtml(booking.renterAddress || '') + ', ' + escapeHtml(booking.renterEmail) +
            (booking.renterPhone ? ', ' + escapeHtml(booking.renterPhone) : '') + ', type/nr. identiteitsbewijs ' +
            (booking.renterIdType || booking.renterIdNumber ? escapeHtml((booking.renterIdType || '') + ' ' + (booking.renterIdNumber || '')) : '(gecontroleerd bij het ophalen)') + '</p>' +
            '<h2>Gehuurd materiaal</h2>' +
            '<table class="rate-lines-table">' +
            '<tr><td>Item(s)</td><td>' + escapeHtml(describeEquipment(booking.item, locale)) + '</td></tr>' +
            '<tr><td>Huurperiode</td><td>' + escapeHtml(booking.startDate) + ' &rarr; ' + escapeHtml(booking.endDate) + ' (' + numDays + ' dagen)</td></tr>' +
            '<tr><td>Ophalen / terugbrengen</td><td>Persoonlijk in Voorburg, op afgesproken tijdstippen</td></tr>' +
            '</table>' +
            '<h2>Kosten</h2>' +
            '<table class="rate-lines-table">' +
            '<tr><td>Huurprijs</td><td>&euro;' + rentalFee.toFixed(2) + '</td></tr>' +
            '<tr><td>Borg (terugbetaalbaar)</td><td>&euro;' + depositAmount.toFixed(2) + '</td></tr>' +
            '<tr><td><strong>Totaal verschuldigd</strong></td><td><strong>&euro;' + total.toFixed(2) + '</strong></td></tr>' +
            '<tr><td>Betalen voor</td><td>Binnen 48 uur na deze overeenkomst (of minimaal 8 uur voor het ophalen bij last-minute boekingen)</td></tr>' +
            '</table>' +
            '<h2>Belangrijkste voorwaarden geaccepteerd door de Huurder</h2>' +
            '<ol class="legal-list">' +
            '<li>Ik heb de <strong>JustRoam Algemene Voorwaarden Verhuur Materiaal</strong> gelezen en geaccepteerd; deze maken onderdeel uit van deze overeenkomst.</li>' +
            '<li>Ik betaal volledig binnen 48 uur na ontvangst van de betaallink (of minimaal 8 uur voor het ophalen bij last-minute boekingen); als de betaling niet op tijd wordt ontvangen, kan de boeking worden geannuleerd.</li>' +
            '<li><strong>Terugbetaling bij annulering</strong> (van de huurprijs; de borg wordt bij annulering altijd volledig terugbetaald):' +
            '<ol class="legal-list legal-sublist" type="a"><li>Tijdens beoordeling: 100%.</li><li>Geaccepteerd, meer dan 1 week voor ophalen: 100%.</li>' +
            '<li>Geaccepteerd, minder dan 1 week maar meer dan 48 uur voor ophalen: 50%.</li>' +
            '<li>Geaccepteerd, 48 uur of minder voor ophalen: 20%.</li>' +
            '<li>Na de ophaaldatum: annuleren is hier niet meer mogelijk. Neem contact op via info@justroam.nl.</li></ol></li>' +
            '<li>Ik ben 24 jaar of ouder en toon een geldig identiteitsbewijs bij het ophalen.</li>' +
            '<li>Ik bevestig dat mijn voertuig geschikt is voor het Materiaal (een goedgekeurde trekhaak voor de fietsendrager; geschikte dakdragers voor de dakkoffer) en dat ik dit correct en wegwettelijk monteer en gebruik, binnen de maximale belading (dakkoffer 75 kg; fietsendrager 60 kg totaal / 25 kg per fiets). Voor de fietsendrager ben ik verantwoordelijk voor het bevestigen van een wegwettelijk kenteken en voor eventuele boetes die verband houden met het kenteken, het overschrijden van de kogeldruk van de trekhaak, te hard rijden, overbelasting, onjuist gebruik of onjuiste verlichting.</li>' +
            '<li>Ik ben verantwoordelijk voor verlies, diefstal of schade die de normale slijtage overschrijdt tijdens de huurperiode, tot het bedrag van de borg, en voor schade aan mijn voertuig of aan derden die ontstaat door montage of gebruik. JustRoam is niet aansprakelijk voor gevolgschade. Het Materiaal is niet gedekt door een verzekering van JustRoam. Het wordt volledig op mijn risico verhuurd, met inachtneming van deze beperking.</li>' +
            '<li>Ik gebruik het Materiaal alleen binnen de EU, het Verenigd Koninkrijk, Zwitserland en Noorwegen, voor normaal gebruik op de weg. Off-road gebruik, wedstrijdgebruik of commercieel gebruik is niet toegestaan.</li>' +
            '<li>Ik breng het Materiaal schoon, compleet en op tijd terug. De borg wordt na inspectie terugbetaald, normaal gesproken binnen 2 werkdagen, verminderd met eventuele bedragen voor schade, verlies, schoonmaak of te laat terugbrengen.</li>' +
            '</ol>' +
            '<h2>Acceptatie</h2>' +
            '<p>Door de betaling via de verstrekte link te voltooien, accepteert de Huurder deze overeenkomst elektronisch.</p>' +
            '<p>Verhuurder: JustRoam, verstuurd ' + escapeHtml(sentAt) + '</p>';
    }

    return '<p><strong>Rental Agreement no.</strong> ' + escapeHtml(booking.bookingNumber || booking.id) + '<br>' +
        '<strong>Date:</strong> ' + escapeHtml(agreementDate) + '</p>' +
        '<h2>Parties</h2>' +
        '<p><strong>Lessor:</strong> JustRoam, KVK 71621865, Populierendreef 850, Voorburg, NL. info@justroam.nl · +31 6 1133 4832<br>' +
        '<strong>Renter:</strong> ' + escapeHtml(booking.renterName) + ', ' + escapeHtml(booking.renterAddress || '') + ', ' + escapeHtml(booking.renterEmail) +
        (booking.renterPhone ? ', ' + escapeHtml(booking.renterPhone) : '') + ', ID type/no. ' +
        (booking.renterIdType || booking.renterIdNumber ? escapeHtml((booking.renterIdType || '') + ' ' + (booking.renterIdNumber || '')) : '(checked at pickup)') + '</p>' +
        '<h2>Equipment rented</h2>' +
        '<table class="rate-lines-table">' +
        '<tr><td>Item(s)</td><td>' + escapeHtml(describeEquipment(booking.item, locale)) + '</td></tr>' +
        '<tr><td>Rental period</td><td>' + escapeHtml(booking.startDate) + ' &rarr; ' + escapeHtml(booking.endDate) + ' (' + numDays + ' days)</td></tr>' +
        '<tr><td>Pickup / return</td><td>In person, Voorburg, at agreed times</td></tr>' +
        '</table>' +
        '<h2>Charges</h2>' +
        '<table class="rate-lines-table">' +
        '<tr><td>Rental fee</td><td>&euro;' + rentalFee.toFixed(2) + '</td></tr>' +
        '<tr><td>Security deposit (refundable)</td><td>&euro;' + depositAmount.toFixed(2) + '</td></tr>' +
        '<tr><td><strong>Total due</strong></td><td><strong>&euro;' + total.toFixed(2) + '</strong></td></tr>' +
        '<tr><td>Payment due by</td><td>Within 48 hours of this agreement (or at least 8 hours before pickup for last-minute bookings)</td></tr>' +
        '</table>' +
        '<h2>Key terms accepted by the Renter</h2>' +
        '<ol class="legal-list">' +
        '<li>I have read and accept the <strong>JustRoam Gear Rental Terms &amp; Conditions</strong>, which form part of this agreement.</li>' +
        '<li>I will pay in full within 48 hours of receiving the payment link (or at least 8 hours before pickup for last-minute bookings); if payment is not received in time, the booking may be cancelled.</li>' +
        '<li><strong>Cancellation refunds</strong> (of the rental fee; the deposit is always refunded in full on cancellation):' +
        '<ol class="legal-list legal-sublist" type="a"><li>While pending approval: 100%.</li><li>Approved, more than 1 week before pickup: 100%.</li>' +
        '<li>Approved, less than 1 week but more than 48 hours before pickup: 50%.</li>' +
        '<li>Approved, 48 hours or less before pickup: 20%.</li>' +
        '<li>After the pickup date: cancellation is no longer possible here. Contact info@justroam.nl.</li></ol></li>' +
        '<li>I am 24+ and will present valid ID at pickup.</li>' +
        '<li>I confirm my vehicle is suitable for the Equipment (a type-approved towbar for the carrier; load-rated roof bars for the box) and I will fit and use it correctly and road-legally, within the maximum loads (roof box 75 kg; carrier 60 kg total / 25 kg per bike). For the carrier, I am responsible for fitting a road-legal licence plate and for any fines related to the licence plate, exceeding the towbar\'s nose weight, speeding, overloading, incorrect use, or inadequate lighting.</li>' +
        '<li>I am responsible for loss, theft or damage beyond normal wear during the rental, capped at the security deposit amount, and for any damage to my vehicle or third parties arising from fitment/use. JustRoam is not liable for consequential loss. The Equipment is not covered by any insurance held by JustRoam. It is rented entirely at my risk, subject to this cap.</li>' +
        '<li>I will use the Equipment only within the EU, United Kingdom, Switzerland and Norway, for normal road use. Off-road, competition or commercial use is not permitted.</li>' +
        '<li>I will return the Equipment clean, complete and on time. The deposit is refunded after inspection, normally within 2 business days, less any amounts owed for damage, loss, cleaning or late return.</li>' +
        '</ol>' +
        '<h2>Acceptance</h2>' +
        '<p>By completing payment via the link provided, the Renter accepts this agreement electronically.</p>' +
        '<p>Lessor: JustRoam, sent ' + escapeHtml(sentAt) + '</p>';
}
