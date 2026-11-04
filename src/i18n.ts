export type Lang = 'en' | 'nl';

// Page paths are the same in both languages; Dutch lives under /nl/.
export function href(lang: Lang, page: string): string {
    const clean = page.replace(/^\//, '');
    if (lang === 'en') return '/' + clean;
    return '/nl/' + clean;
}

// The public URL of a page. The build writes pages as /rent/ but serves
// them as /rent.html (see scripts/flatten-pages.mjs), so links, canonical
// and hreflang use the .html form.
export function pageUrl(pathname: string): string {
    if (pathname === '/' || pathname === '/nl/' || pathname === '/nl' || pathname.endsWith('.html')) return pathname === '/nl' ? '/nl/' : pathname;
    return pathname.replace(/\/$/, '') + '.html';
}

// The other-language version of the current path, for the switcher and hreflang
export function alternatePath(pathname: string, to: Lang): string {
    const bare = pageUrl(pathname).replace(/^\/nl(\/|$)/, '/');
    if (to === 'en') return bare;
    return bare === '/' ? '/nl/' : '/nl' + bare;
}

// Order follows what we want people to do: builds first
export const nav = {
    en: [
        { page: 'build.html', label: 'Builds' },
        { page: 'rent.html', label: 'Rent the Ranger' },
        { page: 'rent-gear.html', label: 'Roof box & bikes' },
        { page: 'stories.html', label: 'Stories' },
        { page: 'contact.html', label: 'Contact' }
    ],
    nl: [
        { page: 'build.html', label: 'Ombouw' },
        { page: 'rent.html', label: 'Ranger huren' },
        { page: 'rent-gear.html', label: 'Dakkoffer & fietsen' },
        { page: 'stories.html', label: 'Verhalen' },
        { page: 'contact.html', label: 'Contact' }
    ]
};

export const ui = {
    en: {
        menu: 'Menu',
        switchLabel: 'NL',
        plan: 'Plan your build',
        footerTagline: 'Overland builds and Ford Ranger rental from Voorburg.',
        footerBuild: 'Build',
        footerRent: 'Rent',
        footerMore: 'More',
        packages: 'Packages',
        buildStory: 'Our build story',
        faq: 'FAQ',
        privacy: 'Privacy',
        skip: 'Skip to content'
    },
    nl: {
        menu: 'Menu',
        switchLabel: 'EN',
        plan: 'Plan je ombouw',
        footerTagline: 'Overland-ombouw en Ford Ranger verhuur vanuit Voorburg.',
        footerBuild: 'Ombouw',
        footerRent: 'Huren',
        footerMore: 'Meer',
        packages: 'Pakketten',
        buildStory: 'Ons bouwverhaal',
        faq: 'Vragen',
        privacy: 'Privacy',
        skip: 'Naar de inhoud'
    }
};
