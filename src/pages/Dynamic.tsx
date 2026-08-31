export function dynamicPage(timestamp: string) {
  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>Dynamic Server Page</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
          .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
          .timestamp { font-family: monospace; background: #f9fafb; padding: 0.75rem; border-radius: 6px; border: 1px solid #e5e7eb; }
          a { color: #2563eb; }
        `}</style>
      </head>
      <body>
        <span class='badge'>Dynamic</span>
        <h1>Dynamic Server Page</h1>
        <p>This page is rendered by the server on every request.</p>
        <p>Refreshing the page produces a different timestamp.</p>
        <div class='timestamp'>Generated at: {timestamp}</div>
        <p style={{ marginTop: '2rem' }}>
          <a href='/'>← Back to home</a>
        </p>
      </body>
    </html>
  )
}
