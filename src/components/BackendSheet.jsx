import { useStore } from '../store.jsx'
import { STAGES, STATUS_OPTIONS, fmtDateTime } from '../utils.js'

// PRD §3 – Backend Management Screen: every field editable inline.
export default function BackendSheet({ onEdit, onAdd }) {
  const store = useStore()

  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <h2>Backend Sheet — Project Management</h2>
        <button className="btn primary" onClick={onAdd}>+ Add Project</button>
      </div>
      <div className="table-wrap">
        <table className="backend-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Sub Project</th>
              <th>Owner</th>
              <th>Product</th>
              {STAGES.map((s) => (
                <th key={s.key}>{s.label}</th>
              ))}
              <th>Live</th>
              <th>Tentative Release</th>
              <th>Last Updated</th>
              <th>Updated By</th>
              <th>More</th>
            </tr>
          </thead>
          <tbody>
            {store.projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    className="cell-input strong"
                    value={p.name}
                    onChange={(e) => store.updateProject(p.id, { name: e.target.value }, `Renamed project to "${e.target.value}"`)}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    value={p.subProject || ''}
                    placeholder="—"
                    onChange={(e) => store.updateProject(p.id, { subProject: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    list="bs-owners-list"
                    value={p.owner || ''}
                    placeholder="Owner"
                    onChange={(e) => store.updateProject(p.id, { owner: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cell-input"
                    list="bs-products-list"
                    value={p.product || ''}
                    placeholder="Product"
                    onChange={(e) => store.updateProject(p.id, { product: e.target.value })}
                  />
                </td>
                {STAGES.map((s) => (
                  <td key={s.key}>
                    <select
                      className={'status-select ' + p.stages[s.key]}
                      value={p.stages[s.key]}
                      onChange={(e) => store.setStage(p.id, s.key, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
                <td>
                  <select
                    className={'status-select ' + (p.live ? 'completed' : 'not_started')}
                    value={p.live ? 'yes' : 'no'}
                    onChange={() => store.toggleLive(p.id)}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={p.targetRelease || ''}
                    onChange={(e) => store.updateProject(p.id, { targetRelease: e.target.value })}
                  />
                </td>
                <td className="nowrap muted">{fmtDateTime(p.lastUpdated)}</td>
                <td className="nowrap">{p.updatedBy}</td>
                <td className="nowrap">
                  <button className="mini-btn" onClick={() => onEdit(p)}>✏️ Full Edit</button>
                  <button
                    className="mini-btn danger"
                    onClick={() => confirm(`Delete project "${p.name}"?`) && store.deleteProject(p.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {store.projects.length === 0 && (
              <tr>
                <td colSpan={STAGES.length + 8} className="empty">
                  No projects yet — click “+ Add Project” to create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <datalist id="bs-owners-list">
          {store.owners.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <datalist id="bs-products-list">
          {store.products.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      </div>
      <div className="table-foot">
        <span className="muted">
          Edits save instantly. "Full Edit" opens the complete form including Current Update and Next Steps.
        </span>
      </div>
    </div>
  )
}
