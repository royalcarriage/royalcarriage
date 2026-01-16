import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  site: 'https://chicago-partybus.com',
  integrations: [],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@royal-carriage/ui': path.resolve(__dirname, '../../packages/ui'),
        '@royal-carriage/seo': path.resolve(__dirname, '../../packages/seo'),
      },
    },
  },
});
