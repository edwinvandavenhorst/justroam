// Questions and answers for the two FAQ pages, in English and Dutch.
// Answers may hold simple HTML (links, <b>). Change a text here and the page
// and its Google FAQ data follow.
import { business, links } from './site';

export type Qa = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Qa[] };

const mail = `<a href="mailto:${business.email}">${business.email}</a>`;
const gh = `<a href="${links.gearhive}" rel="noopener">Gearhive</a>`;
const goboony = `<a href="${links.goboony}" rel="noopener">Goboony</a>`;

export const rangerFaq: Record<'en' | 'nl', FaqGroup[]> = {
    en: [
        {
            id: 'before',
            title: 'Before you rent',
            items: [
                { q: 'What are the rental requirements?', a: "You need a valid driving licence that you have held for at least 2 years, and you must be 25 or older. Please show your licence at pickup." },
                { q: 'How do I book the Ranger?', a: `Through our ${goboony} page. For longer rentals (3+ weeks), contact us directly so we can discuss options and pricing.` },
                { q: "What's included in the rental?", a: 'The fully equipped Ford Ranger with two rooftop tents, basic camping equipment, kitchen supplies, mattress covers and recovery gear. Insurance and breakdown cover are included too. Sleeping bags and pillows are not.' },
                { q: 'Is there a minimum rental period?', a: 'Yes, the minimum rental period is 2 days.' },
                { q: 'Can I take the Ranger outside the Netherlands?', a: 'Yes. The Ranger is insured within Europe. Other international trips are possible: let us know your destination when booking, so we can make sure you have the right documents.' },
                { q: 'What about tolls?', a: "Tolls are your responsibility. We'll let you know if there's a valid toll vignette on the car at the time of rental." },
                { q: 'Can I bring pets?', a: 'Maybe! Let us know in advance so we can arrange proper cleaning afterwards. An extra cleaning fee may apply.' },
                { q: 'Is there a security deposit?', a: 'Yes, a deposit of €1,200. It is released within 48 hours after we have inspected the Ranger on return.' },
                { q: 'Can I drive the Ranger to another country and leave it there?', a: 'No, the Ranger always comes back to the pickup location. All costs of recovering the car are charged to the renter, plus €1,000 per day of travel.' }
            ]
        },
        {
            id: 'pickup',
            title: 'Collecting the Ranger',
            items: [
                { q: 'Where do I collect the Ranger?', a: "In Voorburg, near The Hague. We'll send the exact address and directions once your booking is confirmed." },
                { q: 'What do I need to bring?', a: "Your valid driving licence and a payment method for the security deposit. We'll give you a full handover of all the equipment." },
                { q: 'What about insurance?', a: "Insurance and breakdown cover are included in your rental through Goboony. You're responsible for the deductible in case of damage. We'll explain all the details at pickup." },
                { q: 'Do you offer delivery?', a: 'No, pickup is from our location in Voorburg.' },
                { q: 'How long does the handover take?', a: "Plan for about 30 to 45 minutes. We'll walk you through the Ranger, the camping gear, how to set up the tents and the awning, and answer your questions. We want you to feel confident before you hit the road." }
            ]
        },
        {
            id: 'during',
            title: 'During your trip',
            items: [
                { q: 'What fuel does the Ranger use?', a: 'Diesel. It averages around 10 L/100 km, depending on how and where you drive.' },
                { q: 'How big is the Ranger?', a: '5.40 m long, 2.20 m wide (including mirrors) and 2.45 m high.' },
                { q: "Help, the screen says 'add AdBlue'", a: 'No panic! Almost every fuel station in Europe sells AdBlue. Fill it up through the small blue cap behind the fuel flap.' },
                { q: 'What if I need help with the tents, the awning or the equipment?', a: 'No panic, using it for the first time is new for everyone. Call us and we will talk you through it or help you get going again.' },
                { q: 'What if the Ranger breaks down?', a: "Breakdown cover (Europe only) is included. Call ANWB roadside assistance on <b>+31 88 269 2100</b>, and please let us know as well." },
                { q: 'Can I extend my rental?', a: "If the Ranger isn't booked after your rental, an extension is usually possible. Contact us as soon as you know, and we'll check availability and arrange it." },
                { q: 'What happens if I damage the Ranger?', a: "Insurance covers most damage, but you're responsible for the deductible (€1,250). We inspect the Ranger together before and after your rental to record its condition. Always report incidents straight away." },
                { q: 'Is camping equipment included?', a: 'Yes: camping chairs, a table, cooking gear and basic kitchen supplies. You bring sleeping bags, pillows, food, personal items and your sense of adventure.' },
                { q: 'What should I do at the end of my rental?', a: "Return the Ranger with a full tank of diesel, a clean interior and all equipment present. We'll walk around it together, check for damage and release your deposit if everything is in order." }
            ]
        },
        {
            id: 'build',
            title: 'Builds',
            items: [
                { q: 'Do you build custom overland vehicles?', a: 'Yes. Whether you want a simple rooftop tent setup or a full expedition vehicle, we help you design and build it.' },
                { q: 'How long does a build take?', a: "It depends on the build. A basic setup (second battery, charger and solar panels) typically takes 2 to 4 weeks. Builds with custom fabrication can take 3 to 4 months. You get a detailed timeline during planning, and we keep you posted about delays from parts deliveries." },
                { q: 'Can you work with my existing vehicle?', a: "Absolutely. We can fit out your own pickup or 4x4. We'll assess your vehicle and recommend the best setup for your needs and budget." },
                { q: 'How much does a build cost?', a: 'It depends on what you want. A basic rooftop tent setup starts around €3,000 to €5,000; a full build depends on the specification. Contact us for a quote based on your plans.' },
                { q: 'Do you provide maintenance after the build?', a: 'Yes, for everything we built: servicing, upgrades and repairs to keep your setup in top shape. We do not service the vehicle itself.' }
            ]
        }
    ],
    nl: [
        {
            id: 'before',
            title: 'Voordat je huurt',
            items: [
                { q: 'Wat zijn de huurvoorwaarden?', a: 'Je hebt een geldig rijbewijs nodig dat je minimaal 2 jaar hebt, en je bent minimaal 25 jaar. Je laat je rijbewijs zien bij het ophalen.' },
                { q: 'Hoe boek ik de Ranger?', a: `Via onze ${goboony}-pagina. Wil je langer huren (3 weken of meer), neem dan direct contact op, dan bespreken we de mogelijkheden.` },
                { q: 'Wat is inbegrepen bij de huur?', a: 'De volledig uitgeruste Ford Ranger met twee daktenten, kampeeruitrusting, keukengerei, matrashoezen en bergingsuitrusting. Verzekering en pechhulp zijn ook inbegrepen. Slaapzakken en kussens niet.' },
                { q: 'Is er een minimale huurperiode?', a: 'Ja, je huurt minimaal 2 dagen.' },
                { q: 'Mag ik met de Ranger buiten Nederland rijden?', a: 'Ja. De Ranger is verzekerd binnen Europa. Verder weg kan ook: laat ons weten waar je heen gaat, dan zorgen we voor de juiste papieren.' },
                { q: 'Hoe zit het met tol?', a: 'Tol is voor je eigen rekening. Zit er nog een geldig vignet op de auto, dan laten we je dat weten na het boeken.' },
                { q: 'Mag ik huisdieren meenemen?', a: 'Misschien! Neem vooraf contact op, dan maken we goede afspraken. Er kan een extra schoonmaaktoeslag gelden.' },
                { q: 'Is er een borg?', a: 'Ja, we vragen een borg van €1.200. Die geven we binnen 48 uur vrij nadat we de Ranger bij terugkomst hebben gecontroleerd.' },
                { q: 'Kan ik de Ranger in een ander land achterlaten?', a: 'Nee, de Ranger gaat altijd terug naar de ophaallocatie. Laat je hem elders achter, dan betaal je alle kosten om hem terug te halen, plus €1.000 per reisdag.' }
            ]
        },
        {
            id: 'pickup',
            title: 'Ophalen',
            items: [
                { q: 'Waar haal ik de Ranger op?', a: 'In Voorburg, bij Den Haag. Het precieze adres en de route krijg je zodra je boeking is bevestigd.' },
                { q: 'Wat moet ik meenemen?', a: 'Je geldige rijbewijs en een creditcard. Bij het ophalen lopen we samen alles door, van de tenten tot de rest van de auto.' },
                { q: 'Hoe zit het met de verzekering?', a: 'De verzekering loopt via Goboony. Pechhulp binnen Europa is standaard inbegrepen.' },
                { q: 'Brengen jullie de Ranger ook?', a: 'Nee, je haalt hem op bij ons in Voorburg.' },
                { q: 'Hoe lang duurt het ophalen?', a: 'Reken op ongeveer 30 tot 45 minuten. We laten je alles van de auto zien en hebben tijd voor je vragen. We willen dat je met een goed gevoel vertrekt.' }
            ]
        },
        {
            id: 'during',
            title: 'Tijdens je reis',
            items: [
                { q: 'Welke brandstof gebruikt de Ranger?', a: 'Diesel. Hij verbruikt gemiddeld ongeveer 10 l/100 km, afhankelijk van hoe en waar je rijdt.' },
                { q: 'Hoe groot is de Ranger?', a: '5,40 m lang, 2,20 m breed (inclusief spiegels) en 2,45 m hoog.' },
                { q: "Help, er staat 'add AdBlue' op het scherm", a: 'Geen paniek! Bijna elk tankstation in Europa verkoopt AdBlue. Je vult het bij via het kleine blauwe dopje achter de tankklep.' },
                { q: 'Wat als ik hulp nodig heb met de tent, de luifel of de uitrusting?', a: 'Geen paniek, de eerste keer is alles nieuw. Bel ons, dan helpen we je telefonisch verder.' },
                { q: 'Wat als ik pech krijg?', a: 'Pechhulp binnen Europa is inbegrepen. Bel de ANWB Wegenwacht op <b>+31 88 269 2100</b> en laat het ons ook even weten.' },
                { q: 'Kan ik mijn huur verlengen?', a: 'Als de Ranger daarna nog vrij is, kan dat meestal. Neem zo snel mogelijk contact op, dan kijken we naar de beschikbaarheid.' },
                { q: 'Wat als ik schade maak?', a: 'De verzekering dekt de meeste schade, maar het eigen risico (€1.250) is voor jou. We controleren de Ranger samen voor en na de huur en leggen de staat vast. Gebeurt er iets, laat het ons dan zo snel mogelijk weten.' },
                { q: 'Is kampeeruitrusting inbegrepen?', a: 'Ja: vier campingstoelen, een tafel, kookgerei, borden en bestek. Jij neemt een slaapzak, kussen, eten, je eigen spullen en zin in avontuur mee.' },
                { q: 'Wat moet ik doen bij het terugbrengen?', a: 'Lever de Ranger volgetankt in, met een schoon interieur en alle uitrusting. We lopen samen een rondje om te zien of er schade is of iets ontbreekt.' }
            ]
        },
        {
            id: 'build',
            title: 'Ombouw',
            items: [
                { q: 'Doen jullie maatwerk?', a: 'Ja. Of je nu alleen elektra wilt of een volledig overland-voertuig: we ontwerpen en bouwen het samen met je.' },
                { q: 'Hoe lang duurt een ombouw?', a: 'Dat hangt af van de ombouw. Een basis (tweede accu, lader en zonnepanelen) duurt meestal 2 tot 4 weken. Een uitgebreidere ombouw kan 3 tot 4 maanden duren, mede afhankelijk van de levertijd van onderdelen. Loopt iets uit, dan hoor je dat zo snel mogelijk.' },
                { q: 'Kunnen jullie met mijn eigen auto werken?', a: 'Zeker. We bouwen je eigen pickup of 4x4 om. We bekijken samen de mogelijkheden en adviseren de beste opzet voor je auto en budget.' },
                { q: 'Wat kost een ombouw?', a: 'Dat hangt af van wat je wilt. Een basis met daktent begint rond €3.000 tot €5.000; de prijs van een volledige ombouw hangt af van de uitvoering. Neem contact op voor een offerte op maat.' },
                { q: 'Doen jullie onderhoud na de ombouw?', a: 'Ja, op alles wat we hebben ingebouwd. Onderhoud aan de auto zelf doen we niet.' }
            ]
        }
    ]
};

