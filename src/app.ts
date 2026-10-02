import { Hono } from 'hono';
import { disableSSG } from 'hono/ssg';
import { renderToString } from 'hono/jsx/dom/server';
import { home } from './pages/home-page.js';
import { staticPage } from './pages/static-page.js';
import { dynamicPage } from './pages/dynamic-page.js';

// Build-time app: used by the SSG build and the dev server. It has no static
// file middleware, so `toSSG` always renders fresh HTML. The production server
// (src/server.ts) mounts this app behind a static-first middleware.
export const app = new Hono()
  .get('/', (c) => {
    return c.html(renderToString(home()));
  })
  .get('/static-page', (c) => {
    return c.html(renderToString(staticPage()));
  })
  .get('/dynamic', disableSSG(), (c) => {
    return c.html(renderToString(dynamicPage(new Date().toISOString())));
  })
  .get('/api/hello', disableSSG(), (c) => {
    return c.json({
      message: 'Hello from Hono',
      timestamp: new Date().toISOString(),
    });
  });

export type AppType = typeof app;
