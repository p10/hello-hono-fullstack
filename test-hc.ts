import { Hono } from 'hono'
import { hc } from 'hono/client'

const routes = new Hono()
  .get('/api/hello', (c) => c.json({ message: 'hello', timestamp: 'now' }))

type AppType = typeof routes

const client = hc<AppType>('http://localhost:3000/')

async function test() {
  const res = await client.api.hello.$get()
  const data = await res.json()
  console.log(data.message)
}
