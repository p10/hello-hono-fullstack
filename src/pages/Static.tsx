import { stylesheetHref } from '../static-resources.js'

export function staticPage() {
  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Static SSG Page</title>
        <link rel='stylesheet' href={stylesheetHref('static')} />
      </head>
      <body>
        <span class='badge'>SSG</span>
        <h1>Static SSG Page</h1>
        <p>This page was generated at build time.</p>
        <p>
          It was written to <code>dist/static.html</code> (or{' '}
          <code>dist/static/index.html</code>) during the production build.
          The server does not render this page on each request.
        </p>
        <p>
          Inspect the generated file to verify it contains real HTML, not an
          empty client-side mount point.
        </p>
        <p>
          <a href='/'>← Back to home</a>
        </p>
      </body>
    </html>
  )
}
