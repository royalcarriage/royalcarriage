import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  site: 'https://admin.royalcarriagelimo.com',
  integrations: [tailwind()],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@royal-carriage/ui': path.resolve(__dirname, '../../packages/ui'),
        '@royal-carriage/firebase': path.resolve(__dirname, '../../packages/firebase'),
        '@royal-carriage/seo': path.resolve(__dirname, '../../packages/seo'),
      },
    },
  },
});
