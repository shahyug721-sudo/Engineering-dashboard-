import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { fmtDateTime } from '../utils.js'

// Dedicated page to edit the two narrative fields for every project.
// The Current Update auto-saves as you type; next steps insert/remove
// instantly. Every change is stamped with the date and time.
function UpdateRow({ p }) {
  const store = useStore()
  const [draft, setDraft] = useState(p.currentUpdate || '')
  const [newTask, setNewTask] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const skipFirst = useRef(true)

  // Debounced auto-save: fire ~0.7s after typing stops, only if changed.
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    if (draft === (p.currentUpdate || '')) return
    const t = setTimeout(() => {
      store.updateProject(p.id, { currentUpdate: draft }, `Updated "${p.name}" – current update edited`)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1400)
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

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
      </td>

      <td className="upd-cell">
        <div className="upd-stamp">
          {p.currentUpdate && p.currentUpdateAt ? '🕒 ' + fmtDateTime(p.currentUpdateAt) : 'Not updated yet'}
          {savedFlash && <span className="saved-flash"> · ✓ Saved</span>}
        </div>
        <textarea
          rows={3}
          placeholder="Write the current progress… (auto-saves)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </td>

      <td className="upd-cell">
        <ul className="tasks">
          {p.nextSteps.map((t) => (
            <li key={t.id} className={'upd-task' + (t.done ? ' done' : '')}>
              <div className="upd-task-row">
                <label>
                  <input type="checkbox" checked={t.done} onChange={() => store.toggleTask(p.id, t.id)} />
                  <span>{t.text}</span>
                </label>
                <button className="task-x" title="Remove task" onClick={() => store.removeTask(p.id, t.id)}>×</button>
              </div>
              {t.at && <div className="task-stamp">🕒 {fmtDateTime(t.at)}</div>}
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
        Edit each project's Current Update and Next Steps here — changes auto-save instantly and are stamped with the
        date and time.
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
