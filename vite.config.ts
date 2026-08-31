import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import ssg from '@hono/vite-ssg'
import nodeAdapter from '@hono/vite-dev-server/node'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    // Client bundle build
    return {
      build: {
        rollupOptions: {
          input: ['./src/client/index.tsx'],
          output: {
            entryFileNames: 'client.js',
            dir: 'dist',
          },
        },
        emptyOutDir: false,
        copyPublicDir: false,
      },
      esbuild: {
        jsxImportSource: 'hono/jsx/dom',
      },
    }
  }

  // Default: dev server or SSG build
  return {
    plugins: [
      devServer({
        entry: 'src/index.tsx',
        adapter: nodeAdapter,
      }),
      ssg({
        entry: 'src/index.tsx',
      }),
    ],
    esbuild: {
      jsxImportSource: 'hono/jsx',
    },
  }
})
