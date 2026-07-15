import { useState } from 'react'
import { useStore } from '../store.jsx'
import { fmtDateTime } from '../utils.js'

// Audit trail (PRD acceptance criterion 4: user + timestamp on every change)
export function NotificationsView() {
  const store = useStore()
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Notifications — Activity &amp; Audit Trail</h2>
      </div>
      <ul className="activity">
        {store.activity.map((a, i) => (
          <li key={i}>
            <span className="act-dot" />
            <div>
              <div className="act-text">{a.text}</div>
              <div className="muted">
                {a.user} · {fmtDateTime(a.ts)}
              </div>
            </div>
          </li>
        ))}
        {store.activity.length === 0 && <li className="muted">No activity yet.</li>}
      </ul>
    </div>
  )
}

export function UsersView() {
  const store = useStore()
  const [name, setName] = useState('')
  const add = () => {
    store.addOwner(name)
    setName('')
  }
  return (
    <div className="panel narrow">
      <div className="panel-head">
        <h2>Users — Engineering Owners</h2>
      </div>
      <ul className="user-list">
        {store.owners.map((o) => (
          <li key={o}>
            <span className="avatar">{o[0]}</span>
            <span className="user-name">{o}</span>
            <span className="muted">
              {store.projects.filter((p) => p.owner === o).length} project(s)
            </span>
            <button className="task-x" title="Remove owner" onClick={() => store.removeOwner(o)}>×</button>
          </li>
        ))}
      </ul>
      <div className="task-add">
        <input
          placeholder="Add new owner…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn primary" onClick={add}>+ Add Owner</button>
      </div>
    </div>
  )
}

export function SettingsView() {
  const store = useStore()
  const [product, setProduct] = useState('')
  return (
    <div className="panel narrow">
      <div className="panel-head">
        <h2>Settings</h2>
      </div>
      <div className="settings-grid">
        <label>
          Your name (used for "Updated By" and the audit trail)
          <input value={store.currentUser} onChange={(e) => store.setCurrentUser(e.target.value)} />
        </label>
        <label>
          Daily report recipients (Email / Slack / Teams group)
          <input value={store.reportRecipients} onChange={(e) => store.setReportRecipients(e.target.value)} />
        </label>
        <label>
          Daily report schedule
          <input value="Every day at 03:30 PM" disabled />
        </label>
        <label>
          Add a product
          <div className="task-add">
            <input
              placeholder="e.g. GA Green"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <button
              className="btn primary"
              onClick={() => {
                store.addProduct(product)
                setProduct('')
              }}
            >
              + Add
            </button>
          </div>
        </label>
        <div className="muted">Products: {store.products.join(', ')}</div>
        <hr />
        <button
          className="btn danger"
          onClick={() =>
            confirm('Clear ALL projects, owners, products and activity? This cannot be undone.') &&
            store.resetData()
          }
        >
          🗑️ Clear all data (fresh start)
        </button>
      </div>
    </div>
  )
}
