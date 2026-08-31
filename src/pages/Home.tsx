export function home() {
  const isProd = !import.meta.env
  const clientSrc = isProd ? '/client.js' : '/src/client/index.tsx'

  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Hono Full-Stack Demo</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
          h1 { margin-bottom: 0.5rem; }
          .subtitle { color: #666; margin-bottom: 2rem; }
          nav { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; }
          nav a { color: #2563eb; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 6px; }
          nav a:hover { background: #f5f5f5; }
          .demo { border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
          .demo h2 { margin-top: 0; font-size: 1.1rem; }
          button { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
          button:hover { background: #1d4ed8; }
          .result { margin-top: 1rem; padding: 0.75rem; background: #f9fafb; border-radius: 4px; font-family: monospace; font-size: 0.9rem; }
          code { background: #f3f4f6; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9rem; }
        `}</style>
      </head>
      <body>
        <h1>Hono Full-Stack Demo</h1>
        <p class='subtitle'>
          This page was rendered by Hono JSX on the server.
        </p>

        <nav>
          <a href='/'>Home (this page)</a>
          <a href='/static'>Static SSG page</a>
          <a href='/dynamic'>Dynamic server page</a>
        </nav>

        <div class='demo' id='client-demo'>
          <h2>Client Component + RPC Demo</h2>
          <p>
            The interactive section below is rendered by{' '}
            <code>hono/jsx/dom</code> on the client. It calls{' '}
            <code>/api/hello</code> using Hono RPC.
          </p>
          <div id='client-root'>Loading client component...</div>
        </div>

        <script type='module' src={clientSrc}></script>
      </body>
    </html>
  )
}
