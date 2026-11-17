// The build story of our own Ford Ranger (Dec 2024 to Jul 2025), moved from
// the old blog_build.html. The ten steps (text and photos) are in
// build-steps.json; the frame around them is here.
import type { StoryData, StoryImage } from '../../components/StoryPage.astro';
import steps from './build-steps.json';
import type { Lang } from '../../i18n';

const img = (n: number, w: number, h: number, alt?: string): StoryImage => ({ src: `/images/build/IMG_${n}.jpeg`, w, h, alt });

export function buildStory(lang: Lang): StoryData {
    const nl = lang === 'nl';
    const p = nl ? '/nl/' : '/';
    const sections = steps[lang];
    return nl ? {
        title: 'Ford Ranger ombouwen tot overland-pickup: ons bouwverhaal | JustRoam',
        description: 'Zo bouwden we onze Ford Ranger (2018, dubbele cabine) in zeven maanden om tot overland-pickup voor vier: opbouw, lier, snorkel, water, stroom, interieur, twee daktenten, vering en koppeling. Met elke keuze en wat we anders zouden doen.',
        kicker: 'Bouwverhaal',
        h1: 'Een overland-pickup bouwen voor het hele gezin',
        byline: 'Door Edwin · december 2024 tot juli 2025 · 10 stappen · 8 minuten lezen',
        published: '2025-07-31',
        modified: '2026-11-17',
        short: 'In zeven maanden bouwden we een Ford Ranger uit 2018 met dubbele cabine om tot overland-pickup voor vier personen. Opbouw, verlichting en lier, snorkel, watertank, elektra, een eigen interieur, twee daktenten met luifel, zwaardere vering en koppeling, en bergingsspullen. Bij elke stap staat welke keuze we maakten en wat we nu anders zouden doen.',
        intro: `<p>We wilden met z'n vieren off-grid kunnen reizen: zelf koken, water en stroom aan boord, en slapen waar het mooi is. Een kant-en-klare camper paste niet bij ons, dus bouwden we de Ranger zelf om, op de oprit. Voor de daktenten schakelden we een specialist in. Een gebroken enkel en been kostten ons twee maanden.</p><p>Alles wat we leerden, gebruiken we nu in de <a href="${p}build.html">ombouw voor anderen</a>. Wil je het resultaat eerst zelf ervaren, dan kun je <a href="${p}rent.html">onze Ranger huren</a>.</p>`,
        mosaic: [img(30, 1960, 2614, 'De Ranger met beide daktenten en de luifel open'), img(1, 1960, 1470, 'De Ford Ranger bij aankoop, nog standaard'), img(43, 1960, 1470, 'Uitschuifkeuken met gasstel'), img(36, 1960, 2614, 'Nieuwe zware schokdemper'), img(42, 1960, 1470, 'Uitschuiflade met spoelbak achterin')],
        facts: [['Auto', 'Ford Ranger 2018, dubbele cabine'], ['Doel', 'Off-grid reizen met 4 personen'], ['Bouwtijd', 'Dec 2024 tot jul 2025 (7 maanden)'], ['Vertraging', '2 maanden (gebroken enkel en been)'], ['Slapen', '2 daktenten, 4 personen'], ['Stappen', '10']],
        sections,
        faqTitle: 'Vragen over deze ombouw',
        faq: [
            { q: 'Hoe lang duurt het om een Ford Ranger om te bouwen?', a: `Onze eigen ombouw duurde zeven maanden, naast werk en gezin, op de oprit, met twee maanden vertraging door een blessure. In onze werkplaats gaat het veel sneller: we rekenen in werkdagen per pakket, zie <a href="${p}build.html#packages">de pakketten</a>.` },
            { q: 'Eén of twee daktenten voor een gezin van vier?', a: 'Wij kozen er twee. Met vier in één tent slaap je krap en slecht; met twee heeft iedereen ruimte. Met de luifel van 270 graden kun je ook in de regen buiten koken.' },
            { q: 'Moet de vering zwaarder als je daktenten plaatst?', a: 'Bij ons wel. Zodra de tenten erop stonden, merkten we het gewicht in de stabiliteit. Met zwaardere vering rijden we veilig op en naast de weg, volgeladen en met vier personen.' },
            { q: 'Heb je een zwaardere koppeling nodig?', a: 'Bij ons slipte de standaard koppeling op de eerste reis, op steile stukken met veel gewicht. Een zware koppeling kost €3.500 of meer. Ons advies: test eerst, en upgrade op basis van wat je onderweg merkt.' },
            { q: 'Welke opbouw zit op de Ranger?', a: 'Een aluminium opbouw van Bushtech, gekozen op beschikbaarheid. De dealer hielp met plaatsen; daarna hebben we hem zelf afgemonteerd.' },
            { q: 'Wat zou je de volgende keer anders doen?', a: 'Lampen en lier in één keer monteren, alles twee keer meten voor je zaagt, meteen zware ladegeleiders kopen, en de hele inrichting eerst nabouwen op de echte hoogte, want na de verhoging zat alles te hoog.' }
        ],
        cta: { title: 'Ook zo\'n pickup?', text: 'We bouwen de jouwe met twee pakketten en twee add-ons, of je huurt eerst de onze.', primary: ['Bekijk de ombouw', 'build.html'], secondary: ['Ranger huren', 'rent.html'] },
        related: [
            { title: 'Eerste reis: Bosnië en Slovenië', sub: 'Reisverhaal', img: { src: '/images/stories/bosnia-slovenia/rama-lake-roof.jpg', w: 1280, h: 960 }, page: 'bosnia-slovenia.html' },
            { title: 'Herfst op Elba', sub: 'Reisverhaal', img: img(41, 1960, 2614) }
        ]
    } : {
        title: 'Ford Ranger overland build: our 10-step build story | JustRoam',
        description: 'How we turned a 2018 Ford Ranger double cab into an overland pickup for four in seven months: canopy, winch, snorkel, water, electrics, interior, two roof tents, suspension and clutch. Every choice, and what we would do differently.',
        kicker: 'Build story',
        h1: 'Building a family-ready overland pickup',
        byline: 'By Edwin · December 2024 to July 2025 · 10 steps · 8 min read',
        published: '2025-07-31',
        modified: '2026-11-17',
        short: 'In seven months we turned a 2018 Ford Ranger double cab into an overland pickup for four people. Canopy, lights and winch, snorkel, water tank, electrics, our own interior, two roof tents with awning, heavier suspension and clutch, and recovery gear. Each step shows the choice we made and what we would do differently now.',
        intro: `<p>We wanted to travel off-grid as a family of four: cook ourselves, carry water and power, and sleep wherever it is beautiful. A ready-made camper did not suit us, so we converted the Ranger ourselves, on the driveway. For the roof tents we brought in a specialist. A broken ankle and leg cost us two months.</p><p>Everything we learned now goes into <a href="${p}build.html">the builds we do for others</a>. Want to try the result first? You can <a href="${p}rent.html">rent our Ranger</a>.</p>`,
        mosaic: [img(30, 1960, 2614, 'The Ranger with both roof tents and the awning open'), img(1, 1960, 1470, 'The Ford Ranger when we bought it, still stock'), img(43, 1960, 1470, 'Slide-out kitchen with gas stove'), img(36, 1960, 2614, 'New heavy-duty shock absorber'), img(42, 1960, 1470, 'Slide-out drawer with sink in the back')],
        facts: [['Vehicle', 'Ford Ranger 2018, double cab'], ['Goal', 'Off-grid travel for 4 people'], ['Build time', 'Dec 2024 to Jul 2025 (7 months)'], ['Delay', '2 months (broken ankle and leg)'], ['Sleeps', '2 roof tents, 4 people'], ['Steps', '10']],
        sections,
        faqTitle: 'Questions about this build',
        faq: [
            { q: 'How long does it take to convert a Ford Ranger?', a: `Our own build took seven months, next to work and family, on the driveway, with two months lost to an injury. In our workshop it is much faster: we count in workshop days per package, see <a href="${p}build.html#packages">the packages</a>.` },
            { q: 'One or two roof tents for a family of four?', a: 'We chose two. Four in one tent means cramped quarters and poor sleep; with two everyone has room. With the 270-degree awning you can also cook outside in the rain.' },
            { q: 'Do you need heavier suspension with roof tents?', a: 'We did. As soon as the tents were on, we felt the weight in the stability. With heavy-duty suspension we drive safely on and off-road, fully loaded and with four people.' },
            { q: 'Do you need a heavy-duty clutch?', a: 'Our stock clutch slipped on the first trip, on steep sections with a lot of weight. A heavy-duty clutch costs €3,500 or more. Our advice: test first, and upgrade based on what you notice on the road.' },
            { q: 'Which canopy is on the Ranger?', a: 'An aluminium Bushtech canopy, chosen on availability. The dealer helped to put it on; we did the final mounting ourselves.' },
            { q: 'What would you do differently next time?', a: 'Fit the lights and winch in one go, measure everything twice before cutting, buy heavy drawer sliders straight away, and mock up the whole interior at its real height first, because after the lift everything sat too high.' }
        ],
        cta: { title: 'Want a pickup like this?', text: 'We build yours from two packages and two add-ons, or you can rent ours first.', primary: ['Explore builds', 'build.html'], secondary: ['Rent the Ranger', 'rent.html'] },
        related: [
            { title: 'Maiden trip: Bosnia and Slovenia', sub: 'Trip', img: { src: '/images/stories/bosnia-slovenia/rama-lake-roof.jpg', w: 1280, h: 960 }, page: 'bosnia-slovenia.html' },
            { title: 'Autumn on Elba', sub: 'Trip', img: img(41, 1960, 2614) }
        ]
    };
}
