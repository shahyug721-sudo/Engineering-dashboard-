import { useState } from 'react'
import { useStore } from '../store.jsx'
import { STAGES, deriveStatus, fmtDate, fmtDateTime, STATUS_COLORS } from '../utils.js'

function Pipeline({ p }) {
  return (
    <div className="pipeline">
      {STAGES.map((s, i) => {
        const st = p.stages[s.key]
        return (
          <div className="pipe-step" key={s.key}>
            <div className="pipe-node-row">
              {i > 0 && <div className={'pipe-line ' + (st !== 'not_started' ? 'on' : '')} />}
              <div className={'pipe-node ' + st}>
                {st === 'completed' ? '✓' : st === 'in_progress' ? '◐' : st === 'blocked' ? '✕' : ''}
              </div>
              {i < STAGES.length - 1 && (
                <div className={'pipe-line ' + (p.stages[STAGES[i + 1].key] !== 'not_started' ? 'on' : '')} />
              )}
            </div>
            <div className="pipe-label">{s.label}</div>
          </div>
        )
      })}
      <div className="pipe-step">
        <div className="pipe-node-row">
          <div className={'pipe-line ' + (p.live ? 'on' : '')} />
          <div className={'pipe-node ' + (p.live ? 'live' : 'not_started')}>🚀</div>
        </div>
        <div className="pipe-label">Live</div>
      </div>
    </div>
  )
}

export default function ProjectDetails({ project, onEdit }) {
  const store = useStore()
  const [newTask, setNewTask] = useState('')
  const [editingUpdate, setEditingUpdate] = useState(false)
  const [updateDraft, setUpdateDraft] = useState('')

  if (!project)
    return (
      <div className="panel details">
        <h2>Project Details</h2>
        <p className="muted">Select a project in the table above to see its details.</p>
      </div>
    )

  const p = project
  const status = deriveStatus(p)

  const saveUpdate = () => {
    store.updateProject(p.id, { currentUpdate: updateDraft }, `Updated "${p.name}" – current update edited`)
    setEditingUpdate(false)
  }

  const postTask = () => {
    if (newTask.trim()) {
      store.addTask(p.id, newTask)
      setNewTask('')
    }
  }

  return (
    <div className="panel details">
      <div className="details-head">
        <h2>Project Details</h2>
        <button className="btn ghost" onClick={() => onEdit(p)}>✏️ Edit Project</button>
      </div>

      <div className="details-title">
        <h3>{p.name}</h3>
        <span className="badge" style={{ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status] }}>
          {status}
        </span>
      </div>

      <Pipeline p={p} />

      <div className="details-grid">
        <div className="details-meta">
          <div><span>Owner</span><b>{p.owner}</b></div>
          <div><span>Product</span><b>{p.product}</b></div>
          <div><span>Sub Project</span><b>{p.subProject || '—'}</b></div>
          <div><span>Target Release</span><b>{fmtDate(p.targetRelease)}</b></div>
          <div><span>Last Updated</span><b>{fmtDateTime(p.lastUpdated)}</b></div>
          <div><span>Updated By</span><b>{p.updatedBy}</b></div>
        </div>

        <div className="details-update">
          <div className="section-head">
            <h4>Current Update</h4>
            {!editingUpdate && (
              <button className="mini-btn" onClick={() => { setUpdateDraft(p.currentUpdate || ''); setEditingUpdate(true) }}>
                ✏️ Edit
              </button>
            )}
          </div>
          {editingUpdate ? (
            <div>
              <textarea rows={6} value={updateDraft} onChange={(e) => setUpdateDraft(e.target.value)} />
              <div className="row-gap">
                <button className="btn primary" onClick={saveUpdate}>Save</button>
                <button className="btn ghost" onClick={() => setEditingUpdate(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="update-text">
              {(p.currentUpdate || 'No update yet.').split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>

        <div className="details-tasks">
          <h4>Next Steps / Tasks</h4>
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
            {p.nextSteps.length === 0 && <li className="muted">No tasks yet — post one below.</li>}
          </ul>
          <div className="task-add">
            <input
              placeholder="Post a new task…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postTask()}
            />
            <button className="btn primary" onClick={postTask}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
