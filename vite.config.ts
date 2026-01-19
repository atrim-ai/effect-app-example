import { defineConfig } from 'vite'
import effectPlugin from '@clayroach/unplugin/vite'

export default defineConfig({
  plugins: [
    effectPlugin({
      sourceTrace: true,
      spanTrace: true
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'effect',
        '@effect/opentelemetry',
        '@effect/platform',
        '@effect/platform-node',
        '@opentelemetry/api',
        '@atrim/instrument-node',
        '@atrim/instrument-node/effect/auto',
        /^node:/
      ]
    },
    outDir: 'dist',
    minify: false
  }
})
