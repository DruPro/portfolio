import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            fallback: '404.html'
        }),
        paths: {
            // Hardcode '/portfolio' if you are deploying to https://drupro.github.io/portfolio/
            base: process.env.NODE_ENV === 'production' ? '/portfolio' : '',
        }
    }
};

export default config;