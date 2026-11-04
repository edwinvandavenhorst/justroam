// Small panel for choosing the crop and text side of each home hero photo.
// It only loads when the page address ends in ?tune, changes nothing for
// other visitors and saves nothing: copy the line it shows into src/data/hero.ts.
import { heroPhotos, type HeroPhoto } from '../data/hero';

const MOBILE = window.matchMedia('(max-width: 960px)');

const split = (focus: string): [number, number] => {
    const [x, y] = focus.split(/\s+/).map((v) => Math.round(parseFloat(v)));
    return [Number.isFinite(x) ? x : 50, Number.isFinite(y) ? y : 50];
};

const line = (p: HeroPhoto) =>
    `{ img: '${p.img}', w: ${p.w}, h: ${p.h}, focus: '${p.focus}', focusMobile: '${p.focusMobile}', side: '${p.side}' },`;

export function mountTuner(hero: HTMLElement, show: (n: number) => void, current: () => number) {
    const slides = [...hero.querySelectorAll<HTMLElement>('.slide')];
    const photos = heroPhotos.map((p) => ({ ...p }));

    const panel = document.createElement('div');
    panel.className = 'hero-tuner';
    panel.innerHTML = `
        <div class="ht-head"><b>Hero photo</b><button type="button" data-act="min" aria-label="Fold">–</button></div>
        <div class="ht-body">
            <div class="ht-row ht-slides">${photos.map((_, i) => `<button type="button" data-slide="${i}">Slide ${i + 1}</button>`).join('')}</div>
            <p class="ht-mode"></p>
            <label>Left / right <span data-out="x"></span><input type="range" min="0" max="100" data-axis="x"></label>
            <label>Top / bottom <span data-out="y"></span><input type="range" min="0" max="100" data-axis="y"></label>
            <div class="ht-row ht-side"><span>Text</span><button type="button" data-side="left">Left</button><button type="button" data-side="right">Right</button></div>
            <p class="ht-hint">Paste this line over slide <span data-out="n"></span> in src/data/hero.ts:</p>
            <code></code>
            <button type="button" class="ht-copy" data-act="copy">Copy line</button>
        </div>`;
    document.body.append(panel);

    const style = document.createElement('style');
    style.textContent = `
        .hero-tuner { position: fixed; z-index: 100; right: 16px; bottom: 16px; width: min(360px, calc(100vw - 32px)); background: #fff; color: #2b1d12; border-radius: 18px; box-shadow: 0 18px 50px rgba(0,0,0,.3); font: 500 14px/1.4 Barlow, sans-serif; padding: 14px 16px; }
        .hero-tuner.min .ht-body { display: none; }
        .hero-tuner .ht-head { display: flex; justify-content: space-between; align-items: center; }
        .hero-tuner button { font: inherit; border: 1px solid #e6d8bf; background: #fbf6ec; border-radius: 999px; padding: 5px 12px; cursor: pointer; color: inherit; }
        .hero-tuner button.on { background: #2c5f2d; border-color: #2c5f2d; color: #fff; }
        .hero-tuner .ht-row { display: flex; gap: 6px; align-items: center; margin: 10px 0; flex-wrap: wrap; }
        .hero-tuner label { display: block; margin: 10px 0 0; font-weight: 600; }
        .hero-tuner label span { float: right; color: #6e5f4f; }
        .hero-tuner input[type=range] { width: 100%; accent-color: #2c5f2d; }
        .hero-tuner .ht-mode { margin: 4px 0 0; color: #6e5f4f; }
        .hero-tuner .ht-hint { margin: 12px 0 4px; color: #6e5f4f; font-size: 13px; }
        .hero-tuner code { display: block; background: #f5e6c8; border-radius: 10px; padding: 8px 10px; font-size: 12px; word-break: break-all; user-select: all; }
        .hero-tuner .ht-copy { margin-top: 8px; background: #2c5f2d; border-color: #2c5f2d; color: #fff; }
        @media (max-width: 960px) { .hero-tuner .ht-side { display: none; } }`;
    document.head.append(style);

    const $ = <T extends Element>(sel: string) => panel.querySelector<T>(sel)!;
    const inputs = { x: $<HTMLInputElement>('[data-axis=x]'), y: $<HTMLInputElement>('[data-axis=y]') };

    const key = () => (MOBILE.matches ? 'focusMobile' : 'focus') as 'focus' | 'focusMobile';

    const apply = (i: number) => {
        const p = photos[i];
        const s = slides[i];
        s.style.setProperty('--focus', p.focus);
        s.style.setProperty('--focus-m', p.focusMobile);
        s.classList.toggle('side-left', p.side === 'left');
        s.classList.toggle('side-right', p.side === 'right');
    };

    const render = () => {
        const i = current();
        const p = photos[i];
        const [x, y] = split(p[key()]);
        inputs.x.value = String(x);
        inputs.y.value = String(y);
        $('[data-out=x]').textContent = `${x}%`;
        $('[data-out=y]').textContent = `${y}%`;
        $('[data-out=n]').textContent = String(i + 1);
        $('.ht-mode').textContent = MOBILE.matches
            ? 'Setting the mobile crop (screen up to 960px wide).'
            : 'Setting the desktop crop. Make the window narrow for mobile.';
        panel.querySelectorAll<HTMLButtonElement>('[data-slide]').forEach((b) => b.classList.toggle('on', Number(b.dataset.slide) === i));
        panel.querySelectorAll<HTMLButtonElement>('[data-side]').forEach((b) => b.classList.toggle('on', b.dataset.side === p.side));
        $('code').textContent = line(p);
    };

    const onSlide = () => {
        const i = current();
        photos[i][key()] = `${inputs.x.value}% ${inputs.y.value}%`;
        apply(i);
        render();
    };
    inputs.x.addEventListener('input', onSlide);
    inputs.y.addEventListener('input', onSlide);

    panel.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest('button');
        if (!b) return;
        if (b.dataset.slide) show(Number(b.dataset.slide));
        if (b.dataset.side) {
            photos[current()].side = b.dataset.side as HeroPhoto['side'];
            apply(current());
        }
        if (b.dataset.act === 'min') panel.classList.toggle('min');
        if (b.dataset.act === 'copy') {
            navigator.clipboard?.writeText(line(photos[current()])).then(() => {
                b.textContent = 'Copied';
                setTimeout(() => (b.textContent = 'Copy line'), 1500);
            });
        }
        render();
    });

    // keep the panel in step when the arrows, dots or a swipe change the slide
    hero.querySelectorAll('.hero-arrow, .hero-dots button').forEach((el) => el.addEventListener('click', () => setTimeout(render)));
    hero.addEventListener('touchend', () => setTimeout(render));
    MOBILE.addEventListener('change', render);
    render();
}
