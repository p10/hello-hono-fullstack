# Hono Full-Stack Hello World

A minimal application demonstrating how Hono's features work together:

- **Hono JSX** for server-side rendering
- **Hono SSG** for static site generation
- **Dynamic server routes** for per-request rendering
- **Hono RPC** for type-safe client-server communication
- **`hono/jsx/dom`** for client-side interactivity
- **Vite** for development and bundling

No React, Next.js, Astro, or other frontend framework is used.

## Architecture

```
                    Browser
                       │
                       ▼
                 Hono JSX (SSR)
                  /       \
                 /         \
          static SSG      dynamic SSR
          /static          /dynamic
                              │
                         /api/hello
                              │
                         Hono RPC
                              │
                       hono/jsx/dom
                              │
                      client interaction
```

## Commands

```bash
pnpm install
pnpm dev          # Start Vite dev server
pnpm build        # Build client bundle + generate SSG output
```

## Route classification

- **Build time (SSG):** `/static`
- **Server request time:** `/dynamic`, `/api/hello`
- **Server-rendered + client JS:** `/` (home page)

## What to inspect

- **View page source** on `/` to see server-rendered HTML from Hono JSX.
- **Inspect `dist/static.html`** after build to verify the SSG output contains real static HTML.
- **Refresh `/dynamic`** and observe the changing timestamp — this page is rendered per-request.
- **Open DevTools** on `/` and observe the client JavaScript loaded from `hono/jsx/dom`.
- **Click the counter** — state updates without a page reload.
- **Click "Call API"** — the client calls `/api/hello` via Hono RPC and displays the response.
- **Inspect TypeScript source** to see the shared `AppType` between server and client.

## Project structure

```
src/
├── app.ts             Hono app definition (routes, API, SSG config)
├── index.tsx          Re-exports app for Vite entry point
├── pages/
│   ├── Home.tsx       Home page with nav + client demo mount point
│   ├── Static.tsx     SSG page (generated at build time)
│   └── Dynamic.tsx    Dynamic page (rendered per request)
└── client/
    └── index.tsx      Client-side code (counter + RPC caller)
build.ts               SSG build script
vite.config.ts         Vite config (dev server + client build + SSG)
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
| Vite integration | `vite.config.ts` |

## Verification

All routes were tested and confirmed working:

- `/` — server-rendered HTML with client JS mount point
- `/static` — generated as static HTML at build time (`static/static.html`)
- `/dynamic` — fresh timestamp on every request
- `/api/hello` — returns `{"message":"Hello from Hono","timestamp":"..."}`
- Client counter increments without page reload
- Client API button calls `/api/hello` via Hono RPC (no raw `fetch`)
- TypeScript compiles with zero errors
- No React, Next.js, Astro, or TanStack dependencies

## Caveats

- **Route handler chaining**: Hono's `hc` type inference requires routes to be
  chained in a single expression (`.get().get().use()`) rather than separate
  `app.get()` calls. Separate calls cause the return type to become `unknown`.

- **`disableSSG()` placement**: The `disableSSG()` middleware must be in the
  route chain (e.g., `app.get('/dynamic', disableSSG(), handler)`) rather than
  applied globally via `app.use()`. Global `app.use()` is not respected by the
  SSG helper.

- **`import.meta.env.PROD`**: Not available outside Vite's context (e.g.,
  during SSG build via `tsx`). Guard with
  `typeof import.meta !== 'undefined'`.
