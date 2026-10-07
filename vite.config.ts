import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Port fixe : le MCP du sprint 2 est déclaré sur http://localhost:5173/mcp dans .mcp.json.
  server: { port: 5173, strictPort: true },
  preview: { allowedHosts: ['your-app.onrender.com'] }
})
