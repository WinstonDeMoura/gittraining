import { useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import GitSandbox from './components/GitSandbox.jsx'
import GitHubFilePanel from './components/GitHubFilePanel.jsx'
import ExerciseGuide from './components/ExerciseGuide.jsx'
import Footer from './components/Footer.jsx'
import { projectInfo, changelog, featureFlags } from './data/sandboxProject.js'

export default function App() {
  const sandboxRef = useRef(null)
  const [mode, setMode] = useState('sim')
  const [scrollRequestId, setScrollRequestId] = useState(0)

  useEffect(() => {
    if (scrollRequestId > 0) {
      document.getElementById('git-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scrollRequestId])

  function handlePractice(exerciseNumber) {
    setMode('sim')
    sandboxRef.current?.loadScenario(`ex${exerciseNumber}`)
    setScrollRequestId((n) => n + 1)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        version={projectInfo.version}
        environment={projectInfo.environment}
        projectStatus="Pratique git de verdade e simule commits, merges e conflitos em tempo real."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
        <div className="flex w-fit gap-1 rounded-full bg-surface-light p-1 ring-1 ring-white/10">
          <button
            onClick={() => setMode('sim')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === 'sim' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧪 Simulador
          </button>
          <button
            onClick={() => setMode('real')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === 'real' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📁 Repositório real
          </button>
        </div>

        <div className={mode === 'sim' ? '' : 'hidden'}>
          <GitSandbox ref={sandboxRef} />
        </div>

        <div className={mode === 'real' ? 'space-y-6' : 'hidden'}>
          <section className="rounded-2xl bg-surface-light p-6 ring-1 ring-white/10">
            <h2 className="mb-1 text-lg font-bold">📁 Repositório real (GitHub)</h2>
            <p className="mb-4 text-sm text-slate-400">
              Este arquivo existe de verdade no repositório. Para editar: clone o repo, crie uma
              branch, edite{' '}
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-emerald-300">
                src/data/sandboxProject.js
              </code>{' '}
              localmente, faça commit, push e abra um Pull Request. Ele tem uma "zona de conflito"
              comentada no código — todo mundo edita perto da mesma linha de propósito, pra gerar
              conflitos de merge de verdade.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
                  <h3 className="mb-2 text-sm font-semibold text-indigo-400">
                    💾 Sua build local (pode estar desatualizada)
                  </h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {changelog.map((entry) => (
                      <li key={entry.id}>
                        <span className="text-slate-500">{entry.version}</span> — {entry.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
                  <h3 className="mb-2 text-sm font-semibold text-indigo-400">Feature flags</h3>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {Object.entries(featureFlags).map(([key, value]) => (
                      <li key={key} className="flex items-center justify-between">
                        <span>{key}</span>
                        <span className={value ? 'text-emerald-400' : 'text-slate-500'}>
                          {String(value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <GitHubFilePanel />
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <ExerciseGuide onPractice={handlePractice} />
    </div>
  )
}
