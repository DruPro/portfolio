import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            // default options are shown. On some platforms
            // these options are set automatically — see below
            pages: 'build',
            assets: 'build',
            fallback: '404.html', // Change to 'index.html' if you want an SPA
            precompress: false,
            strict: true
        }),
        paths: {
            // IMPORTANT: Replace 'portfolio' with your actual repository name
            base: process.env.NODE_ENV === 'production' ? '/portfolio' : '',
        }
    }
};

export default config;