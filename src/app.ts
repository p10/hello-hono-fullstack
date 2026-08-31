import { Hono } from 'hono'
import { disableSSG } from 'hono/ssg'
import { renderToString } from 'hono/jsx/dom/server'
import { serveStatic } from '@hono/node-server/serve-static'
import { home } from './pages/Home.js'
import { staticPage } from './pages/Static.js'
import { dynamicPage } from './pages/Dynamic.js'

const app = new Hono()
  .get('/', (c) => {
    return c.html(renderToString(home()))
  })
  .get('/static', (c) => {
    return c.html(renderToString(staticPage()))
  })
  .get('/dynamic', disableSSG(), (c) => {
    return c.html(renderToString(dynamicPage(new Date().toISOString())))
  })
  .get('/api/hello', disableSSG(), (c) => {
    return c.json({
      message: 'Hello from Hono',
      timestamp: new Date().toISOString(),
    })
  })
  .use('/*', serveStatic({ root: './dist' }))

export { app }
export type AppType = typeof app
