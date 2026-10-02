# Hono Full-Stack Hello World

A minimal application demonstrating how Hono's features work together:

- **Hono JSX** for server-side rendering
- **Hono SSG** for static site generation
- **Dynamic server routes** for per-request rendering
- **Hono RPC** for type-safe client-server communication
- **`hono/jsx/dom`** for client-side interactivity
- **Vite** for development, bundling, and external stylesheet processing

No React, Next.js, Astro, or other frontend framework is used.

## Architecture

```mermaid
flowchart TD
    Browser -->|GET /| HOME["SSG home page (build-time) + hono/jsx/dom"]
    Browser -->|GET /static-page| STATIC["SSG page (build-time)"]
    Browser -->|GET /dynamic| DYNAMIC["Dynamic SSR page (per-request)"]
    Browser -->|GET /client-[hash].js| CLIENT["hono/jsx/dom client bundle"]
    DYNAMIC --> API["/api/hello (Hono JSON route)"]
    CLIENT -->|Hono RPC hc&lt;AppType&gt;| API
```

Routing and rendering split along two axes:

- **When the HTML is produced** — at build time (SSG) vs. per request (SSR).
- **Where the interactivity runs** — server-rendered only vs. a client-side `hono/jsx/dom` component.

## Commands

```bash
pnpm install      # install dependencies
pnpm dev          # start the Vite dev server (port 3000)
pnpm clean        # remove previous build output (rm -rf dist)
pnpm build        # clean, type-check, compile server, bundle client, generate SSG
pnpm start        # run the production server from dist/ (after pnpm build)
```

### What `pnpm build` does

| Step                   | Script         | Command                      | Output                                                                                             |
| ---------------------- | -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Remove previous output | `clean`        | `rm -rf dist`                | (none)                                                                                             |
| Type-check all sources | `typecheck`    | `tsc --noEmit`               | (none)                                                                                             |
| Compile server + pages | `build:server` | `tsc -p tsconfig.build.json` | `dist/*.js`, `dist/pages/*.js`                                                                     |
| Bundle client + CSS    | `build:client` | `vite build --mode client`   | `dist/static/client-[hash].js`, `dist/static/{name}-[hash].css`, `dist/static/.vite/manifest.json` |
| Generate static pages  | `build:ssg`    | `tsx build.ts`               | `dist/static/index.html`, `dist/static/static-page.html`, `dist/static/{nginx.conf,apache.conf}`   |

Compiled server code (`tsc` output: `dist/*.js`, `dist/pages/*.js`) lives
under `dist/`, while every static asset (HTML, client JS, CSS) is written to
`dist/static/`. The server compile uses `tsconfig.build.json`, which excludes
`src/client/` from emit; `pnpm typecheck` still checks it with `tsc --noEmit`.

The build is **clean-first**: `toSSG` and `tsc` never delete their previous
output, so a removed page could otherwise linger in `dist/static/` and be served
by the static-first runtime.

## Route classification

- **Build time (SSG):** `/` (home, with client JS) and `/static-page`, generated
  to `dist/static/index.html` and `dist/static/static-page.html`; served as static
  files, not re-rendered per request.
- **Server request time:** `/dynamic`, `/api/hello` (both opt out of SSG via `disableSSG()`)
- **Client-only interactive:** the `hono/jsx/dom` app mounted on `/` (loaded from
  the static home page)

## API reference: `GET /api/hello`

Returns a JSON payload with a server-generated timestamp.

- **Method/Path:** `GET /api/hello`
- **Content-Type:** `application/json`
- **Response:**

```json
{
  "message": "Hello from Hono",
  "timestamp": "2026-08-31T19:58:35.247Z"
}
```

The `timestamp` changes on every request. The route's type is inferred on the
client through Hono RPC — no `fetch()` call with hand-written types.

## External stylesheets (processed by Vite)

Each page's styles live in a separate file under `src/client/`, and the client
build (`vite build --mode client`) treats each one as a Rollup input, so Vite
minifies and bundles them directly into `dist/static/` with a content hash:

```text
src/client/home.css    -> dist/static/home-<hash>.css
src/client/static.css  -> dist/static/static-<hash>.css
src/client/dynamic.css -> dist/static/dynamic-<hash>.css
```

The page components never write inline `<style>`. Instead they inject a
`<link rel="stylesheet">` whose URL is chosen by `src/static-resources.ts`:

- **Development:** `import.meta.env` is defined, so pages link the **source**
  stylesheets (`/src/client/...`), which Vite serves with HMR and on-the-fly
  injection.
- **Production:** the hashed filenames are not known when the server is
  compiled, so `src/static-resources.ts` reads Vite's manifest
  (`dist/static/.vite/manifest.json`, written by `build:client`) at runtime and
  links the emitted files (e.g. `/home-<hash>.css`).

The same helper resolves the client bundle URL (`jsHref()`) between dev
(`/src/client/client.tsx`) and production (`/client-<hash>.js`). Keeping the badge
colors per page (green on `/static-page`, amber on `/dynamic`) is only possible
because each page has its own stylesheet — Vite would merge them into one asset
otherwise.

## What to inspect

- **View page source** on `/` to see HTML rendered by Hono JSX at build time
  (SSG).
