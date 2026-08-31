type PageName = 'home' | 'static' | 'dynamic'

// During development Vite serves modules from source (with HMR); in
// production the client build emits bundled assets under /styles and /client.js.
// import.meta.env is undefined in the SSG/server build, so treat that as production.
const isProd = !import.meta.env

export function stylesheetHref(name: PageName) {
  return isProd ? `/styles/${name}.css` : `/src/styles/${name}.css`
}

export function jsHref() {
  return isProd ? '/client.js' : '/src/client/index.tsx'
}