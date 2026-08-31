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
          input: {
            client: './src/client/index.tsx',
            home: './src/styles/home.css',
            static: './src/styles/static.css',
            dynamic: './src/styles/dynamic.css',
          },
          output: {
            entryFileNames: 'client.js',
            dir: 'dist',
            assetFileNames: (info) =>
              info.names.some((name) => name.endsWith('.css'))
                ? 'styles/[name][extname]'
                : 'assets/[name]-[hash][extname]',
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
    server: {
      port: 3000,
    },
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
