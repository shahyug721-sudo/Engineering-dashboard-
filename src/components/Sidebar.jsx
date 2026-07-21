const ITEMS = [
  ['dashboard', '📊', 'Dashboard'],
  ['projects', '📁', 'Projects'],
  ['backend', '📄', 'Backend Sheet'],
  ['updates', '📝', 'Project Updates'],
  ['reports', '📈', 'Reports'],
  ['notifications', '🔔', 'Notifications'],
  ['users', '👥', 'Users'],
  ['settings', '⚙️', 'Settings'],
]

export default function Sidebar({ view, setView }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">📶</span>
        <span className="brand-name">Engineering</span>
      </div>
      <nav>
        {ITEMS.map(([key, icon, label]) => (
          <button
            key={key}
            className={'nav-item' + (view === key ? ' active' : '')}
            onClick={() => setView(key)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="daily-card">
        <div className="daily-title">🕒 Daily Report Trigger</div>
        <div>Every day at 03:30 PM</div>
        <div className="daily-sent">Last sent: Today, 03:30 PM</div>
      </div>
    </aside>
  )
}
