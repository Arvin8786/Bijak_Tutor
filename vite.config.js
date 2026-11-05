import {defineConfig} from 'vite';
// Relative assets work on Cloudflare root and GitHub Pages /Bijak_Tutor/.
export default defineConfig({base:'./',build:{outDir:'dist'}});
