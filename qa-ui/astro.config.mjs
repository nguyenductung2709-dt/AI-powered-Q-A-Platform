import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [svelte(), tailwind()],
  output: 'server',
  server: {
    port: 3001,
    host: true,
  }
});