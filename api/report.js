// Builds the daily Engineering report HTML from the live dashboard data.
import { SEED } from '../src/data.js'
import { STAGES, deriveStatus, progress, fmtDate } from '../src/utils.js'
import { getState, kvConfigured } from './_kv.js'

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const STATUS_BG = {
  Live: '#22c55e',
  'In Development': '#f59e0b',
  Planning: '#f59e0b',
  'In QA / Testing': '#8b5cf6',
  'In UAT': '#06b6d4',
  Blocked: '#ef4444',
  'Not Started': '#94a3b8',
}

export function buildReportHtml(projects, nowIst = new Date()) {
  const dateStr = nowIst.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const count = (fn) => projects.filter(fn).length
  const metrics = [
    ['Total', projects.length, '#2563eb'],
    ['Live', count((p) => p.live), '#22c55e'],
    ['In Dev', count((p) => ['In Development', 'Planning'].includes(deriveStatus(p))), '#f59e0b'],
    ['QA / Testing', count((p) => deriveStatus(p) === 'In QA / Testing'), '#8b5cf6'],
    ['UAT', count((p) => deriveStatus(p) === 'In UAT'), '#06b6d4'],
    ['Not Started', count((p) => deriveStatus(p) === 'Not Started'), '#94a3b8'],
    ['Blocked', count((p) => deriveStatus(p) === 'Blocked'), '#ef4444'],
  ]

  // Today at IST midnight for the delayed-projects comparison.
  const today = new Date(nowIst.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  today.setHours(0, 0, 0, 0)
  const delayed = projects.filter((p) => !p.live && p.targetRelease && new Date(p.targetRelease + 'T23:59:59') < today)

  // A single proportional bar (track + coloured fill), email-safe via nested tables.
  const bar = (pct, color, h) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#eef2f7;border-radius:${h / 2}px;"><tr>` +
    `<td width="${Math.max(2, pct)}%" style="background:${color};height:${h}px;border-radius:${h / 2}px;font-size:0;line-height:0;">&nbsp;</td>` +
    `<td style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`

  const norm = (s) => (s === 'Planning' ? 'In Development' : s)
  const statusOrder = ['Live', 'In Development', 'In QA / Testing', 'In UAT', 'Not Started', 'Blocked']
  const total = projects.length || 1

  // Graph 2 — Projects by Status (mirrors the donut chart).
  const statusCounts = {}
  projects.forEach((p) => {
    const s = norm(deriveStatus(p))
    statusCounts[s] = (statusCounts[s] || 0) + 1
  })
  const statusChart = statusOrder
    .filter((s) => statusCounts[s])
    .map((s) => {
      const n = statusCounts[s]
      const pct = Math.round((n / total) * 100)
      return `<tr>
        <td style="font-size:12px;color:#334155;padding:4px 10px 4px 0;white-space:nowrap;">${s}</td>
        <td style="padding:4px 0;width:100%;">${bar(pct, STATUS_BG[s], 12)}</td>
        <td style="font-size:12px;color:#64748b;padding:4px 0 4px 10px;white-space:nowrap;text-align:right;">${n} (${pct}%)</td>
      </tr>`
    })
    .join('')

  // Upcoming Releases — every not-live project with a target date, soonest first.
  const shortStatus = (p) => norm(deriveStatus(p)).replace('In QA / Testing', 'Testing').replace('In ', '')
  const upcoming = projects
    .filter((p) => !p.live && p.targetRelease)
    .sort((a, b) => a.targetRelease.localeCompare(b.targetRelease))
  const upcomingHtml = upcoming.length
    ? upcoming
        .map((p) => {
          const c = STATUS_BG[norm(deriveStatus(p))] || '#64748b'
          return `<tr>
        <td style="padding:6px 8px 6px 0;border-bottom:1px solid #eef2f7;font-weight:600;color:#0f172a;font-size:12.5px;">${esc(p.name)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eef2f7;color:#64748b;font-size:12px;white-space:nowrap;">${esc(fmtDate(p.targetRelease))}</td>
        <td style="padding:6px 0 6px 8px;border-bottom:1px solid #eef2f7;text-align:right;"><span style="background:${c};color:#fff;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;">${esc(shortStatus(p))}</span></td>
      </tr>`
        })
        .join('')
    : '<tr><td style="color:#94a3b8;font-size:13px;">No scheduled releases.</td></tr>'

  const legend = statusOrder
    .filter((s) => statusCounts[s])
    .map(
      (s) =>
        `<span style="display:inline-block;margin:0 12px 4px 0;font-size:11px;color:#64748b;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${STATUS_BG[s]};vertical-align:middle;margin-right:5px;"></span>${s}</span>`
    )
    .join('')

  const metricCells = metrics
    .map(
      ([label, val, color]) => `
      <td style="padding:10px 6px;text-align:center;background:#f8fafd;border:1px solid #e5e9f2;border-radius:8px;">
        <div style="font-size:22px;font-weight:800;color:${color};">${val}</div>
        <div style="font-size:11px;color:#64748b;">${esc(label)}</div>
      </td>`
    )
    .join('<td style="width:6px;"></td>')

  const rows = projects
    .map((p) => {
      const status = deriveStatus(p)
      const pct = progress(p)
      const nextSteps = p.nextSteps && p.nextSteps.length
        ? '<ul style="margin:0;padding-left:16px;">' +
          p.nextSteps.map((t) => `<li style="${t.done ? 'text-decoration:line-through;color:#94a3b8;' : ''}">${esc(t.text)}</li>`).join('') +
          '</ul>'
        : '<span style="color:#94a3b8;">—</span>'
      const stageSummary = STAGES.filter((s) => p.stages[s.key] === 'in_progress')
        .map((s) => s.label)
        .join(', ') || (p.live ? 'Live' : '—')
      return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eef2f7;vertical-align:top;">
          <div style="font-weight:700;color:#0f172a;">${esc(p.name)}</div>
          <div style="font-size:11px;color:#64748b;">${esc(p.owner)} · ${esc(p.product)}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eef2f7;vertical-align:top;white-space:nowrap;">
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;color:#fff;background:${STATUS_BG[status] || '#64748b'};">${esc(status)}</span>
          <div style="font-size:11px;color:#64748b;margin:4px 0 3px;">${pct}% · ${esc(fmtDate(p.targetRelease))}</div>
          <div style="max-width:120px;">${bar(pct, STATUS_BG[status] || '#2563eb', 6)}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eef2f7;vertical-align:top;font-size:13px;color:#334155;">
          ${p.currentUpdate ? esc(p.currentUpdate).replace(/\n/g, '<br/>') : '<span style="color:#94a3b8;">—</span>'}
          <div style="font-size:11px;color:#94a3b8;margin-top:3px;">Active: ${esc(stageSummary)}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eef2f7;vertical-align:top;font-size:13px;color:#334155;">${nextSteps}</td>
      </tr>`
    })
    .join('')

  const listBlock = (title, items, extra) =>
    `<h3 style="font-size:14px;margin:18px 0 6px;">${title}</h3>` +
    (items.length
      ? '<ul style="margin:0;padding-left:18px;color:#334155;">' +
        items.map((p) => `<li>${esc(p.name)} — ${esc(extra(p))}</li>`).join('') +
        '</ul>'
      : '<div style="color:#94a3b8;">None</div>')

  return `<!doctype html>
  <html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:840px;margin:0 auto;padding:20px;">
      <h1 style="font-size:20px;margin:0;">Engineering Daily Report</h1>
      <div style="color:#64748b;font-size:13px;margin:4px 0 16px;">${esc(dateStr)} · 1:00 PM IST</div>

      <div style="font-size:13px;font-weight:700;margin:0 0 8px;">Summary</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;"><tr>${metricCells}</tr></table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr>
          <td width="50%" valign="top" style="padding-right:12px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:6px;">Projects by Status</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${statusChart}</table>
          </td>
          <td width="50%" valign="top" style="padding-left:12px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:6px;">Upcoming Releases</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${upcomingHtml}</table>
          </td>
        </tr>
      </table>
      <div style="margin-bottom:20px;">${legend}</div>

      <div style="font-size:13px;font-weight:700;margin:0 0 8px;">Project Updates &amp; Next Steps</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border:1px solid #e5e9f2;border-radius:10px;overflow:hidden;">
        <tr style="background:#f8fafd;">
          <th align="left" style="padding:10px 8px;font-size:12px;color:#64748b;">Project</th>
          <th align="left" style="padding:10px 8px;font-size:12px;color:#64748b;">Status</th>
          <th align="left" style="padding:10px 8px;font-size:12px;color:#64748b;">Current Update</th>
          <th align="left" style="padding:10px 8px;font-size:12px;color:#64748b;">Next Steps</th>
        </tr>
        ${rows}
      </table>

      ${listBlock('🚨 Delayed projects', delayed, (p) => 'target was ' + fmtDate(p.targetRelease))}

      <div style="color:#94a3b8;font-size:11px;margin-top:24px;">
        Automated from the Engineering Dashboard. Reflects the latest deployed data.
      </div>
    </div>
  </body></html>`
}

export default async function handler(req, res) {
  // Auth: Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Manual test
  // can pass ?key=<CRON_SECRET>. The secret must be configured to run at all.
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'CRON_SECRET is not set in the environment.' })
  }
  const auth = req.headers.authorization || ''
  const key = (req.query && req.query.key) || ''
  if (auth !== `Bearer ${secret}` && key !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const apiKey = process.env.RESEND_API_KEY
  if (!smtpUser && !apiKey) {
    return res.status(500).json({
      error: 'No email provider configured. Set SMTP_USER + SMTP_PASS (Gmail), or RESEND_API_KEY.',
    })
  }
  const to = process.env.REPORT_TO || 'ashwinee@actiontourguide.com'
  const from =
    process.env.REPORT_FROM ||
    (smtpUser ? `Engineering Dashboard <${smtpUser}>` : 'Engineering Dashboard <onboarding@resend.dev>')

  const now = new Date()
  const subject =
    'Engineering Daily Report — ' +
    now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })

  // Prefer the live dashboard data saved in KV; fall back to the deployed seed.
  let projects = SEED.projects
  if (kvConfigured()) {
    try {
      const state = await getState()
      if (state && Array.isArray(state.projects) && state.projects.length) projects = state.projects
    } catch {
      /* KV read failed — fall back to seed */
    }
  }
  const html = buildReportHtml(projects, now)
  const recipients = to.split(',').map((x) => x.trim()).filter(Boolean)

  try {
    // Primary: SMTP (e.g. Gmail / Google Workspace) via an app password.
    if (smtpUser && smtpPass) {
      const nodemailer = (await import('nodemailer')).default
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      })
      const info = await transporter.sendMail({ from, to: recipients, subject, html })
      return res.status(200).json({ ok: true, via: 'smtp', id: info.messageId, to })
    }

    // Alternative: Resend HTTP API.
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject, html }),
    })
    const data = await r.json()
    if (!r.ok) return res.status(502).json({ error: 'Email send failed', detail: data })
    return res.status(200).json({ ok: true, via: 'resend', id: data.id, to })
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', detail: String(err) })
  }
}
