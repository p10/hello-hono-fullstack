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
            home: './src/client/home.css',
            static: './src/client/static.css',
            dynamic: './src/client/dynamic.css',
          },
          output: {
            entryFileNames: '[name]-[hash].js',
            dir: 'dist/static',
            assetFileNames: (info) =>
              info.names.some((name) => name.endsWith('.css'))
                ? '[name]-[hash][extname]'
                : 'assets/[name]-[hash][extname]',
          },
        },
        manifest: true,
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
        export: 'app',
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
