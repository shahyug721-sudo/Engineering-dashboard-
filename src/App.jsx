import { useState } from 'react'
import { useStore } from './store.jsx'
import Sidebar from './components/Sidebar.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import ProjectsTable from './components/ProjectsTable.jsx'
import ProjectDetails from './components/ProjectDetails.jsx'
import RightPanel from './components/RightPanel.jsx'
import ProgressList from './components/ProgressList.jsx'
import UpdatesFeed from './components/UpdatesFeed.jsx'
import UpdatesOverview from './components/UpdatesOverview.jsx'
import ProjectModal from './components/ProjectModal.jsx'
import BackendSheet from './components/BackendSheet.jsx'
import ProjectUpdates from './components/ProjectUpdates.jsx'
import Reports from './components/Reports.jsx'
import { NotificationsView, UsersView, SettingsView } from './components/SimpleViews.jsx'

const TITLES = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  backend: 'Backend Sheet',
  updates: 'Project Updates',
  reports: 'Reports',
  notifications: 'Notifications',
  users: 'Users',
  settings: 'Settings',
}

export default function App() {
  const store = useStore()
  const [view, setView] = useState('dashboard')
  const [selectedId, setSelectedId] = useState(null)
  const [modal, setModal] = useState(null) // { project | null } => open modal

  const selected =
    store.projects.find((p) => p.id === selectedId) ||
    store.projects.find((p) => !p.live) ||
    store.projects[0]

  return (
    <div className="layout">
      <Sidebar view={view} setView={setView} />

      <main className="main">
        <header className="topbar">
          <h1>{TITLES[view]}</h1>
          <div className="topbar-right">
            <span className="report-note">🕒 Daily report will be sent at 03:30 PM</span>
            <button className="btn primary" onClick={() => setModal({ project: null })}>
              + Add Project
            </button>
            <span className="bell" title={store.activity.length + ' activities'}>
              🔔<i>{Math.min(store.activity.length, 9)}</i>
            </span>
            <span className="me">
              <span className="avatar">{(store.currentUser || 'A')[0]}</span>
              {store.currentUser}
            </span>
          </div>
        </header>

        {view === 'dashboard' && (
          <>
            <SummaryCards projects={store.projects} />
            <ProjectsTable
              selectedId={selected && selected.id}
              onSelect={setSelectedId}
              onEdit={(p) => setModal({ project: p })}
            />
            <UpdatesOverview
              projects={store.projects}
              selectedId={selected && selected.id}
              onSelect={setSelectedId}
            />
            <div className="bottom-grid">
              <div className="left-col">
                <ProjectDetails project={selected} onEdit={(p) => setModal({ project: p })} onSelect={setSelectedId} />
                <ProgressList projects={store.projects} selectedId={selected && selected.id} onSelect={setSelectedId} />
              </div>
              <RightPanel projects={store.projects} />
            </div>
            <UpdatesFeed selectedId={selected && selected.id} onSelect={setSelectedId} />
          </>
        )}

        {view === 'projects' && (
          <ProjectsTable
            selectedId={null}
            onSelect={(id) => {
              setSelectedId(id)
              setView('dashboard')
            }}
            onEdit={(p) => setModal({ project: p })}
            showActions
          />
        )}

        {view === 'backend' && (
          <BackendSheet onEdit={(p) => setModal({ project: p })} onAdd={() => setModal({ project: null })} />
        )}
        {view === 'updates' && <ProjectUpdates />}
        {view === 'reports' && <Reports />}
        {view === 'notifications' && <NotificationsView />}
        {view === 'users' && <UsersView />}
        {view === 'settings' && <SettingsView />}
      </main>

      {modal && <ProjectModal project={modal.project} onClose={() => setModal(null)} />}
    </div>
  )
}
