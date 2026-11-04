import type { APIRoute } from 'astro';
import { CALENDARS, CACHE_HEADERS, fetchCalendar } from '../../lib/ranger';

export const prerender = false;

// Booked days from both calendars, merged. `complete` is false when one of
// them failed, so the page can warn instead of showing those days as free.
export const GET: APIRoute = async () => {
    const results = await Promise.allSettled([fetchCalendar(CALENDARS.own), fetchCalendar(CALENDARS.goboony)]);
    const booked = new Set<string>();
    let complete = true;
    for (const r of results) {
        if (r.status === 'fulfilled') r.value.forEach((d) => booked.add(d));
        else {
            complete = false;
            console.error('Ranger calendar failed:', r.reason);
        }
    }
    const body = JSON.stringify({ booked: [...booked].sort(), complete });
    // Do not cache a partial answer for long
    const headers = complete ? CACHE_HEADERS : { ...CACHE_HEADERS, 'Cache-Control': 'public, max-age=0, s-maxage=60' };
    return new Response(body, { headers });
};
