export type Lang = 'en' | 'nl';

// Page paths are the same in both languages; Dutch lives under /nl/.
export function href(lang: Lang, page: string): string {
    const clean = page.replace(/^\//, '');
    if (lang === 'en') return '/' + clean;
    return '/nl/' + clean;
}

// The other-language version of the current path, for the switcher and hreflang
export function alternatePath(pathname: string, to: Lang): string {
    const bare = pathname.replace(/^\/nl(\/|$)/, '/');
    if (to === 'en') return bare;
    return bare === '/' ? '/nl/' : '/nl' + bare;
}

export const nav = {
    en: [
        { page: 'rent.html', label: 'Rent the Ranger' },
        { page: 'rent-gear.html', label: 'Roof box & bike carrier' },
        { page: 'build.html', label: 'Builds' },
        { page: 'stories.html', label: 'Stories' },
        { page: 'faq.html', label: 'FAQ' },
        { page: 'contact.html', label: 'Contact' }
    ],
    nl: [
        { page: 'rent.html', label: 'Ranger huren' },
        { page: 'rent-gear.html', label: 'Dakkoffer & fietsendrager' },
        { page: 'build.html', label: 'Ombouw' },
        { page: 'stories.html', label: 'Verhalen' },
        { page: 'faq.html', label: 'Vragen' },
        { page: 'contact.html', label: 'Contact' }
    ]
};

export const ui = {
    en: {
        menu: 'Menu',
        switchLabel: 'Nederlands',
        footerTagline: 'Overland Ford Ranger rental and custom 4x4 builds from Voorburg.',
        footerRent: 'Rent',
        footerMore: 'More',
        privacy: 'Privacy',
        skip: 'Skip to content'
    },
    nl: {
        menu: 'Menu',
        switchLabel: 'English',
        footerTagline: 'Overland Ford Ranger verhuur en maatwerk 4x4-ombouw vanuit Voorburg.',
        footerRent: 'Huren',
        footerMore: 'Meer',
        privacy: 'Privacy',
        skip: 'Naar de inhoud'
    }
};
