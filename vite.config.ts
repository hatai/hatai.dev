import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    // tanstackStart must come before the solid plugin
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Header links to routes that land in later tasks (/blog, /ja) 404 while
        // crawling; tolerate them until the route tree is complete.
        failOnError: false,
      },
    }),
    tailwindcss(),
    solid({ ssr: true }),
  ],
})
