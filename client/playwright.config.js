import { defineConfig } from '@playwright/test'

// design.md §10: resolved-state gate for every character batch from PR2 onward. Drives
// `client/harness.html` (Vite dev server), never the production build or a real gameplay
// scene — no server/API/DB/login dependency (design.md §10, cost 8).
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    // "localhost", not "127.0.0.1": this machine resolves "localhost" to ::1 and Vite's dev
    // server (no --host flag) only binds that address, not 127.0.0.1 — verified live (`nc -zv
    // 127.0.0.1 5183` refused, `nc -zv localhost 5183` succeeded against the same server).
    baseURL: 'http://localhost:5183',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: 'http://localhost:5183/harness.html',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_AVATAR_HARNESS: 'true',
      VITE_LAYERED_AVATARS: 'true',
      // tasks.md slice 21 task 8: real-game-scene validation surface, additive to the harness
      // above — never on in a real deployment (this webServer only ever runs under `vite dev`
      // for Playwright).
      VITE_AVATAR_HARNESS_REAL_SCENE: 'true',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
