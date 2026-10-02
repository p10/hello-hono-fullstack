import { stylesheetHref } from '../static-resources.js';

export function dynamicPage(timestamp: string) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Dynamic Server Page</title>
        <link rel="stylesheet" href={stylesheetHref('dynamic')} />
      </head>
      <body>
        <span class="badge">Dynamic</span>
        <h1>Dynamic Server Page</h1>
        <p>This page is rendered by the server on every request.</p>
        <p>Refreshing the page produces a different timestamp.</p>
        <div class="timestamp">Generated at: {timestamp}</div>
        <p style={{ marginTop: '2rem' }}>
          <a href="/">← Back to home</a>
        </p>
      </body>
    </html>
  );
}
