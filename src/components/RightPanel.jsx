import { deriveStatus, fmtDate, STATUS_COLORS } from '../utils.js'

function UpcomingReleases({ projects }) {
  const upcoming = projects
    .filter((p) => !p.live && p.targetRelease)
    .sort((a, b) => a.targetRelease.localeCompare(b.targetRelease))
    .slice(0, 6)

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Upcoming Releases</h2>
      </div>
      <ul className="releases">
        {upcoming.map((p) => {
          const s = deriveStatus(p)
          return (
            <li key={p.id}>
              <span className="rel-name">{p.name}</span>
              <span className="rel-date">{fmtDate(p.targetRelease)}</span>
              <span className="badge" style={{ background: STATUS_COLORS[s] + '22', color: STATUS_COLORS[s] }}>
                {s.replace('In QA / Testing', 'Testing').replace('In ', '')}
              </span>
            </li>
          )
        })}
        {upcoming.length === 0 && <li className="muted">No scheduled releases.</li>}
      </ul>
    </div>
  )
}

function Donut({ projects }) {
  const order = ['Live', 'In Development', 'Planning', 'In QA / Testing', 'In UAT', 'Blocked', 'Not Started']
  const counts = {}
  for (const p of projects) {
    let s = deriveStatus(p)
    if (s === 'Planning') s = 'In Development'
    counts[s] = (counts[s] || 0) + 1
  }
  const entries = order.filter((k) => counts[k]).map((k) => [k, counts[k]])
  const total = projects.length || 1
  const R = 42
  const CIRC = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Projects by Status</h2>
      </div>
      <div className="donut-wrap">
        <svg viewBox="0 0 120 120" className="donut">
          {entries.map(([k, n]) => {
            const frac = n / total
            const el = (
              <circle
                key={k}
                cx="60" cy="60" r={R}
                fill="none"
                stroke={STATUS_COLORS[k]}
                strokeWidth="16"
                strokeDasharray={`${frac * CIRC} ${CIRC}`}
                strokeDashoffset={-offset * CIRC}
                transform="rotate(-90 60 60)"
              />
            )
            offset += frac
            return el
          })}
          <text x="60" y="57" textAnchor="middle" className="donut-num">{projects.length}</text>
          <text x="60" y="72" textAnchor="middle" className="donut-sub">Total</text>
        </svg>
        <ul className="donut-legend">
          {entries.map(([k, n]) => (
            <li key={k}>
              <span className="dot" style={{ background: STATUS_COLORS[k] }} />
              {k}
              <b>{n} ({Math.round((n / total) * 100)}%)</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function RightPanel({ projects }) {
  return (
    <div className="right-col">
      <UpcomingReleases projects={projects} />
      <Donut projects={projects} />
    </div>
  )
}
