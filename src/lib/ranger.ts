// Ranger availability and prices, read from the calendars and the public
// Goboony listing. Replaces the Cloudflare Worker routes /ranger,
// /ranger-goboony and /ranger-prices.

import { links } from '../data/site';

export const CALENDARS = {
    // Own iCloud calendar (published, read-only) for blocks outside Goboony
    own: 'https://p149-caldav.icloud.com/published/2/MTEwOTM1MjI5NTExMDkzNY70qKIvNyg31YIFZnfGOz4OAX7ZZYYoJwnziPCkHBSlPLp2FHiZYWs_ZI-_0DEg4d_0IUaVj8HBauNausIGS8c',
    goboony: 'https://www.goboony.nl/icalendars/izFii1B6KiwSCdiDyu7rVwcJ.ics'
};

const UA = { 'User-Agent': 'JustRoam-Availability' };

function addDays(day: string, n: number): string {
    const d = new Date(day + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

// Every day an event touches, start and end day included. The end day is
// kept blocked on purpose: it is the hand-back day, and Goboony bookings end
// mid-afternoon.
export function bookedDays(ical: string): string[] {
    const days = new Set<string>();
    for (const block of ical.split('BEGIN:VEVENT').slice(1)) {
        const start = block.match(/DTSTART[^:\r\n]*:(\d{4})(\d{2})(\d{2})/);
        const end = block.match(/DTEND[^:\r\n]*:(\d{4})(\d{2})(\d{2})/);
        if (!start || !end) continue;
        const from = `${start[1]}-${start[2]}-${start[3]}`;
        const to = `${end[1]}-${end[2]}-${end[3]}`;
        for (let d = from, guard = 0; d <= to && guard < 400; d = addDays(d, 1), guard++) days.add(d);
    }
    return [...days];
}

export async function fetchCalendar(url: string): Promise<string[]> {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    if (!text.includes('BEGIN:VCALENDAR')) throw new Error('not an iCal feed');
    return bookedDays(text);
}

// The listing page carries the renter's price per day in an inline script:
// a base_rate, and a custom_rate per day inside a configured season. This
// reads page markup, so it fails (returns null) if Goboony restructures it.
export function parseGoboonyPrices(html: string): { base: number; days: Record<string, number> } | null {
    const baseMatch = html.match(/base_rate\s*=\s*([\d.]+)/);
    if (!baseMatch) return null;
    const base = Math.round(parseFloat(baseMatch[1]));
    if (!isFinite(base) || base < 1 || base > 5000) return null;
    const days: Record<string, number> = {};
    const re = /custom_rate\s*=\s*([\d.]+);[\s\S]*?data-date="(\d{4}-\d{2}-\d{2})"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
        const rate = Math.round(parseFloat(m[1]));
        if (isFinite(rate) && rate >= 1 && rate <= 5000) days[m[2]] = rate;
    }
    return { base, days };
}

export async function fetchPrices() {
    const res = await fetch(links.goboony, { headers: UA });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return parseGoboonyPrices(await res.text());
}

// Cached at Vercel's edge for an hour, served stale while it refreshes
export const CACHE_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
};