- **Inspect `dist/static/index.html`** and **`dist/static/static-page.html`**
  after build to verify the SSG output contains real static HTML.
- **Refresh `/dynamic`** and observe the changing timestamp — this page is
  rendered per-request.
- **Open DevTools** on `/` and observe the client JavaScript loaded from
  `hono/jsx/dom`.
- **Click the counter** — state updates without a page reload.
- **Click "Call API"** — the client calls `/api/hello` via Hono RPC (no raw
  `fetch`) and displays the response.
- **Check `dist/static/`** to confirm Vite processed the per-page stylesheets.

## Static hosting (nginx / Apache)

The SSG build emits flat `.html` files and copies two web-server templates into
the built directory:

- `src/hosting/nginx.conf` -> `dist/static/nginx.conf`
- `src/hosting/apache.conf` -> `dist/static/apache.conf`

Both templates map clean URLs to the flat files emitted by `toSSG`
(`/static-page` serves `static-page.html`) so the built directory can be
deployed without a Node runtime:

- **nginx**: point `root` at `dist/static` and include the `server` block.
- **Apache**: use the file as `.htaccess` in `dist/static` (or inside a
  `<Directory>` block).

The Hono runtime also serves these two files, since they sit under
`dist/static` — block `/nginx.conf` and `/apache.conf` at the edge if that is
undesirable.

## Project structure

```
src/
├── app.ts                Build-time app: routes, RPC AppType, SSG exclusions
├── index.tsx             Re-exports app for Vite/SSG entry
├── server.ts             Runtime server: static-first serveStatic + mounts app
├── static-resources.ts   Dev/prod asset URL resolution (stylesheetHref, jsHref)
├── hosting/
│   ├── nginx.conf        Nginx template (clean URLs) copied to dist/static
│   └── apache.conf       Apache template (clean URLs) copied to dist/static
├── pages/
│   ├── home-page.tsx     SSG home page + client mount point
│   ├── static-page.tsx   SSG page (generated at build time)
│   └── dynamic-page.tsx  Dynamic page (rendered per request)
└── client/
    ├── client.tsx        Client bundle: counter + RPC caller
    ├── home.css          Home page styles (Vite-processed)
    ├── static.css        Static page styles
    └── dynamic.css       Dynamic page styles
build.ts                  SSG build script (tsx build.ts)
tsconfig.build.json       Server emit config (excludes src/client)
vite.config.ts            Vite: dev server + client build + SSG plugin
```

## Key files

| Feature               | File                                                            |
| --------------------- | --------------------------------------------------------------- |
| Hono JSX SSR          | `src/app.ts`, `src/pages/*.tsx`                                 |
| Hono SSG              | `src/pages/static-page.tsx`, `build.ts`                         |
| Dynamic server route  | `src/pages/dynamic-page.tsx`                                    |
| API route + RPC types | `src/app.ts` (exports `AppType`)                                |
| Hono RPC client       | `src/client/client.tsx`                                         |
| `hono/jsx/dom`        | `src/client/client.tsx`                                         |
| External stylesheets  | `src/client/*.css`, `src/static-resources.ts`, `vite.config.ts` |
| Vite integration      | `vite.config.ts`                                                |

## Caveats

- **Route handler chaining**: Hono's `hc` type inference requires routes to be
  chained in a single expression (`.get().get().use()`) rather than separate
  `app.get()` calls. Separate calls cause the return type to become `unknown`.

- **`disableSSG()` placement**: The `disableSSG()` middleware must be in the
  route chain (e.g., `app.get('/dynamic', disableSSG(), handler)`) rather than
  applied globally via `app.use()`. Global `app.use()` is not respected by the
  SSG helper.

- **Build-time vs runtime app**: `src/app.ts` is the build-time app (routes
  only) used by `toSSG` and the Vite dev server; it has no static-file
  middleware, so `toSSG` always renders fresh HTML. `src/server.ts` mounts it
  behind a single static-first `serveStatic`, which also rewrites extensionless
  paths to `.html`. Adding an SSG page needs no middleware changes — just a
  route in `app.ts`.

- **`import.meta.env` and the SSG build**: `import.meta.env` exists only inside
  Vite's context. The SSG step runs via `tsx build.ts` over the `tsc`-compiled
  output, where `import.meta.env` is `undefined`. `src/static-resources.ts`
  relies on this to detect production: `const isProd = !import.meta.env`. If
  you change that logic, keep dev/prod asset URLs in sync.

- **Hashed asset filenames**: `build:client` emits `client-<hash>.js` and
  `{name}-<hash>.css` and writes `dist/static/.vite/manifest.json`. Because the
  server is compiled before the client build, `src/static-resources.ts` reads
  that manifest at runtime (`import.meta.dirname`) to resolve the hashed URLs,
  and throws if an entry is missing. So `build:client` must run before the
  server starts or `build:ssg` runs, and `.vite/manifest.json` ships with the
  static output (the runtime serves it too — block it at the edge if
  undesired).

- **Clean build**: `tsc` and `toSSG` do not empty their output directories.
  Because the runtime serves any file under `dist/static/` before routes, a stale
  file can shadow a route (e.g. an old `index.html` for `/`). `pnpm build` runs
  `pnpm clean` first; run it (or `pnpm clean`) after structural changes.
