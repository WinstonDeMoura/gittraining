export default function Header({ version, environment, projectStatus }) {
  const envStyles = {
    training: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    staging: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    production: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  }

  const badgeClass = envStyles[environment] ?? envStyles.training

  return (
    <header className="border-b border-white/10 bg-surface-light/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            🧑‍🤝‍🧑 Mural da Equipe
          </h1>
          <p className="mt-1 text-sm text-slate-400">{projectStatus}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
            v{version}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${badgeClass}`}
          >
            {environment}
          </span>
        </div>
      </div>
    </header>
  )
}
