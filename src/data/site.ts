// One place for facts that appear on several pages. Change a price or a
// link here and every page (and its structured data) follows.

export const business = {
    name: 'JustRoam',
    url: 'https://justroam.nl',
    email: 'info@justroam.nl',
    phone: '+31611334832',
    phoneDisplay: '+31 6 1133 4832',
    kvk: '71621865',
    locality: 'Voorburg',
    region: 'Zuid-Holland',
    country: 'NL',
    instagram: 'https://www.instagram.com/_justroam_/',
    instagramHandle: '@_justroam_',
    // WhatsApp click-to-chat on the normal (private) WhatsApp number
    whatsapp: 'https://wa.me/31611334832'
};

export const links = {
    // Free 30-minute intake calls, booked straight into Edwin's calendar.
    // One Cal.com event per kind and language, each with its own questions
    // and booking page language: build intake, and the intake for the paid
    // vehicle advice (looking for a vehicle first).
    cal: {
        build: { en: 'https://cal.com/justroam/build-intake', nl: 'https://cal.com/justroam/intake-ombouw' },
        advice: { en: 'https://cal.com/justroam/vehicle-advice', nl: 'https://cal.com/justroam/autokeuze-advies' }
    },
    goboony: 'https://www.goboony.nl/campers/nederland/zuid-holland/voorburg/92756',
    gearhive: 'https://gearhive.nl/verhuurder/ac1e36bb-58c0-46d4-b191-f7f058dc0f2a',
    gearhiveCategories: [
        { url: 'https://gearhive.nl/categorie/dakkoffers', en: 'Roof boxes', nl: 'Dakkoffers' },
        { url: 'https://gearhive.nl/categorie/fietsendragers', en: 'Bike carriers', nl: 'Fietsendragers' },
        { url: 'https://gearhive.nl/categorie/kampeer', en: 'Camping gear', nl: 'Kampeerspullen' }
    ]
};

// Ranger rental, as a renter sees it on Goboony (service fee included).
// The day-by-day prices on the calendar come live from /api/ranger-prices;
// these are only the "from" figures used in copy and structured data.
export const ranger = {
    fromPerDay: 130,
    maxPerDay: 199,
    cleaningFee: 50,
    discounts: [
        { weeks: 2, percent: 10 },
        { weeks: 3, percent: 15 }
    ],
    minAge: 25,
    licenceYears: 2,
    sleeps: 4
};

// Build packages: two packages and two add-ons. Prices are "from", incl. VAT,
// parts and labour; days are workshop days (not calendar weeks).
export const packages = [
    { key: 'basis', name: { en: 'Basis', nl: 'Basis' }, from: 6000, days: 5, addon: false },
    { key: 'camp', name: { en: 'Ready to camp', nl: 'Ready to camp' }, from: 17000, days: 15, addon: false },
    { key: 'offroad', name: { en: '+ Full off-road', nl: '+ Full off-road' }, from: 9550, days: 4, addon: true },
    { key: 'lights', name: { en: '+ Outdoor lighting', nl: '+ Buitenverlichting' }, from: 1750, days: 1, addon: true }
];

// "€6,000" in English, "€6.000" in Dutch
export function euro(n: number, lang: 'en' | 'nl'): string {
    return '€' + n.toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-GB');
}

// Workshop days, worded per language and package type
export function daysText(p: { days: number; addon: boolean; key: string }, lang: 'en' | 'nl'): string {
    const n = p.days;
    if (lang === 'nl') {
        const d = n === 1 ? 'werkdag' : 'werkdagen';
        if (p.addon) return `ongeveer ${n} ${d} extra`;
        return p.key === 'camp' ? `ongeveer ${n} ${d}, Basis inbegrepen` : `ongeveer ${n} ${d}`;
    }
    const d = n === 1 ? 'workshop day' : 'workshop days';
    if (p.addon) return `about ${n} ${d} extra`;
    return p.key === 'camp' ? `about ${n} ${d}, Basis included` : `about ${n} ${d}`;
}
