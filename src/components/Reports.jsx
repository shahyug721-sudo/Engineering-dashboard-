import { useStore } from '../store.jsx'
import { STAGES, deriveStatus, fmtDate, progress, statusLabel } from '../utils.js'

// PRD §7 – Daily Automated Report (3:30 PM) preview, generated on demand.
export default function Reports() {
  const store = useStore()
  const today = new Date()
  const ps = store.projects

  const inDays = (iso, n) => {
    if (!iso) return false
    const d = new Date(iso + 'T00:00:00')
    const diff = (d - today) / 86400000
    return diff >= 0 && diff <= n
  }

  const delayed = ps.filter((p) => !p.live && p.targetRelease && new Date(p.targetRelease + 'T23:59:59') < today)
  const next7 = ps.filter((p) => !p.live && inDays(p.targetRelease, 7))
  const stale = ps.filter((p) => p.lastUpdated && (today - new Date(p.lastUpdated)) / 86400000 > 3)

  const metrics = [
    ['Total Projects', ps.length],
    ['Live', ps.filter((p) => p.live).length],
    ['In Development', ps.filter((p) => ['In Development', 'Planning'].includes(deriveStatus(p))).length],
    ['In QA / Testing', ps.filter((p) => deriveStatus(p) === 'In QA / Testing').length],
    ['In UAT', ps.filter((p) => deriveStatus(p) === 'In UAT').length],
    ['Blocked', ps.filter((p) => deriveStatus(p) === 'Blocked').length],
  ]

  const copyReport = () => {
    const lines = [
      `ENGINEERING DAILY REPORT — ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 3:30 PM`,
      '',
      'SUMMARY: ' + metrics.map(([k, v]) => `${k}: ${v}`).join(' | '),
      '',
      'PROJECT SNAPSHOT:',
      ...ps.map(
        (p) =>
          `• ${p.name} (${p.owner}) — ${deriveStatus(p)}, ${progress(p)}%, target ${fmtDate(p.targetRelease)} | ` +
          STAGES.map((s) => `${s.label}: ${statusLabel(p.stages[s.key])}`).join(', ')
      ),
      '',
      'DELAYED PROJECTS: ' + (delayed.map((p) => p.name).join(', ') || 'None'),
      'RELEASES IN NEXT 7 DAYS: ' + (next7.map((p) => `${p.name} (${fmtDate(p.targetRelease)})`).join(', ') || 'None'),
      'NOT UPDATED IN LAST 3 DAYS: ' + (stale.map((p) => p.name).join(', ') || 'None'),
    ]
    navigator.clipboard.writeText(lines.join('\n'))
    alert('Report copied to clipboard — paste it into Email / Slack / Teams.')
  }

  return (
    <div className="reports">
      <div className="panel">
        <div className="panel-head">
          <h2>Daily Automated Report — 3:30 PM</h2>
          <button className="btn primary" onClick={copyReport}>📋 Copy Report</button>
        </div>
        <p className="muted">
          Scheduled every day at 3:30 PM to: <b>{store.reportRecipients || 'not configured yet'}</b> (configure in
          Settings). This preview is generated live from current dashboard data.
        </p>
        <div className="report-metrics">
          {metrics.map(([k, v]) => (
            <div key={k} className="report-metric">
              <b>{v}</b>
              <span>{k}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>🚨 Delayed Projects</h2>
        <ReportList items={delayed} empty="No delayed projects." extra={(p) => `Target was ${fmtDate(p.targetRelease)}`} />
      </div>
      <div className="panel">
        <h2>📅 Releases in Next 7 Days</h2>
        <ReportList items={next7} empty="No releases due in the next 7 days." extra={(p) => fmtDate(p.targetRelease)} />
      </div>
      <div className="panel">
        <h2>⏰ Not Updated in Last 3 Days</h2>
        <ReportList items={stale} empty="All projects updated recently." extra={(p) => `Last update by ${p.updatedBy}`} />
      </div>
    </div>
  )
}

function ReportList({ items, empty, extra }) {
  if (items.length === 0) return <p className="muted">{empty}</p>
  return (
    <ul className="releases">
      {items.map((p) => (
        <li key={p.id}>
          <span className="rel-name">{p.name}</span>
          <span className="rel-date">{extra(p)}</span>
          <span className="badge" style={{ background: '#ef444422', color: '#b91c1c' }}>{deriveStatus(p)}</span>
        </li>
      ))}
    </ul>
  )
}
