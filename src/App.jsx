import { useRef } from 'react'
import Header from './components/Header.jsx'
import GitSandbox from './components/GitSandbox.jsx'
import ExerciseGuide from './components/ExerciseGuide.jsx'
import Footer from './components/Footer.jsx'
import { projectInfo, changelog, featureFlags } from './data/sandboxProject.js'

export default function App() {
  const sandboxRef = useRef(null)

  function handlePractice(exerciseNumber) {
    sandboxRef.current?.loadScenario(`ex${exerciseNumber}`)
    document.getElementById('git-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        version={projectInfo.version}
        environment={projectInfo.environment}
        projectStatus="Simulador de Git — pratique branches, merges e conflitos"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <GitSandbox ref={sandboxRef} />

        <section className="rounded-2xl bg-surface-light p-6 ring-1 ring-white/10">
          <h2 className="mb-1 text-lg font-bold">📄 Arquivo de prática (repositório real)</h2>
          <p className="mb-4 text-sm text-slate-400">
            Para os exercícios com repositório de verdade (commit, push, PR), edite{' '}
            <code className="rounded bg-black/40 px-1.5 py-0.5 text-emerald-300">
              src/data/sandboxProject.js
            </code>
            . O changelog abaixo tem uma "zona de conflito" comentada no código — todo mundo edita
            perto da mesma linha de propósito.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
              <h3 className="mb-2 text-sm font-semibold text-indigo-400">Changelog</h3>
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
        </section>
      </main>

      <Footer />
      <ExerciseGuide onPractice={handlePractice} />
    </div>
  )
}
