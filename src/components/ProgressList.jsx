import { progress, deriveStatus, STATUS_COLORS } from '../utils.js'

// Compact "project vs. progress" bar graph for the space beside the charts.
export default function ProgressList({ projects, selectedId, onSelect }) {
  const rows = [...projects].sort((a, b) => progress(b) - progress(a))

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Project Progress</h2>
        <span className="chart-total">{projects.length} projects</span>
      </div>
      <div className="prog-list">
        {rows.map((p) => {
          const pct = progress(p)
          const color = STATUS_COLORS[deriveStatus(p)] || '#94a3b8'
          return (
            <button
              key={p.id}
              className={'prog-list-row' + (selectedId === p.id ? ' active' : '')}
              onClick={() => onSelect && onSelect(p.id)}
              title={`${p.name} — ${deriveStatus(p)}`}
            >
              <span className="plr-name">{p.name}</span>
              <span className="plr-bar">
                <span className="plr-fill" style={{ width: pct + '%', background: color }} />
              </span>
              <span className="plr-pct">{pct}%</span>
            </button>
          )
        })}
        {rows.length === 0 && <p className="muted">No projects yet.</p>}
      </div>
    </div>
  )
}
