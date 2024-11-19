import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '147.79.67.165',  // Allow access from all network interfaces
    port: 3000,        // (Optional) You can specify a custom port
  },
})