// Throwaway mockup helper: draws a "Greetings from" postcard as SVG into every
// element with data-postcard. Options come from data-attributes.
(function () {
    const IMG = '/images/stories/bosnia-slovenia/';
    const C = { navy: '#1d2a6b', yellow: '#f5c518', red: '#b5262b', cream: '#fff8e8', paper: '#f7eedb' };
    const kilim = (id) => `
        <pattern id="${id}" width="44" height="22" patternUnits="userSpaceOnUse">
            <rect width="44" height="22" fill="${C.red}"/>
            <path d="M0 11 L11 0 L22 11 L11 22 Z M22 11 L33 0 L44 11 L33 22 Z" fill="${C.navy}"/>
            <path d="M5 11 L11 5 L17 11 L11 17 Z M27 11 L33 5 L39 11 L33 17 Z" fill="${C.yellow}"/>
        </pattern>`;
    const star = 'M0 -10 L2.9 -3.1 L9.5 -3.1 L4.2 1.2 L6.2 8.1 L0 4 L-6.2 8.1 L-4.2 1.2 L-9.5 -3.1 L-2.9 -3.1 Z';
    const stamp = (x, y, s = 1) => `
        <g transform="translate(${x} ${y}) rotate(4) scale(${s})">
            <rect width="120" height="146" fill="${C.cream}"/>
            <rect width="120" height="146" fill="none" stroke="${C.paper}" stroke-width="9" stroke-dasharray="0.1 11" stroke-linecap="round"/>
            <rect x="10" y="10" width="100" height="126" fill="${C.navy}"/>
            <path d="M32 10 L96 10 L96 98 Z" fill="${C.yellow}"/>
            ${[0, 1, 2, 3, 4].map((k) => `<path transform="translate(${28 + k * 13} ${20 + k * 16}) scale(0.5)" d="${star}" fill="${C.cream}"/>`).join('')}
            <text x="16" y="120" font-family="Barlow Condensed" font-weight="700" font-size="10.5" letter-spacing=".5" fill="${C.cream}">BOSNA I HERCEGOVINA</text>
            <text x="104" y="131" text-anchor="end" font-family="Barlow Condensed" font-weight="700" font-size="16" fill="${C.cream}">1 KM</text>
        </g>`;
    const postmark = (x, y, id) => `
        <g transform="translate(${x} ${y}) rotate(-12)" fill="none" stroke="#2c2a4a" stroke-opacity=".7" stroke-width="2.5">
            <circle r="50"/><circle r="36"/>
            <path id="${id}" d="M-43 0 A43 43 0 1 1 43 0" stroke="none"/>
            <text font-family="Barlow Condensed" font-weight="700" font-size="12.5" letter-spacing="1" fill="#2c2a4a" fill-opacity=".8" stroke="none"><textPath href="#${id}" startOffset="50%" text-anchor="middle">LUKOMIR · BIH</textPath></text>
            <text y="5" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="12.5" fill="#2c2a4a" fill-opacity=".8" stroke="none">13.08.25</text>
            <path d="M56 -18 q 18 -10 36 0 t 36 0 M56 0 q 18 -10 36 0 t 36 0 M56 18 q 18 -10 36 0 t 36 0"/>
        </g>`;

    // Large-letter card: a photo inside every letter.
    function letters(el, uid) {
        const font = el.dataset.font || 'Barlow Condensed';
        const weight = el.dataset.weight || '800';
        const ribbonFont = el.dataset.ribbon || 'Yellowtail';
        const ribbonSize = +(el.dataset.ribbonSize || 34);
        const word = el.dataset.word || 'BOSNIA';
        const photos = ['strbacki-buk', 'lukomir-road', 'una-rapids', 'livno-plateau-evening', 'jajce-gate', 'rama-lake-beach'];
        const size = +(el.dataset.size || 230);
        const adv = { I: 0.27, ...(JSON.parse(el.dataset.adv || '{}')) };
        const base = +(el.dataset.base || 0.53);
        const gap = 10;
        const ws = [...word].map((ch) => (adv[ch] ?? base) * size);
        const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
        let x = 500 - total / 2;
        const L = [...word].map((ch, i) => { const cx = x + ws[i] / 2; x += ws[i] + gap; return { ch, cx, w: ws[i] }; });
        const by = 430;
        const t = (l, extra = '') => `<text x="${l.cx}" y="${by}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${size}" ${extra}>${l.ch}</text>`;
        return `<svg viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Greetings from Bosnia">
            <defs>${kilim('k' + uid)}
                ${L.map((l, i) => `<clipPath id="c${uid}${i}">${t(l)}</clipPath>`).join('')}
                <clipPath id="in${uid}"><rect x="30" y="30" width="940" height="580" rx="4"/></clipPath>
            </defs>
            <rect width="1000" height="640" rx="8" fill="${C.paper}"/>
            <rect x="12" y="12" width="976" height="616" rx="6" fill="url(#k${uid})"/>
            <g clip-path="url(#in${uid})">
                <image href="${IMG}lukomir-gravel.jpg" x="30" y="30" width="940" height="580" preserveAspectRatio="xMidYMid slice"/>
                <rect x="30" y="30" width="940" height="580" fill="${C.cream}" opacity=".42"/>
            </g>
            <rect x="30" y="30" width="940" height="580" rx="4" fill="none" stroke="${C.cream}" stroke-width="5"/>
            <text x="110" y="180" font-family="Yellowtail" font-size="96" fill="${C.cream}" stroke="${C.navy}" stroke-width="12" stroke-linejoin="round" transform="rotate(-7 110 180)">Greetings from</text>
            <text x="110" y="180" font-family="Yellowtail" font-size="96" fill="${C.red}" transform="rotate(-7 110 180)">Greetings from</text>
            ${L.map((l) => `<text x="${l.cx + 9}" y="${by + 9}" text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${C.navy}" stroke="${C.navy}" stroke-width="8" stroke-linejoin="round">${l.ch}</text>`).join('')}
            ${L.map((l, i) => `<g clip-path="url(#c${uid}${i})"><rect x="${l.cx - l.w}" y="${by - size}" width="${l.w * 2}" height="${size + 20}" fill="${C.navy}"/><image href="${IMG}${photos[i % photos.length]}.jpg" x="${l.cx - l.w / 2 - 30}" y="${by - size - 10}" width="${l.w + 60}" height="${size + 30}" preserveAspectRatio="xMidYMid slice"/></g>`).join('')}
            ${L.map((l) => t(l, `fill="none" stroke="${C.cream}" stroke-width="4" stroke-linejoin="round"`)).join('')}
            <g transform="translate(500 500)">
                <path d="M-320 -30 H320 L298 0 L320 30 H-320 L-298 0 Z" fill="${C.yellow}" stroke="${C.navy}" stroke-width="3.5"/>
                <text y="${ribbonFont === 'Yellowtail' ? 13 : 11}" text-anchor="middle" font-family="${ribbonFont}" ${el.dataset.ribbonStyle || ''} font-size="${ribbonSize}" fill="${C.navy}">${el.dataset.sub || '&amp; a little bit of Slovenia, summer 2025'}</text>
            </g>
            ${stamp(822, 56)}
            ${postmark(800, 205, 'pm' + uid)}
        </svg>`;
    }

    // Photo card: one landscape photo, script greeting and white block word on top.
    function photo(el, uid) {
        return `<svg viewBox="0 0 1000 660" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Greetings from Bosnia">
            <defs><linearGradient id="g${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
            <rect width="1000" height="660" rx="8" fill="${C.cream}"/>
            <image href="${IMG}${el.dataset.photo || 'rama-lake-roof'}.jpg" x="26" y="26" width="948" height="608" preserveAspectRatio="xMidYMid slice"/>
            <rect x="26" y="26" width="948" height="608" fill="url(#g${uid})"/>
            <text x="70" y="500" font-family="Yellowtail" font-size="78" fill="${C.cream}" transform="rotate(-6 70 500)">Greetings from</text>
            <text x="64" y="598" font-family="Alfa Slab One" font-size="120" letter-spacing="6" fill="${C.yellow}" stroke="${C.navy}" stroke-width="5" paint-order="stroke">BOSNIA</text>
            ${stamp(840, 50)}
            ${postmark(810, 196, 'pm' + uid)}
        </svg>`;
    }

    // Back of a postcard: lines, stamp box, a handwritten note.
    function back(el, uid) {
        const lines = (el.dataset.note || '').split('|');
        return `<svg viewBox="0 0 1000 640" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Back of the postcard">
            <rect width="1000" height="640" rx="8" fill="#fbf3e1" stroke="#e3d3b2"/>
            <line x1="560" y1="70" x2="560" y2="580" stroke="#cdb894" stroke-width="2"/>
            <text x="40" y="52" font-family="Barlow Condensed" font-weight="700" font-size="16" letter-spacing="3" fill="#a08a66">CARTE POSTALE · RAZGLEDNICA · POSTCARD</text>
            ${lines.map((l, i) => `<text x="46" y="${130 + i * 54}" font-family="Caveat" font-size="32" fill="${C.navy}">${l}</text>`).join('')}
            ${[0, 1, 2, 3].map((k) => `<line x1="600" x2="950" y1="${330 + k * 62}" y2="${330 + k * 62}" stroke="#cdb894" stroke-width="2"/>`).join('')}
            <text x="610" y="320" font-family="Caveat" font-size="36" fill="${C.navy}">To: you, reading this</text>
            <text x="610" y="382" font-family="Caveat" font-size="36" fill="${C.navy}">justroam.nl</text>
            <text x="610" y="444" font-family="Caveat" font-size="36" fill="${C.navy}">Voorburg, the Netherlands</text>
            ${stamp(820, 60)}
            ${postmark(790, 210, 'pm' + uid)}
        </svg>`;
    }

    document.querySelectorAll('[data-postcard]').forEach((el, i) => {
        const kind = el.dataset.postcard;
        el.innerHTML = (kind === 'photo' ? photo : kind === 'back' ? back : letters)(el, 'u' + i);
    });
})();
