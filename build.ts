import { app } from './dist/index.js';
import { toSSG } from 'hono/ssg';
import fs from 'node:fs/promises';
import path from 'node:path';

const result = await toSSG(app, fs, { dir: './dist/static' });

if (!result.success) {
  console.error('SSG failed:', result.error);
  process.exit(1);
}

// Ship the web-server templates next to the static output so the built
// directory can be deployed as-is.
for (const name of ['nginx.conf', 'apache.conf']) {
  const target = path.join('dist/static', name);
  await fs.copyFile(path.join('src/hosting', name), target);
}
