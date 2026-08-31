import app from './dist/index.js'
import { toSSG } from 'hono/ssg'
import fs from 'fs/promises'

const result = await toSSG(app, fs, { dir: './dist' })

if (result.success) {
  console.log('SSG complete. Generated files:')
  for (const file of result.files) {
    console.log(`  ${file}`)
  }
} else {
  console.error('SSG failed:', result.error)
  process.exit(1)
}
