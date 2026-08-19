import { defineConfig } from 'vitest/config'
import path from 'path'

// Separate from vite.config.js on purpose (design.md §8): the app's Vite config wires Vue,
// SSL and Phaser-oriented build settings that unit tests for pure logic modules do not need.
// No jsdom, no Phaser instantiation — every unit test here imports pure logic.
//
// avatar-system-multichar-fixes PR2: mirrors vite.config.js's `@` alias (`./src`) so a pure
// helper co-located with I/O-shell code that uses the app's `@/...` import convention (e.g.
// harness/avatarHarnessApi.js's `resolveDirectionValue`) can still be unit-imported here
// without rewriting that file's import style to a relative path just for the test runner.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'scripts/**/*.test.cjs'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
