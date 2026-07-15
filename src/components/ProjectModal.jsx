import { useState } from 'react'
import { useStore } from '../store.jsx'
import { STAGES, STATUS_OPTIONS, uid } from '../utils.js'

const emptyForm = () => ({
  name: '',
  subProject: '',
  owner: '',
  product: '',
  stages: Object.fromEntries(STAGES.map((s) => [s.key, 'not_started'])),
  live: false,
  targetRelease: '',
  currentUpdate: '',
  nextStepsText: '',
})

export default function ProjectModal({ project, onClose }) {
  const store = useStore()
  const editing = !!project
  const [form, setForm] = useState(() =>
    editing
      ? {
          ...project,
          nextStepsText: project.nextSteps.map((t) => t.text).join('\n'),
        }
      : { ...emptyForm(), owner: store.owners[0] || '', product: store.products[0] || '' }
  )
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setStage = (k, v) => setForm((f) => ({ ...f, stages: { ...f.stages, [k]: v } }))

  const save = () => {
    if (!form.name.trim()) {
      setError('Project Name is mandatory.')
      return
    }
    const lines = form.nextStepsText.split('\n').map((l) => l.trim()).filter(Boolean)
    const prevTasks = editing ? project.nextSteps : []
    const nextSteps = lines.map((text) => {
      const existing = prevTasks.find((t) => t.text === text)
      return existing || { id: uid(), text, done: false }
    })
    const data = {
      name: form.name.trim(),
      subProject: form.subProject.trim(),
      owner: form.owner,
      product: form.product,
      stages: form.stages,
      live: form.live,
      targetRelease: form.targetRelease,
      currentUpdate: form.currentUpdate,
      nextSteps,
    }
    if (editing) store.updateProject(project.id, data)
    else store.addProject(data)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{editing ? 'Edit Project' : 'Add New Project'}</h3>
          <button className="task-x" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <label>
              Project Name <em>*</em>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. GA BLUE B2C IAP – iOS" />
            </label>
            <label>
              Sub Project
              <input value={form.subProject} onChange={(e) => set('subProject', e.target.value)} placeholder="Optional" />
            </label>
            <label>
              Owner
              <select value={form.owner} onChange={(e) => set('owner', e.target.value)}>
                {store.owners.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Product
              <select value={form.product} onChange={(e) => set('product', e.target.value)}>
                {store.products.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Tentative Release Date
              <input type="date" value={form.targetRelease} onChange={(e) => set('targetRelease', e.target.value)} />
            </label>
            <label className="check-label">
              <input type="checkbox" checked={form.live} onChange={(e) => set('live', e.target.checked)} />
              Live (available to users) 🚀
            </label>
          </div>

          <h4>Stage Status</h4>
          <div className="form-grid stages-grid">
            {STAGES.map((s) => (
              <label key={s.key}>
                {s.label}
                <select value={form.stages[s.key]} onChange={(e) => setStage(s.key, e.target.value)}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="form-grid">
            <label className="full">
              Current Update
              <textarea rows={4} value={form.currentUpdate} onChange={(e) => set('currentUpdate', e.target.value)} placeholder="Current progress…" />
            </label>
            <label className="full">
              Next Steps (one task per line)
              <textarea rows={4} value={form.nextStepsText} onChange={(e) => set('nextStepsText', e.target.value)} placeholder={'Complete QA testing\nSubmit for UAT'} />
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-foot">
          <span className="muted">Last Updated &amp; Updated By are stamped automatically.</span>
          <div className="row-gap">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn primary" onClick={save}>{editing ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
