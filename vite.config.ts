import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import devServer from '@hono/vite-dev-server';
import ssg from '@hono/vite-ssg';
import nodeAdapter from '@hono/vite-dev-server/node';

// Every file under src/client/ becomes a build entry: client.tsx is the JS
// bundle, each .css file is emitted as its own stylesheet.
function clientInputs() {
  const root = path.resolve('src/client');
  const inputs: Record<string, string> = {};
  for (const file of fs.readdirSync(root, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.(tsx?|css)$/.test(file)) {
      continue;
    }
    const { name } = path.parse(file);
    if (inputs[name]) {
      throw new Error(`Duplicate client entry "${name}" for ${file}`);
    }
    inputs[name] = path.join(root, file);
  }
  return inputs;
}

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    // Client bundle build
    return {
      build: {
        outDir: 'dist/static',
        rollupOptions: {
          input: clientInputs(),
          output: {
            entryFileNames: '[name]-[hash].js',
            assetFileNames: (info) =>
              info.names.some((name) => name.endsWith('.css'))
                ? '[name]-[hash][extname]'
                : 'assets/[name]-[hash][extname]',
          },
        },
        manifest: true,
        emptyOutDir: false,
        copyPublicDir: true,
      },
      esbuild: {
        jsxImportSource: 'hono/jsx/dom',
      },
    };
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
  };
});
