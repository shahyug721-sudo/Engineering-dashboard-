// Shared dashboard state API. The browser GETs the current state on load and
// POSTs the full state whenever it changes (debounced). Persists to Upstash KV.
import { getState, setState, kvConfigured } from './_kv.js'

export default async function handler(req, res) {
  if (!kvConfigured()) {
    // Not set up yet — the client falls back to localStorage.
    return res.status(200).json({ configured: false })
  }
  try {
    if (req.method === 'GET') {
      const state = await getState()
      return res.status(200).json(state || { empty: true })
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (!body || !Array.isArray(body.projects)) {
        return res.status(400).json({ error: 'Invalid state payload' })
      }
      await setState(body)
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
