import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  base: '/social-media-content-maschine',
  vite: {
    plugins: [tailwindcss()]
  }
});
