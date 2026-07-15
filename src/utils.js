export const STAGES = [
  { key: 'rg', label: 'Req. Gathering', icon: '📋' },
  { key: 'ui', label: 'UI Design', icon: '🎨' },
  { key: 'dev', label: 'Development', icon: '</>' },
  { key: 'qa', label: 'QA Testing', icon: '🧪' },
  { key: 'pr', label: 'PR Review', icon: '🔀' },
  { key: 'regression', label: 'Regression Test', icon: '🔁' },
  { key: 'uat', label: 'UAT', icon: '👥' },
]

export const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

export const statusLabel = (v) =>
  (STATUS_OPTIONS.find((s) => s.value === v) || {}).label || v

// Derived overall project status, used for cards / donut / filters
export function deriveStatus(p) {
  if (p.live) return 'Live'
  if (STAGES.some((s) => p.stages[s.key] === 'blocked')) return 'Blocked'
  if (p.stages.uat === 'in_progress') return 'In UAT'
  if (
    p.stages.qa === 'in_progress' ||
    p.stages.pr === 'in_progress' ||
    p.stages.regression === 'in_progress'
  )
    return 'In QA / Testing'
  if (p.stages.dev === 'in_progress' || p.stages.dev === 'completed')
    return 'In Development'
  if (STAGES.every((s) => p.stages[s.key] === 'not_started')) return 'Not Started'
  return 'Planning'
}

export const STATUS_COLORS = {
  Live: '#22c55e',
  'In Development': '#f59e0b',
  'In QA / Testing': '#8b5cf6',
  'In UAT': '#06b6d4',
  Blocked: '#ef4444',
  Planning: '#64748b',
  'Not Started': '#94a3b8',
}

export function progress(p) {
  if (p.live) return 100
  let pts = 0
  for (const s of STAGES) {
    if (p.stages[s.key] === 'completed') pts += 1
    else if (p.stages[s.key] === 'in_progress') pts += 0.5
  }
  return Math.round((pts / STAGES.length) * 100)
}

export function fmtDate(iso) {
  if (!iso) return 'TBD'
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d)) return 'TBD'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

export function daysBetween(fromDate, toIso) {
  if (!toIso) return null
  const to = new Date(toIso + 'T00:00:00')
  if (isNaN(to)) return null
  return Math.round((to - fromDate) / 86400000)
}

export function releaseMonth(p) {
  if (!p.targetRelease) return ''
  return p.targetRelease.slice(0, 7) // YYYY-MM
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
