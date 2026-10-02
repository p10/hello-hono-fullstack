import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { app } from './app.js';

// Runtime server: one static-first middleware serves everything emitted under
// dist/static (SSG HTML, client bundle, styles); anything without a matching
// file falls through to the app's routes. Extensionless paths map to the
// corresponding `.html` file so new SSG pages need no extra wiring.
const serverApp = new Hono()
  .use(
    '/*',
    serveStatic({
      root: './dist/static',
      rewriteRequestPath: (path) =>
        path === '/' ||
        path.endsWith('/') ||
        (path.split('/').pop()?.includes('.') ?? false)
          ? path
          : `${path}.html`,
    }),
  )
  .route('/', app);

serve({ fetch: serverApp.fetch, port: 3000 }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
