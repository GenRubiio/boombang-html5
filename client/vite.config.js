import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: false,
    allowedHosts: ['play.boommania.com'],
    proxy: {
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Reduce memory usage during build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    // Enable chunk splitting to reduce bundle size
    rollupOptions: {
      // Suppress dynamic import warnings for intentional circular dependency avoidance
      onwarn(warning, warn) {
        // Suppress warnings about dynamic imports for modules that are also statically imported
        if (warning.code === 'DYNAMIC_IMPORT' && 
            (warning.message.includes('CacheManager.js') || 
             warning.message.includes('AvatarManager.js'))) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          // Separate vendor libraries
          phaser: ['phaser'],
          vue: ['vue', 'pinia', 'vue-i18n'],
          vendor: ['gsap', 'jquery', 'socket.io-client'],
          // Split game core modules to avoid dynamic/static import conflicts
          'game-managers': [
            './src/phaser/managers/CacheManager.js',
            './src/phaser/managers/AvatarManager.js',
            './src/phaser/managers/AssetVersionManager.js'
          ],
          // Group related loaders together
          'game-loaders': [
            './src/phaser/loaders/CachedAtlasLoader.js'
          ]
        },
        // Limit chunk size
        maxParallelFileOps: 3,
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
      // Optimize module resolution
      treeshake: {
        preset: 'recommended'
      }
    },
    // Reduce concurrent operations to save memory
    chunkSizeWarningLimit: 1000
  }
})
