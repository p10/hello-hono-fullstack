import { useState } from 'hono/jsx'
import { render } from 'hono/jsx/dom'
import { hc } from 'hono/client'
import type { AppType } from '../app.js'

// Hono RPC client — types are inferred from the server's AppType
const client = hc<AppType>(location.origin)

// --- Counter Component ---

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

// --- API Caller Component ---

function ApiCaller() {
  const [message, setMessage] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [loading, setLoading] = useState(false)

  const callApi = async () => {
    setLoading(true)
    // Uses Hono RPC — types are inferred from AppType
    const res = await client.api.hello.$get()
    const data = await res.json()
    setMessage(data.message)
    setTimestamp(data.timestamp)
    setLoading(false)
  }

  return (
    <div>
      <p>
        <strong>Server response</strong>
      </p>
      <button onClick={callApi} disabled={loading}>
        {loading ? 'Calling...' : 'Call API'}
      </button>
      {message && (
        <div class='result'>
          <div>Message: {message}</div>
          <div>Server timestamp: {timestamp}</div>
        </div>
      )}
    </div>
  )
}

// --- App ---

function App() {
  return (
    <div>
      <Counter />
      <hr style={{ margin: '1rem 0' }} />
      <ApiCaller />
    </div>
  )
}

// Mount to the placeholder in the server-rendered HTML
const root = document.getElementById('client-root')
if (root) {
  render(<App />, root)
}
