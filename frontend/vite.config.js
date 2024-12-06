import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// http://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '147.79.67.165',  // Allow access from all network interfaces
    port: 3000,             // Specify the port
    http: {
      key: fs.readFileSync('../backend/key.pem'),     // Path to your private key
      cert: fs.readFileSync('../backend/cert.pem'),  // Path to your SSL certificate
    },
  },
})
