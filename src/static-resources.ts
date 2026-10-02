import fs from 'node:fs';
import path from 'node:path';

type PageName = 'home' | 'static' | 'dynamic';

type ManifestEntry = { file: string };

// During development Vite serves modules from source (with HMR). In production
// the client build emits hashed assets plus a Vite manifest mapping each source
// input to its hashed output file.
const isProd = !import.meta.env;

export function stylesheetHref(name: PageName) {
  return isProd
    ? resolveAsset(`src/client/${name}.css`)
    : `/src/client/${name}.css`;
}

export function jsHref() {
  return isProd
    ? resolveAsset('src/client/client.tsx')
    : '/src/client/client.tsx';
}

// import.meta.dirname is the compiled `dist/` directory at build and run time.
const assets: Record<string, ManifestEntry> | undefined = isProd
  ? JSON.parse(
      fs.readFileSync(
        path.join(import.meta.dirname, 'static/.vite/manifest.json'),
        'utf8',
      ),
    )
  : undefined;

function resolveAsset(source: string) {
  const entry = assets?.[source];
  if (!entry) {
    throw new Error(`Missing Vite manifest entry for "${source}"`);
  }
  return `/${entry.file}`;
}
