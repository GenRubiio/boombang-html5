import { defineConfig } from 'vitest/config'

// Separate from vite.config.js on purpose (design.md §8): the app's Vite config wires Vue,
// SSL and Phaser-oriented build settings that unit tests for pure logic modules do not need.
// No jsdom, no Phaser instantiation — every unit test here imports pure logic.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'scripts/**/*.test.cjs'],
  },
})
