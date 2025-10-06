import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages deployment with Supabase integration
export default defineConfig({
  plugins: [react()],
  base: '/cloud-health-map-v2/',
})
