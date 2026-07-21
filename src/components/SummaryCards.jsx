import { deriveStatus } from '../utils.js'

// Count of projects currently in progress at a given pipeline stage.
const inStage = (key) => (ps) => ps.filter((p) => p.stages[key] === 'in_progress').length

// Cards laid out in pipeline order. The status buckets (Not Started, In
// Development, In QA/Testing, In UAT, Live, Blocked) partition all projects;
// the per-stage cards (Req. Gathering, UI Design, PR Review, Regression Test)
// show how many projects are actively in that stage right now.
const CARDS = [
  { label: 'Total Projects', sub: 'All Projects', icon: '📚', cls: 'blue', calc: (ps) => ps.length },
  { label: 'Not Started', sub: 'Yet to Begin', icon: '🕓', cls: 'grey', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'Not Started').length },
  { label: 'Req. Gathering', sub: 'In Progress', icon: '📋', cls: 'blue', calc: inStage('rg') },
  { label: 'UI Design', sub: 'In Progress', icon: '🎨', cls: 'purple', calc: inStage('ui') },
  { label: 'In Development', sub: 'In Progress', icon: '💻', cls: 'yellow', calc: (ps) => ps.filter((p) => ['In Development', 'Planning'].includes(deriveStatus(p))).length },
  { label: 'In QA / Testing', sub: 'QA / Testing', icon: '🧪', cls: 'purple', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'In QA / Testing').length },
  { label: 'PR Review', sub: 'In Progress', icon: '🔀', cls: 'teal', calc: inStage('pr') },
  { label: 'Regression Test', sub: 'In Progress', icon: '🔁', cls: 'yellow', calc: inStage('regression') },
  { label: 'In UAT', sub: 'User Acceptance', icon: '🧑‍💻', cls: 'teal', calc: (ps) => ps.filter((p) => deriveStatus(p) === 'In UAT').length },
  { label: 'Live Projects', sub: 'Live & Completed', icon: '🚀', cls: 'green', calc: (ps) => ps.filter((p) => p.live).length },
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
