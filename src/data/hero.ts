// Photo settings for the home page hero, shared by the English and Dutch page.
// The texts per slide live in src/components/HeroCarousel.astro.
//
// How to adjust a slide:
//   1. Open the home page with ?tune behind the address, for example
//      https://staging.justroam.nl/?tune (or http://localhost:4321/?tune).
//   2. Pick the slide, drag the sliders and choose the text side until it looks right.
//      Make the window narrow (or use your phone) to set the mobile crop.
//   3. Copy the line the panel shows and paste it over the matching line below.
//
// focus:        which part of the photo stays visible on desktop, as 'x% y%'.
//               '50% 0%' keeps the top, '50% 100%' keeps the bottom,
//               '0% 50%' keeps the left side, '100% 50%' the right side.
// focusMobile:  the same for phones and small tablets (up to 960px wide).
// side:         where the text sits on desktop: 'left' or 'right'.
//               On phones the text always sits at the bottom.

export type HeroPhoto = {
    img: string;
    w: number;
    h: number;
    focus: string;
    focusMobile: string;
    side: 'left' | 'right';
};

export const heroPhotos: HeroPhoto[] = [
    { img: '/images/hero.jpg', w: 1960, h: 1470, focus: '50% 63%', focusMobile: '28% 50%', side: 'right' },
    { img: '/images/rent/IMG_4042.jpeg', w: 1920, h: 1440, focus: '41% 29%', focusMobile: '52% 50%', side: 'left' },
    { img: '/images/rent/IMG_4831.jpeg', w: 1960, h: 1470, focus: '50% 28%', focusMobile: '50% 50%', side: 'right' }
];
