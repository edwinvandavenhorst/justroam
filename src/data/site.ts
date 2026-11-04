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

// The three build packages, in the order of the build sheet
export const packages = [
    { key: 'started', name: 'Getting started', months: { en: '± 1 month', nl: '± 1 maand' } },
    { key: 'serious', name: 'Getting serious', months: { en: '± 2 months', nl: '± 2 maanden' } },
    { key: 'allin', name: 'Going all-in', months: { en: '± 3-4 months', nl: '± 3-4 maanden' } }
];

// Build sheet rows: which package includes what (true per package, in order)
export const sheetRows = [
    { en: 'Aluminium canopy and LED lighting', nl: 'Aluminium opbouw en LED-verlichting', has: [true, true, true] },
    { en: 'Dual battery and solar', nl: 'Tweede accu en zonnepaneel', has: [true, true, true] },
    { en: 'USB and 12V outlets', nl: 'USB- en 12V-aansluitingen', has: [true, true, true] },
    { en: 'Drawers, kitchen, fridge-ready', nl: 'Lades, keuken, koelkastklaar', has: [false, true, true] },
    { en: 'Water, pump and outside shower', nl: 'Water, pomp en buitendouche', has: [false, true, true] },
    { en: 'Front and rear auxiliary lights', nl: 'Extra verlichting voor en achter', has: [false, true, true] },
    { en: 'Roof tent(s) and 270° awning', nl: 'Daktent(en) en 270° luifel', has: [false, false, true] },
    { en: 'Upgraded suspension', nl: 'Verbeterde vering', has: [false, false, true] },
    { en: 'Winch, recovery boards, snorkel', nl: 'Lier, zandplaten, snorkel', has: [false, false, true] },
    { en: 'Skid plates and rock sliders', nl: 'Bodemplaten en rock sliders', has: [false, false, true] }
];
