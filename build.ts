import { app } from './dist/index.js';
import { toSSG } from 'hono/ssg';
import fs from 'node:fs/promises';

const result = await toSSG(app, fs, { dir: './dist/static' });

if (!result.success) {
  console.error('SSG failed:', result.error);
  process.exit(1);
}
