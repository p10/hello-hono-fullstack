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
    Browser -->|GET /| SSR["Hono JSX (SSR) home page"]
    Browser -->|GET /static-page| STATIC["SSG page (build-time)"]
    Browser -->|GET /dynamic| DYNAMIC["Dynamic SSR page (per-request)"]
    Browser -->|GET /client.js| CLIENT["hono/jsx/dom client bundle"]
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
pnpm build        # compile server, build client bundle, generate SSG output
pnpm start        # run the production server from dist/ (after pnpm build)
```

### What `pnpm build` does

| Step | Script | Command | Output |
|---|---|---|---|
| Compile server + pages | `build:server` | `tsc` | `dist/*.js` |
| Bundle client + CSS | `build:client` | `vite build --mode client` | `dist/client.js`, `dist/styles/*.css` |
| Generate static pages | `build:ssg` | `tsx build.ts` | `dist/index.html`, `dist/static-page.html` |

## Route classification

- **Build time (SSG):** `/static-page`
- **Server request time:** `/dynamic`, `/api/hello` (both opt out of SSG via `disableSSG()`)
- **Server-rendered + client JavaScript:** `/` (home page)
- **Client-only interactive:** the `hono/jsx/dom` app mounted on `/`

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

Each page's styles live in a separate file under `src/styles/`, and the client
build (`vite build --mode client`) treats each one as a Rollup input, so Vite
minifies and bundles them into `dist/styles/`:

```text
src/styles/home.css    -> dist/styles/home.css
src/styles/static.css  -> dist/styles/static.css
src/styles/dynamic.css -> dist/styles/dynamic.css
```

The page components never write inline `<style>`. Instead they inject a
`<link rel="stylesheet">` whose URL is chosen by `src/static-resources.ts`:

- **Development:** `import.meta.env` is defined, so pages link the **source**
  stylesheets (`/src/styles/...`), which Vite serves with HMR and on-the-fly
  injection.
- **Production:** the SSG build runs under `tsx`, where `import.meta.env` is
  undefined, so `isProd` is `true` and pages link the **bundled** assets
  (`/styles/...`), served from `dist/` by `serveStatic`.

The same helper resolves the client bundle URL (`jsHref()`) between dev
(`/src/client/index.tsx`) and production (`/client.js`). Keeping the badge
colors per page (green on `/static-page`, amber on `/dynamic`) is only possible
because each page has its own stylesheet — Vite would merge them into one asset
otherwise.

## What to inspect

- **View page source** on `/` to see server-rendered HTML from Hono JSX.
- **Inspect `dist/static-page.html`** after build to verify the SSG output contains
  real static HTML.
- **Refresh `/dynamic`** and observe the changing timestamp — this page is
  rendered per-request.
- **Open DevTools** on `/` and observe the client JavaScript loaded from
  `hono/jsx/dom`.
- **Click the counter** — state updates without a page reload.
- **Click "Call API"** — the client calls `/api/hello` via Hono RPC (no raw
  `fetch`) and displays the response.
- **Check `dist/styles/`** to confirm Vite processed the per-page stylesheets.

## Project structure

```
src/
├── app.ts                Hono app: routes, RPC AppType, SSG exclusions
├── index.tsx             Re-exports app for Vite/SSG entry
├── server.ts             Standalone production server (@hono/node-server)
├── static-resources.ts   Dev/prod asset URL resolution (stylesheetHref, jsHref)
├── pages/
│   ├── Home.tsx          SSR home page + client mount point
│   ├── Static.tsx        SSG page (generated at build time)
│   └── Dynamic.tsx       Dynamic page (rendered per request)
├── styles/
│   ├── home.css          Home page styles (Vite-processed)
│   ├── static.css        Static page styles
│   └── dynamic.css       Dynamic page styles
└── client/
    └── index.tsx         Client bundle: counter + RPC caller
build.ts                  SSG build script (tsx build.ts)
vite.config.ts            Vite: dev server + client build + SSG plugin
```

## Key files

| Feature | File |
|---|---|
| Hono JSX SSR | `src/app.ts`, `src/pages/*.tsx` |
| Hono SSG | `src/pages/Static.tsx`, `build.ts` |
| Dynamic server route | `src/pages/Dynamic.tsx` |
| API route + RPC types | `src/app.ts` (exports `AppType`) |
| Hono RPC client | `src/client/index.tsx` |
| `hono/jsx/dom` | `src/client/index.tsx` |
| External stylesheets | `src/styles/*.css`, `src/static-resources.ts`, `vite.config.ts` |
| Vite integration | `vite.config.ts` |

## Caveats

- **Route handler chaining**: Hono's `hc` type inference requires routes to be
  chained in a single expression (`.get().get().use()`) rather than separate
  `app.get()` calls. Separate calls cause the return type to become `unknown`.

- **`disableSSG()` placement**: The `disableSSG()` middleware must be in the
  route chain (e.g., `app.get('/dynamic', disableSSG(), handler)`) rather than
  applied globally via `app.use()`. Global `app.use()` is not respected by the
  SSG helper.

- **`import.meta.env` and the SSG build**: `import.meta.env` exists only inside
  Vite's context. The SSG step runs via `tsx build.ts` over the `tsc`-compiled
  output, where `import.meta.env` is `undefined`. `src/static-resources.ts`
  relies on this to detect production: `const isProd = !import.meta.env`. If
  you change that logic, keep dev/prod asset URLs in sync.

- **Stale `dist/pages/style.js`**: removing an old page module does not clean
  up previously compiled files, because `tsc` does not empty the output
  directory. Run `pnpm build` after structural changes and ignore outdated
  `dist/` leftovers, or clear `dist/` manually.