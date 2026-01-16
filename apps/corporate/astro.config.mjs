import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://chicagoexecutivecarservice.web.app',
  integrations: [
    tailwind()
  ],
  output: 'static',
  build: {
    format: 'file'
  }
});
