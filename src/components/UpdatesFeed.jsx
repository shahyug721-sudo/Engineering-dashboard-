import { useState } from 'react'
import { useStore } from '../store.jsx'
import { fmtDateTime } from '../utils.js'

const ymd = (iso) => (iso ? iso.slice(0, 10) : '')

// Dashboard feed of every project's current update + next steps, with a
// calendar filter to search updates made on a specific date.
export default function UpdatesFeed({ selectedId, onSelect }) {
  const store = useStore()
  const [date, setDate] = useState('')

  const rows = store.projects.filter((p) => {
    if (!date) return true
    if (ymd(p.currentUpdateAt) === date) return true
    return p.nextSteps.some((t) => ymd(t.at) === date)
  })

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Project Updates &amp; Next Steps</h2>
        <div className="feed-filter">
          <label>
            🗓️ Updates on
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          {date && <button className="mini-btn" onClick={() => setDate('')}>Show all</button>}
        </div>
      </div>

      <div className="feed-scroll">
        <table className="feed-table">
          <thead>
            <tr>
              <th className="feed-project">Project</th>
              <th>Current Update</th>
              <th>Next Steps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className={selectedId === p.id ? 'selected' : ''}
                onClick={() => onSelect && onSelect(p.id)}
              >
                <td className="feed-project">
                  <div className="pname">{p.name}</div>
                  <div className="feed-owner">{p.owner}</div>
                </td>
                <td>
                  {p.currentUpdate ? (
                    <>
                      {p.currentUpdateAt && <div className="upd-stamp">🕒 {fmtDateTime(p.currentUpdateAt)}</div>}
                      <div className="feed-text">
                        {p.currentUpdate.split('\n').map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td>
                  {p.nextSteps.length ? (
                    <ul className="feed-tasks">
                      {p.nextSteps.map((t) => (
                        <li key={t.id} className={t.done ? 'done' : ''}>
                          <span>{t.text}</span>
                          {t.at && <span className="task-stamp">🕒 {fmtDateTime(t.at)}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">No updates on the selected date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
