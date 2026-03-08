import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		assetsInlineLimit: Infinity
	},
	define: {
		__VERSION__: JSON.stringify('0.16.34')
	}
});
