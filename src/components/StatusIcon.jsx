export function StatusIcon({ status, size = 22 }) {
  const s = { width: size, height: size }
  if (status === 'completed')
    return (
      <span className="sicon completed" style={s} title="Completed">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M6 12.5l4 4L18 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  if (status === 'in_progress')
    return (
      <span className="sicon progress" style={s} title="In Progress">
        <svg viewBox="0 0 24 24">
          <path d="M12 4a8 8 0 010 16z" fill="#fff" opacity="0.9" />
        </svg>
      </span>
    )
  if (status === 'blocked')
    return (
      <span className="sicon blocked" style={s} title="Blocked">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
    )
  return <span className="sicon notstarted" style={s} title="Not Started" />
}

export function RocketIcon({ active, size = 22 }) {
  return (
    <span className={'sicon rocket' + (active ? ' live' : '')} style={{ width: size, height: size }} title={active ? 'Live' : 'Not live'}>
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3c3.5 1.5 5 5 5 8l2.5 3-3 .5-2 2-.5 3-3-2.5c-3 0-6.5-1.5-8-5C5.5 8.5 8.5 4.5 12 3z"
          transform="rotate(45 12 12)"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="1.6" fill="currentColor" />
      </svg>
    </span>
  )
}
