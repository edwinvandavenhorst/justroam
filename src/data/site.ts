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
    instagram: 'https://www.instagram.com/_justroam_/'
};

export const links = {
    goboony: 'https://www.goboony.nl/campers/nederland/zuid-holland/voorburg/92756',
    gearhive: 'https://gearhive.nl/verhuurder/ac1e36bb-58c0-46d4-b191-f7f058dc0f2a'
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

export const builds = [
    { key: 'started', months: '± 1' },
    { key: 'serious', months: '± 2' },
    { key: 'allin', months: '± 3-4' }
];
