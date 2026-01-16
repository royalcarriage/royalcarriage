import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://chicagoweddingtransportation.web.app',
  integrations: [
    tailwind()
  ],
  output: 'static',
  build: {
    format: 'file'
  }
});
