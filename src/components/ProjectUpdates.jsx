import { useState } from 'react'
import { useStore } from '../store.jsx'
import { fmtDateTime } from '../utils.js'

// Dedicated page to edit just the two narrative fields for every project:
// Current Update and Next Steps. Each row can edit/save/remove the update
// and insert/remove individual next-step tasks.
function UpdateRow({ p }) {
  const store = useStore()
  const [draft, setDraft] = useState(p.currentUpdate || '')
  const [saved, setSaved] = useState(false)
  const [newTask, setNewTask] = useState('')

  // Keep the draft in sync if the underlying project changes elsewhere.
  const dirty = draft !== (p.currentUpdate || '')

  const saveUpdate = () => {
    store.updateProject(p.id, { currentUpdate: draft }, `Updated "${p.name}" – current update edited`)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const removeUpdate = () => {
    setDraft('')
    store.updateProject(p.id, { currentUpdate: '' }, `Cleared current update on "${p.name}"`)
  }

  const addTask = () => {
    if (newTask.trim()) {
      store.addTask(p.id, newTask)
      setNewTask('')
    }
  }

  return (
    <tr>
      <td className="upd-project">
        <div className="pname">{p.name}</div>
        {p.subProject && <div className="psub">{p.subProject}</div>}
        <div className="upd-meta">Last updated {fmtDateTime(p.lastUpdated)} · {p.updatedBy}</div>
      </td>

      <td className="upd-cell">
        <textarea
          rows={4}
          placeholder="Write the current progress…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="upd-actions">
          <button className="btn primary" onClick={saveUpdate} disabled={!dirty}>
            {saved ? '✓ Saved' : '💾 Save'}
          </button>
          <button className="btn ghost" onClick={removeUpdate} disabled={!(p.currentUpdate || draft)}>
            🗑️ Remove
          </button>
        </div>
      </td>

      <td className="upd-cell">
        <ul className="tasks">
          {p.nextSteps.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => store.toggleTask(p.id, t.id)} />
                <span>{t.text}</span>
              </label>
              <button className="task-x" title="Remove task" onClick={() => store.removeTask(p.id, t.id)}>×</button>
            </li>
          ))}
          {p.nextSteps.length === 0 && <li className="muted">No next steps yet.</li>}
        </ul>
        <div className="task-add">
          <input
            placeholder="Insert a next step…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button className="btn primary" onClick={addTask}>+ Add</button>
        </div>
      </td>
    </tr>
  )
}

export default function ProjectUpdates() {
  const store = useStore()
  const [search, setSearch] = useState('')

  const rows = store.projects.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <h2>Project Updates</h2>
        <input
          className="search"
          placeholder="🔍 Search project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p className="muted upd-intro">
        Edit each project's Current Update and Next Steps here. Changes save to the dashboard instantly and are stamped
        with your name and time.
      </p>
      <div className="table-wrap">
        <table className="updates-table">
          <thead>
            <tr>
              <th className="upd-project">Project</th>
              <th>Current Update</th>
              <th>Next Steps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <UpdateRow key={p.id} p={p} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">No projects match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
