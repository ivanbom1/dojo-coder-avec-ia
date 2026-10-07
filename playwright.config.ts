import { defineConfig } from '@playwright/test'

// Les tests pilotent l'appli dans un vrai navigateur. `bun run test` démarre le serveur de
// dev s'il ne tourne pas déjà, puis rejoue les cartes passées.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1200, height: 800 },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
