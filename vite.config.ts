import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/DarkDuck-Forum/',
  plugins: [react()],
  server: {
    hmr: {},
    port: 1337,
  }
})
