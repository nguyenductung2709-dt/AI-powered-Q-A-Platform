/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary_dark: '#0c111e',
				secondary_dark: '#161b28',
			},
		},
	},
	plugins: [],
}
