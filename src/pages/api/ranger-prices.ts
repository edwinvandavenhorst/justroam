import type { APIRoute } from 'astro';
import { CACHE_HEADERS, fetchPrices } from '../../lib/ranger';

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const prices = await fetchPrices();
        if (!prices) {
            console.error('Goboony prices: base_rate not found on listing page');
            return new Response('Prices not found', { status: 502 });
        }
        return new Response(JSON.stringify(prices), { headers: CACHE_HEADERS });
    } catch (err) {
        console.error('Goboony prices failed:', err);
        return new Response('Fetch failed', { status: 502 });
    }
};
