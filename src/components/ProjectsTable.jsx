import { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import { STAGES, STATUS_OPTIONS, deriveStatus, fmtDate, progress, releaseMonth } from '../utils.js'
import { StatusIcon, RocketIcon } from './StatusIcon.jsx'

const STATUS_FILTERS = ['Live', 'In Development', 'In QA / Testing', 'In UAT', 'Blocked', 'Planning']

export default function ProjectsTable({ selectedId, onSelect, onEdit, showActions }) {
  const store = useStore()
  const [fOwner, setFOwner] = useState('')
  const [fProduct, setFProduct] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fMonth, setFMonth] = useState('')
  const [search, setSearch] = useState('')
  const [openCell, setOpenCell] = useState(null) // { id, stage } | { id, stage:'live' }

  const months = useMemo(() => {
    const set = new Set(store.projects.map(releaseMonth).filter(Boolean))
    return [...set].sort()
  }, [store.projects])

  const filtered = store.projects.filter((p) => {
    if (fOwner && p.owner !== fOwner) return false
    if (fProduct && p.product !== fProduct) return false
    if (fStatus && deriveStatus(p) !== fStatus) return false
    if (fMonth && releaseMonth(p) !== fMonth) return false
    if (search && !(p.name + ' ' + (p.subProject || '')).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) =>
    (a.targetRelease || '9999-99-99').localeCompare(b.targetRelease || '9999-99-99')
  )

  const setStage = (id, stage, status) => {
    store.setStage(id, stage, status)
    setOpenCell(null)
  }

  return (
    <div className="panel table-panel">
      <div className="panel-head">
        <h2>Projects Progress Overview</h2>
        <div className="filters">
          <select value={fOwner} onChange={(e) => setFOwner(e.target.value)}>
            <option value="">All Owners</option>
            {store.owners.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select value={fProduct} onChange={(e) => setFProduct(e.target.value)}>
            <option value="">All Products</option>
            {store.products.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_FILTERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select value={fMonth} onChange={(e) => setFMonth(e.target.value)}>
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(m + '-01T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <input
            className="search"
            placeholder="🔍 Search project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap" onClick={() => openCell && setOpenCell(null)}>
        <table>
          <thead>
            <tr>
              <th className="col-name">Project</th>
              <th>Owner</th>
              {STAGES.map((s) => (
                <th key={s.key} className="col-stage">
                  {s.label}
                </th>
              ))}
              <th className="col-stage">Live</th>
              <th>Target Release</th>
              <th className="col-progress">Overall Progress</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const pct = progress(p)
              return (
                <tr
                  key={p.id}
                  className={selectedId === p.id ? 'selected' : ''}
                  onClick={() => onSelect && onSelect(p.id)}
                >
                  <td className="col-name">
                    <div className="pname">{p.name}</div>
                    {p.subProject && <div className="psub">{p.subProject}</div>}
                  </td>
                  <td>{p.owner}</td>
                  {STAGES.map((s) => (
                    <td key={s.key} className="col-stage stage-cell">
                      <button
                        className="stage-btn"
                        title={`${s.label}: click to change status`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenCell(
                            openCell && openCell.id === p.id && openCell.stage === s.key
                              ? null
                              : { id: p.id, stage: s.key }
                          )
                        }}
                      >
                        <StatusIcon status={p.stages[s.key]} />
                      </button>
                      {openCell && openCell.id === p.id && openCell.stage === s.key && (
                        <div className="stage-menu" onClick={(e) => e.stopPropagation()}>
                          <div className="stage-menu-title">{s.label}</div>
                          {STATUS_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              className={p.stages[s.key] === o.value ? 'on' : ''}
                              onClick={() => setStage(p.id, s.key, o.value)}
                            >
                              <StatusIcon status={o.value} size={16} /> {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="col-stage">
                    <button
                      className="stage-btn"
                      title="Toggle Live"
                      onClick={(e) => {
                        e.stopPropagation()
                        store.toggleLive(p.id)
                      }}
                    >
                      <RocketIcon active={p.live} />
                    </button>
                  </td>
                  <td className="nowrap">{fmtDate(p.targetRelease)}</td>
                  <td className="col-progress">
                    <div className="prog-row">
                      <span className="prog-num">{pct}%</span>
                      <div className="prog-bar">
                        <div
                          className={'prog-fill ' + (pct === 100 ? 'g' : pct >= 50 ? 'y' : 'o')}
                          style={{ width: pct + '%' }}
                        />
                      </div>
                    </div>
                  </td>
                  {showActions && (
                    <td className="nowrap">
                      <button className="mini-btn" onClick={(e) => { e.stopPropagation(); onEdit(p) }}>
                        ✏️ Edit
                      </button>
                      <button
                        className="mini-btn danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete project "${p.name}"?`)) store.deleteProject(p.id)
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={12 + (showActions ? 1 : 0)} className="empty">
                  No projects match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-foot">
        <div className="legend">
          <span><StatusIcon status="completed" size={15} /> Complete</span>
          <span><StatusIcon status="in_progress" size={15} /> In Progress</span>
          <span><StatusIcon status="not_started" size={15} /> Not Started</span>
          <span><StatusIcon status="blocked" size={15} /> Blocked</span>
          <span><RocketIcon active size={15} /> Live</span>
        </div>
        <div className="showing">
          Showing 1 to {sorted.length} of {sorted.length} projects
        </div>
      </div>
    </div>
  )
}
