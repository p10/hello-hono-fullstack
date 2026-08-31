import { Hono } from 'hono'
import { disableSSG } from 'hono/ssg'
import { renderToString } from 'hono/jsx/dom/server'
import { home } from './pages/Home'
import { staticPage } from './pages/Static'
import { dynamicPage } from './pages/Dynamic'

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

export { app }
export type AppType = typeof app
