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
        .map((p, i) => {
          const c = STATUS_BG[norm(deriveStatus(p))] || '#64748b'
          const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
          return `<tr>
        <td style="padding:9px 18px;background:${bg};border-bottom:1px solid #eef2f7;font-weight:600;color:#0f172a;font-size:12.5px;">${esc(p.name)}</td>
        <td style="padding:9px 8px;background:${bg};border-bottom:1px solid #eef2f7;color:#64748b;font-size:12px;white-space:nowrap;">${esc(fmtDate(p.targetRelease))}</td>
        <td style="padding:9px 18px 9px 8px;background:${bg};border-bottom:1px solid #eef2f7;text-align:right;"><span style="background:${c};color:#fff;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;">${esc(shortStatus(p))}</span></td>
      </tr>`
        })
        .join('')
    : '<tr><td style="padding:12px 18px;color:#94a3b8;font-size:13px;">No scheduled releases.</td></tr>'

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
      <td width="14%" style="padding:6px 4px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:${color};line-height:1.1;">${val}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">${esc(label)}</div>
      </td>`
    )
    .join('')

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

  // Reusable section card + column header.
  const card = (title, inner, pad = '16px 18px') =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:#ffffff;border:1px solid #e5e9f2;border-radius:12px;margin-bottom:16px;">
      <tr><td style="padding:${pad};">
        <div style="font-size:15px;font-weight:800;color:#0f172a;margin:0 0 12px;">${title}</div>
        ${inner}
      </td></tr>
    </table>`
  const th = (t, align = 'left') =>
    `<th align="${align}" style="padding:0 8px 8px;font-size:10.5px;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em;font-weight:700;border-bottom:2px solid #eef2f7;">${t}</th>`

  const summaryInner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${metricCells}</tr></table>`

  const statusInner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${statusChart}</table>
      <div style="margin-top:12px;">${legend}</div>`

  const upcomingInner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>${th('Project')}${th('Target')}${th('Stage', 'right')}</tr>
        ${upcomingHtml}
      </table>`

  // Delayed projects — overdue and not live — as a clear, always-present card.
  const overdueDays = (p) => Math.round((today - new Date(p.targetRelease + 'T00:00:00')) / 86400000)
  const delayedInner = delayed.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>${th('Project')}${th('Was due')}${th('Status', 'right')}</tr>
        ${delayed
          .map(
            (p) => `<tr>
          <td style="padding:9px 8px;border-bottom:1px solid #eef2f7;font-weight:600;color:#0f172a;font-size:12.5px;">${esc(p.name)}</td>
          <td style="padding:9px 8px;border-bottom:1px solid #eef2f7;color:#b91c1c;font-size:12px;white-space:nowrap;">${esc(fmtDate(p.targetRelease))} · ${overdueDays(p)}d late</td>
          <td style="padding:9px 8px;border-bottom:1px solid #eef2f7;text-align:right;"><span style="background:${STATUS_BG[norm(deriveStatus(p))] || '#64748b'};color:#fff;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;">${esc(shortStatus(p))}</span></td>
        </tr>`
          )
          .join('')}
      </table>`
    : `<div style="padding:4px 0;color:#16a34a;font-size:13px;font-weight:600;">✅ No delayed projects — everything is on or ahead of schedule.</div>`

  const updatesInner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>${th('Project')}${th('Status')}${th('Current Update')}${th('Next Steps')}</tr>
        ${rows}
      </table>`

  return `<!doctype html>
  <html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:720px;margin:0 auto;padding:22px 18px;">
      <div style="padding:2px 2px 16px;">
        <div style="font-size:22px;font-weight:800;color:#0f172a;">Engineering Daily Report</div>
        <div style="color:#64748b;font-size:13px;margin-top:3px;">${esc(dateStr)} · 1:00 PM IST</div>
      </div>
      ${card('Summary', summaryInner)}
      ${card('Current Update &amp; Next Steps', updatesInner, '14px 14px')}
      ${card('Delayed Projects', delayedInner)}
      ${card('Upcoming Releases', upcomingInner)}
      ${card('Projects by Status', statusInner)}
      <div style="color:#94a3b8;font-size:11px;margin-top:4px;padding:0 4px;">
        Automated from the Engineering Dashboard · reflects live data at send time.
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
  const to = process.env.REPORT_TO || 'incharge@actiontourguide.com'
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
