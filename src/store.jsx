import { createContext, useContext, useEffect, useState } from 'react'
import { SEED } from './data.js'
import { uid, statusLabel, STAGES } from './utils.js'

const KEY = 'engineering-dashboard-v3'
const StoreCtx = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.projects)) return { ...SEED, ...parsed }
    }
  } catch {
    /* corrupted storage – fall back to seed */
  }
  return JSON.parse(JSON.stringify(SEED))
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const now = () => new Date().toISOString()

  const log = (s, text) => ({
    ...s,
    activity: [{ ts: now(), user: s.currentUser, text }, ...s.activity].slice(0, 200),
  })

  const stamp = (s, p) => ({ ...p, lastUpdated: now(), updatedBy: s.currentUser })

  // Owners/products typed into a project form are registered automatically.
  const register = (s, data) => {
    let { owners, products } = s
    const owner = (data.owner || '').trim()
    const product = (data.product || '').trim()
    if (owner && !owners.includes(owner)) owners = [...owners, owner]
    if (product && !products.includes(product)) products = [...products, product]
    return { ...s, owners, products }
  }

  const api = {
    ...state,

    addProject(data) {
      setState((s) => {
        const project = stamp(s, { ...data, id: uid() })
        return log(
          { ...register(s, data), projects: [...s.projects, project] },
          `Created project "${project.name}"`
        )
      })
    },

    updateProject(id, patch, note) {
      setState((s) => {
        const projects = s.projects.map((p) =>
          p.id === id ? stamp(s, { ...p, ...patch }) : p
        )
        const name = (s.projects.find((p) => p.id === id) || {}).name || ''
        return log({ ...register(s, patch), projects }, note || `Updated project "${name}"`)
      })
    },

    deleteProject(id) {
      setState((s) => {
        const name = (s.projects.find((p) => p.id === id) || {}).name || ''
        return log(
          { ...s, projects: s.projects.filter((p) => p.id !== id) },
          `Deleted project "${name}"`
        )
      })
    },

    setStage(id, stageKey, status) {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        if (!proj) return s
        const projects = s.projects.map((p) =>
          p.id === id ? stamp(s, { ...p, stages: { ...p.stages, [stageKey]: status } }) : p
        )
        const stage = STAGES.find((x) => x.key === stageKey)
        return log(
          { ...s, projects },
          `Updated "${proj.name}" – ${stage ? stage.label : stageKey} set to ${statusLabel(status)}`
        )
      })
    },

    toggleLive(id) {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        if (!proj) return s
        const live = !proj.live
        const projects = s.projects.map((p) => (p.id === id ? stamp(s, { ...p, live }) : p))
        return log(
          { ...s, projects },
          `Marked "${proj.name}" as ${live ? 'Live 🚀' : 'not live'}`
        )
      })
    },

    addTask(id, text) {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        if (!proj || !text.trim()) return s
        const task = { id: uid(), text: text.trim(), done: false }
        const projects = s.projects.map((p) =>
          p.id === id ? stamp(s, { ...p, nextSteps: [...p.nextSteps, task] }) : p
        )
        return log({ ...s, projects }, `Added task to "${proj.name}": ${task.text}`)
      })
    },

    toggleTask(id, taskId) {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        if (!proj) return s
        const task = proj.nextSteps.find((t) => t.id === taskId)
        const projects = s.projects.map((p) =>
          p.id === id
            ? stamp(s, {
                ...p,
                nextSteps: p.nextSteps.map((t) =>
                  t.id === taskId ? { ...t, done: !t.done } : t
                ),
              })
            : p
        )
        return log(
          { ...s, projects },
          `${task && !task.done ? 'Completed' : 'Reopened'} task on "${proj.name}": ${task ? task.text : ''}`
        )
      })
    },

    removeTask(id, taskId) {
      setState((s) => {
        const proj = s.projects.find((p) => p.id === id)
        if (!proj) return s
        const projects = s.projects.map((p) =>
          p.id === id
            ? stamp(s, { ...p, nextSteps: p.nextSteps.filter((t) => t.id !== taskId) })
            : p
        )
        return log({ ...s, projects }, `Removed a task from "${proj.name}"`)
      })
    },

    addOwner(name) {
      setState((s) =>
        !name.trim() || s.owners.includes(name.trim())
          ? s
          : log({ ...s, owners: [...s.owners, name.trim()] }, `Added owner ${name.trim()}`)
      )
    },

    removeOwner(name) {
      setState((s) =>
        log({ ...s, owners: s.owners.filter((o) => o !== name) }, `Removed owner ${name}`)
      )
    },

    addProduct(name) {
      setState((s) =>
        !name.trim() || s.products.includes(name.trim())
          ? s
          : log({ ...s, products: [...s.products, name.trim()] }, `Added product ${name.trim()}`)
      )
    },

    setCurrentUser(name) {
      setState((s) => ({ ...s, currentUser: name || 'Admin User' }))
    },

    setReportRecipients(v) {
      setState((s) => ({ ...s, reportRecipients: v }))
    },

    resetData() {
      setState(JSON.parse(JSON.stringify(SEED)))
    },
  }

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)
