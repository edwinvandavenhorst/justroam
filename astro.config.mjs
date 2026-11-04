// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
    site: 'https://justroam.nl',
    // Keep the URLs the old site has in Google: /rent.html, /nl/build.html
    build: { format: 'file' },
    trailingSlash: 'ignore',
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'nl'],
        routing: { prefixDefaultLocale: false }
    },
    // Pages are static; only the /api routes run as functions
    output: 'static',
    adapter: vercel({
        imageService: true,
        imagesConfig: {
            sizes: [480, 800, 1200, 1600, 2000],
            formats: ['image/avif', 'image/webp'],
            domains: []
        }
    })
});
