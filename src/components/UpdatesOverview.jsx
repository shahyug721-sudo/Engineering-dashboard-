import { deriveStatus, STATUS_COLORS } from '../utils.js'

// Read-only "Project | Current Update | Next Steps" table for the dashboard,
// shown below the Projects Progress Overview. Click a row to open that project
// in the details panel. Edit the text on the Project Updates page.
export default function UpdatesOverview({ projects, selectedId, onSelect }) {
  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <h2>Current Updates &amp; Next Steps</h2>
        <span className="chart-total">{projects.length} projects</span>
      </div>
      <div className="table-wrap uo-scroll">
        <table className="uo-table">
          <thead>
            <tr>
              <th className="uo-name">Project</th>
              <th>Current Update</th>
              <th>Next Steps</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const color = STATUS_COLORS[deriveStatus(p)] || '#94a3b8'
              return (
                <tr
                  key={p.id}
                  className={selectedId === p.id ? 'selected' : ''}
                  onClick={() => onSelect && onSelect(p.id)}
                >
                  <td className="uo-name">
                    <span className="uo-dot" style={{ background: color }} />
                    {p.name}
                  </td>
                  <td className="uo-text">
                    {p.currentUpdate
                      ? p.currentUpdate.split('\n').map((l, i) => <p key={i}>{l}</p>)
                      : <span className="muted">—</span>}
                  </td>
                  <td className="uo-text">
                    {p.nextSteps.length ? (
                      <ul className="uo-steps">
                        {p.nextSteps.map((t) => (
                          <li key={t.id} className={t.done ? 'done' : ''}>{t.text}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={3} className="empty">No projects yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
