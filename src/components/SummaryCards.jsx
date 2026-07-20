import { deriveStatus } from '../utils.js'

const CARDS = [
  { label: 'Total Projects', sub: 'All Projects', icon: '📚', cls: 'blue', calc: (ps) => ps.length },
  { label: 'Live Projects', sub: 'Live & Completed', icon: '🚀', cls: 'green', calc: (ps) => ps.filter((p) => p.live).length },
  { label: 'Not Started', sub: 'Yet to Begin', icon: '🕓', cls: 'grey', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'Not Started').length },
  { label: 'In Development', sub: 'In Progress', icon: '💻', cls: 'yellow', calc: (ps) => ps.filter((p) => ['In Development', 'Planning'].includes(deriveStatus(p))).length },
  { label: 'In QA / Testing', sub: 'QA / Testing', icon: '🧪', cls: 'purple', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'In QA / Testing').length },
  { label: 'In UAT', sub: 'User Acceptance', icon: '🧑‍💻', cls: 'teal', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'In UAT').length },
  { label: 'Blocked', sub: 'Needs Attention', icon: '⚠️', cls: 'red', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'Blocked').length },
]

export default function SummaryCards({ projects }) {
  return (
    <div className="cards">
      {CARDS.map((c) => (
        <div className="card" key={c.label}>
          <span className={'card-icon ' + c.cls}>{c.icon}</span>
          <div>
            <div className={'card-label ' + c.cls}>{c.label}</div>
            <div className="card-value">{c.calc(projects)}</div>
            <div className="card-sub">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
