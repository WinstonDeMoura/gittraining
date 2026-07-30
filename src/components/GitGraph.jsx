import { useMemo } from 'react'

const LANE_COLORS = [
  '#818cf8',
  '#34d399',
  '#fb923c',
  '#f472b6',
  '#38bdf8',
  '#facc15',
  '#a78bfa',
  '#f87171',
]

function computeLayout(state) {
  const commits = state.commits
  const tips = [
    ...Object.entries(state.branches).map(([name, id]) => ({ name, id, kind: 'local' })),
    ...Object.entries(state.remoteBranches).map(([name, id]) => ({
      name: `origin/${name}`,
      id,
      kind: 'remote',
    })),
  ]

  const visible = new Set()
  const stack = tips.map((t) => t.id)
  while (stack.length) {
    const cur = stack.pop()
    if (!cur || visible.has(cur)) continue
    visible.add(cur)
    const c = commits[cur]
    if (c) stack.push(...c.parents)
  }

  const orderedTips = [...tips].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'local' ? -1 : 1
    if (a.name === 'main') return -1
    if (b.name === 'main') return 1
    return a.name.localeCompare(b.name)
  })

  const laneOf = {}
  let laneCount = 0
  for (const tip of orderedTips) {
    let cur = tip.id
    const chain = []
    while (cur && laneOf[cur] === undefined) {
      chain.push(cur)
      cur = commits[cur]?.parents[0]
    }
    if (chain.length === 0) continue
    // Uma raia nova para cada trecho ainda não visitado — mesmo que o trecho
    // termine encostando num ancestral já atribuído (é aí que a branch nasce).
    const lane = laneCount++
    for (const id of chain) laneOf[id] = lane
  }

  const sortedIds = [...visible].sort((a, b) => commits[a].seq - commits[b].seq)
  const rowHeight = 60
  const colWidth = 96
  const marginX = 70
  const marginY = 36
  const positions = {}
  sortedIds.forEach((id, i) => {
    positions[id] = {
      x: marginX + (laneOf[id] ?? 0) * colWidth,
      y: marginY + i * rowHeight,
    }
  })

  const tipsByCommit = {}
  for (const tip of orderedTips) {
    ;(tipsByCommit[tip.id] ??= []).push(tip)
  }

  return {
    sortedIds,
    positions,
    laneOf,
    tipsByCommit,
    width: marginX * 2 + Math.max(laneCount, 1) * colWidth,
    height: marginY * 2 + Math.max(sortedIds.length, 1) * rowHeight,
  }
}

export default function GitGraph({ state }) {
  const layout = useMemo(() => computeLayout(state), [state])

  return (
    <div className="h-full overflow-auto rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <svg width={layout.width} height={Math.max(layout.height, 140)}>
        {layout.sortedIds.map((id) =>
          state.commits[id].parents.map((pid) => {
            const pos = layout.positions[id]
            const ppos = layout.positions[pid]
            if (!ppos) return null
            const sameLane = layout.laneOf[pid] === layout.laneOf[id]
            const d = sameLane
              ? `M ${ppos.x} ${ppos.y} L ${pos.x} ${pos.y}`
              : `M ${ppos.x} ${ppos.y} C ${ppos.x} ${(ppos.y + pos.y) / 2}, ${pos.x} ${(ppos.y + pos.y) / 2}, ${pos.x} ${pos.y}`
            return <path key={`${id}-${pid}`} d={d} stroke="#475569" strokeWidth={2} fill="none" />
          }),
        )}

        {layout.sortedIds.map((id) => {
          const commit = state.commits[id]
          const pos = layout.positions[id]
          const color = LANE_COLORS[(layout.laneOf[id] ?? 0) % LANE_COLORS.length]
          const isHeadTip = state.branches[state.head] === id
          const tipsHere = layout.tipsByCommit[id] ?? []
          const label =
            commit.message.length > 34 ? `${commit.message.slice(0, 34)}…` : commit.message

          return (
            <g key={id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHeadTip ? 8 : 6}
                fill={color}
                stroke="#0f172a"
                strokeWidth={2}
              />
              <title>{`${id} — ${commit.message}`}</title>
              <text x={pos.x + 14} y={pos.y + 4} fontSize={11} fill="#cbd5e1">
                {label}
              </text>
              {tipsHere.map((t, i) => (
                <text
                  key={t.name}
                  x={pos.x - 10}
                  y={pos.y - 12 - i * 13}
                  fontSize={10}
                  textAnchor="end"
                  fill={color}
                  fontWeight={600}
                >
                  {t.name === state.head ? `HEAD → ${t.name}` : t.name}
                </text>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
