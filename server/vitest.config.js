const { defineConfig } = require('vitest/config')

// server/ is CommonJS (no "type": "module" in package.json). vitest handles CJS test files
// and CJS `require()`-based source modules natively, so no extra transform config is needed.
module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
