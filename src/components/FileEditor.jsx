import { useEffect, useState } from 'react'

const FIELDS = [
  { key: 'status', label: 'Status do sprint', multiline: false },
  { key: 'quote', label: 'Frase do dia', multiline: false },
  { key: 'changelog', label: 'Changelog', multiline: true },
]

export default function FileEditor({ snapshot, dirty, onSave }) {
  const [drafts, setDrafts] = useState(snapshot)

  useEffect(() => {
    setDrafts(snapshot)
  }, [snapshot])

  function handleChange(key, value) {
    setDrafts((d) => ({ ...d, [key]: value }))
  }

  function handleSave(key) {
    const value = drafts[key]
    if (value === snapshot[key]) return
    onSave(key, value)
  }

  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">📄 Arquivo do projeto (editável)</h3>
        {dirty && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
            alterações pendentes
          </span>
        )}
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Edite um campo e clique em "Salvar alteração" — isso equivale a mexer no arquivo. Depois use{' '}
        <code className="rounded bg-black/40 px-1 py-0.5 text-emerald-300">git status</code>,{' '}
        <code className="rounded bg-black/40 px-1 py-0.5 text-emerald-300">git commit</code> e{' '}
        <code className="rounded bg-black/40 px-1 py-0.5 text-emerald-300">git push</code> no terminal ao lado
        para efetivar.
      </p>
      <div className="space-y-3">
        {FIELDS.map(({ key, label, multiline }) => {
          const fieldDirty = drafts[key] !== snapshot[key]
          const Field = multiline ? 'textarea' : 'input'
          return (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label} {fieldDirty && <span className="text-amber-400">(não salvo)</span>}
              </label>
              <div className="flex gap-2">
                <Field
                  {...(multiline ? { rows: 2 } : { type: 'text' })}
                  value={drafts[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="flex-1 resize-none rounded-lg bg-black/40 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleSave(key)}
                  disabled={!fieldDirty}
                  className="shrink-0 self-start rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition enabled:hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                >
                  Salvar alteração
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
