import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import tailwindConfig from './tailwind.config.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [svelte()],
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer]
    }
  }
})