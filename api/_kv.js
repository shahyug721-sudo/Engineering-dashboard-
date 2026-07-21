// Tiny Upstash Redis (Vercel KV) client over the REST API. Holds the entire
// dashboard state as one JSON document under a single key. The token stays
// server-side — the browser never sees it (it talks to /api/state instead).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const STATE_KEY = 'engineering-dashboard-state'

export const kvConfigured = () => Boolean(URL_ && TOKEN)

async function cmd(args) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error('KV request failed: ' + r.status)
  return r.json() // { result: <value> }
}

export async function getState() {
  if (!kvConfigured()) return null
  const { result } = await cmd(['GET', STATE_KEY])
  return result ? JSON.parse(result) : null
}

export async function setState(state) {
  if (!kvConfigured()) throw new Error('KV not configured')
  await cmd(['SET', STATE_KEY, JSON.stringify(state)])
}
