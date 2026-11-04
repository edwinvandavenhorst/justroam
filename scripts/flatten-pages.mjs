// The Vercel adapter always writes pages as /rent/index.html. Google knows
// this site as /rent.html, so after the build every Astro page (except the
// home pages) is moved to <name>.html. Old pages in public/ that live in a
// folder on purpose, such as /booking/claim/, are left alone because only
// names that exist in src/pages are touched.
import { existsSync, readdirSync, renameSync, rmdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const pagesDir = 'src/pages';
const outDir = '.vercel/output/static';

function astroPages(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === 'api' ? [] : astroPages(full);
        if (!entry.name.endsWith('.astro') || entry.name === 'index.astro') return [];
        return [relative(pagesDir, full).replace(/\.astro$/, '').split(sep).join('/')];
    });
}

for (const page of astroPages(pagesDir)) {
    const from = join(outDir, page, 'index.html');
    if (!existsSync(from)) continue;
    renameSync(from, join(outDir, page + '.html'));
    rmdirSync(join(outDir, page));
    console.log(`flatten-pages: /${page}/ -> /${page}.html`);
}
