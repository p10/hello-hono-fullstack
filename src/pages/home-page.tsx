import { jsHref, stylesheetHref } from '../static-resources.js';

export function home() {
  const clientSrc = jsHref();

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hono Full-Stack Demo</title>
        <link rel="stylesheet" href={stylesheetHref('home')} />
      </head>
      <body>
        <h1>Hono Full-Stack Demo</h1>
        <p class="subtitle">
          This page was rendered by Hono JSX on the server.
        </p>

        <nav>
          <a href="/">Home (this page)</a>
          <a href="/static-page">Static SSG page</a>
          <a href="/dynamic">Dynamic server page</a>
        </nav>

        <div class="demo" id="client-demo">
          <h2>Client Component + RPC Demo</h2>
          <p>
            The interactive section below is rendered by{' '}
            <code>hono/jsx/dom</code> on the client. It calls{' '}
            <code>/api/hello</code> using Hono RPC.
          </p>
          <div id="client-root">Loading client component...</div>
        </div>

        <script type="module" src={clientSrc}></script>
      </body>
    </html>
  );
}