export const gearFaq: Record<'en' | 'nl', FaqGroup[]> = {
    en: [
        {
            id: 'before',
            title: 'Before you rent',
            items: [
                { q: 'What can I rent, and can I rent both together?', a: `Our Hapro Traxer 6.6 roof box (410 L) and our Thule VeloCompact 926 bike carrier (3 bikes, max 2 e-bikes), separately or together. You book on ${gh}.` },
                { q: 'What are the rental requirements?', a: 'You must be 24 or older and show a valid ID at pickup. For the bike carrier, your car needs a type-approved towbar with a 13-pin socket. For the roof box, you need roof bars rated for the load. Maximum loads are 75 kg for the roof box and 60 kg in total (25 kg per bike) for the carrier.' },
                { q: 'How much does it cost?', a: `The current rates are shown on ${gh}.` },
                { q: 'Is there a minimum rental period?', a: "Yes, 1 day, booked at least 24 hours before pickup." },
                { q: 'Where do I collect the equipment?', a: 'In person in Voorburg, at an agreed time, usually between 9:00 and 20:00.' }
            ]
        },
        {
            id: 'booking',
            title: 'Booking & payment',
            items: [
                { q: 'How does booking work?', a: `All rentals are booked on ${gh}, or straight from the booking module on our roof box and bike carrier page.` },
                { q: 'Can I book from outside the Netherlands?', a: `Automated booking covers the Netherlands, Belgium and Germany. From any other country, email ${mail} with your dates and we'll arrange the booking by hand.` },
                { q: 'Can I change my booking after it has been accepted?', a: "Yes. Log in to your Gearhive account and go to 'bookings', where you can change or cancel it." }
            ]
        },
        {
            id: 'changes',
            title: 'Cancellation & changes',
            items: [
                { q: 'What if I return the equipment late?', a: "Late returns may be charged at the daily rate, per started day, and can affect the next renter's booking." },
                { q: 'What if JustRoam needs to cancel my booking?', a: "If the equipment becomes unavailable (for example after damage in a previous rental), we may cancel and refund 100% of what you've paid." }
            ]
        },
        {
            id: 'damage',
            title: 'Damage, deposit & liability',
            items: [
                { q: "What if I damage the equipment, or it's lost or stolen?", a: `For accidental loss, theft or damage beyond normal wear, you're liable up to the amount of your deposit. That cap doesn't apply in case of negligence (for example leaving the equipment unlocked) or wilful misconduct: then you're liable for the full replacement value. If the equipment is stolen, report it to the local police straight away and let us know at ${mail} within 24 hours.` },
                { q: 'Is the equipment insured?', a: "No insurance held by JustRoam covers the equipment during the rental. It's rented at your own risk, within the liability cap above. Damage to your own car or to third parties from fitting or using the equipment is your responsibility." },
                { q: 'Where can I use the roof box or bike carrier?', a: 'Only within the EU, the United Kingdom, Switzerland and Norway, for normal road use. Off-road, competition or commercial use is not allowed.' },
                { q: 'Will you help fit the equipment to my car?', a: "Yes, we fit it for you at pickup, as long as your car already has suitable roof bars or a towbar. We may ask you to lend a hand." }
            ]
        }
    ],
    nl: [
        {
            id: 'before',
            title: 'Voordat je huurt',
            items: [
                { q: 'Wat kan ik huren, en kan ik beide tegelijk huren?', a: `Onze Hapro Traxer 6.6 dakkoffer (410 L) en onze Thule VeloCompact 926 fietsendrager (3 fietsen, max. 2 e-bikes), los of samen. Je boekt via ${gh}.` },
                { q: 'Wat zijn de huurvoorwaarden?', a: 'Je bent 24 jaar of ouder en laat bij het ophalen een geldig identiteitsbewijs zien. Voor de fietsendrager heeft je auto een goedgekeurde trekhaak met 13-polige aansluiting nodig. Voor de dakkoffer heb je dakdragers nodig die de belasting aankunnen. De maximale belasting is 75 kg voor de dakkoffer en 60 kg in totaal (25 kg per fiets) voor de drager.' },
                { q: 'Hoeveel kost het?', a: `De actuele tarieven staan op ${gh}.` },
                { q: 'Is er een minimale huurperiode?', a: 'Ja, 1 dag, en je boekt minimaal 24 uur voor het ophalen.' },
                { q: 'Waar haal ik het materiaal op?', a: 'Persoonlijk in Voorburg, op een afgesproken tijd, meestal tussen 9.00 en 20.00 uur.' }
            ]
        },
        {
            id: 'booking',
            title: 'Boeken & betalen',
            items: [
                { q: 'Hoe werkt boeken?', a: `Je boekt alles via ${gh}, of direct in de boekingsmodule op onze pagina over de dakkoffer en fietsendrager.` },
                { q: 'Kan ik boeken vanuit het buitenland?', a: `Automatisch boeken kan vanuit Nederland, België en Duitsland. Vanuit een ander land mail je je data naar ${mail}, dan regelen we de boeking met de hand.` },
                { q: 'Kan ik mijn boeking wijzigen nadat die is geaccepteerd?', a: "Ja. Log in op Gearhive en ga naar 'boekingen', daar kun je hem wijzigen of annuleren." }
            ]
        },
        {
            id: 'changes',
            title: 'Annuleren & wijzigen',
            items: [
                { q: 'Wat als ik het materiaal te laat terugbreng?', a: 'Te laat terugbrengen kan worden doorberekend tegen het dagtarief, per begonnen dag, en kan gevolgen hebben voor de volgende huurder.' },
                { q: 'Wat als JustRoam mijn boeking moet annuleren?', a: 'Is het materiaal niet beschikbaar (bijvoorbeeld door schade bij een vorige huur), dan kunnen we annuleren en krijg je 100% van wat je hebt betaald terug.' }
            ]
        },
        {
            id: 'damage',
            title: 'Schade, borg & aansprakelijkheid',
            items: [
                { q: 'Wat als ik het materiaal beschadig, of het raakt kwijt of wordt gestolen?', a: `Bij onopzettelijk verlies, diefstal of schade die verder gaat dan normale slijtage ben je aansprakelijk tot het bedrag van je borg. Die grens geldt niet bij nalatigheid (bijvoorbeeld het materiaal niet op slot laten) of opzet: dan ben je aansprakelijk voor de volledige vervangingswaarde. Bij diefstal doe je direct aangifte bij de lokale politie en laat je het ons binnen 24 uur weten via ${mail}.` },
                { q: 'Is het materiaal verzekerd?', a: 'Tijdens de huur valt het materiaal niet onder een verzekering van JustRoam. Je huurt op eigen risico, binnen de aansprakelijkheidsgrens hierboven. Schade aan je eigen auto of aan anderen door het monteren of gebruiken van het materiaal is jouw verantwoordelijkheid.' },
                { q: 'Waar mag ik de dakkoffer of fietsendrager gebruiken?', a: 'Alleen binnen de EU, het Verenigd Koninkrijk, Zwitserland en Noorwegen, voor normaal gebruik op de weg. Offroad, wedstrijden of commercieel gebruik is niet toegestaan.' },
                { q: 'Helpen jullie met monteren?', a: 'Ja, we monteren het materiaal bij het ophalen, als je auto al geschikte dakdragers of een trekhaak heeft. Misschien vragen we je even te helpen.' }
            ]
        }
    ]
};

// Plain text for Google's FAQ data.
export const plain = (html: string) => html.replace(/<[^>]+>/g, '');
