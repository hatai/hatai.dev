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
      },
    }),
    tailwindcss(),
    solid({ ssr: true }),
  ],
})
