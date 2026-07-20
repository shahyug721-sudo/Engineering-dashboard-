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

// Stacked column chart: one column per release month, segments coloured by status.
const STATUS_ORDER = ['Live', 'In Development', 'In QA / Testing', 'In UAT', 'Not Started', 'Blocked']
const norm = (s) => (s === 'Planning' ? 'In Development' : s)

function StatusColumnChart({ projects }) {
  const total = projects.length

  // Group by release month (YYYY-MM); undated projects go into a "TBD" bucket.
  const groups = {}
  for (const p of projects) {
    const key = p.targetRelease ? p.targetRelease.slice(0, 7) : 'TBD'
    if (!groups[key]) groups[key] = { key, counts: {}, total: 0 }
    const s = norm(deriveStatus(p))
    groups[key].counts[s] = (groups[key].counts[s] || 0) + 1
    groups[key].total += 1
  }
  const months = Object.values(groups).sort((a, b) => {
    if (a.key === 'TBD') return 1
    if (b.key === 'TBD') return -1
    return a.key.localeCompare(b.key)
  })

  const statusTotals = {}
  for (const p of projects) {
    const s = norm(deriveStatus(p))
    statusTotals[s] = (statusTotals[s] || 0) + 1
  }
  const legend = STATUS_ORDER.filter((k) => statusTotals[k])

  // Chart geometry (SVG viewBox units).
  const W = 340, H = 210
  const mL = 20, mR = 8, mT = 12, mB = 40
  const plotW = W - mL - mR
  const plotH = H - mT - mB
  const maxRaw = Math.max(1, ...months.map((m) => m.total))
  const maxVal = Math.ceil(maxRaw / 3) * 3 || 3
  const ticks = [0, maxVal / 3, (maxVal / 3) * 2, maxVal]
  const slot = plotW / (months.length || 1)
  const barW = Math.min(46, slot * 0.6)
  const yOf = (v) => mT + plotH - (plotH * v) / maxVal

  const monthLabel = (key) => {
    if (key === 'TBD') return 'TBD'
    const d = new Date(key + '-01T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short' }) + " '" + key.slice(2, 4)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Projects by Status</h2>
        <span className="chart-total">{total} total</span>
      </div>

      <div className="chart-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="col-chart" style={{ minWidth: months.length * 46 }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={mL} y1={yOf(t)} x2={W - mR} y2={yOf(t)} className="grid" />
              <text x={mL - 4} y={yOf(t) + 3} textAnchor="end" className="axis">{t}</text>
            </g>
          ))}
          {months.map((m, i) => {
            const x = mL + slot * i + (slot - barW) / 2
            let cursor = 0
            return (
              <g key={m.key}>
                {STATUS_ORDER.filter((s) => m.counts[s]).map((s) => {
                  const h = (plotH * m.counts[s]) / maxVal
                  const y = mT + plotH - cursor - h
                  cursor += h
                  return <rect key={s} x={x} y={y} width={barW} height={h} fill={STATUS_COLORS[s]} rx="1.5" />
                })}
                <text x={x + barW / 2} y={yOf(m.total) - 4} textAnchor="middle" className="bar-num">{m.total}</text>
                <text x={x + barW / 2} y={H - mB + 15} textAnchor="middle" className="axis">{monthLabel(m.key)}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <ul className="chart-legend">
        {legend.map((k) => (
          <li key={k}>
            <span className="dot" style={{ background: STATUS_COLORS[k] }} />
            {k}
            <b>{statusTotals[k]} ({Math.round((statusTotals[k] / (total || 1)) * 100)}%)</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RightPanel({ projects }) {
  return (
    <div className="right-col">
      <UpcomingReleases projects={projects} />
      <StatusColumnChart projects={projects} />
    </div>
  )
}
