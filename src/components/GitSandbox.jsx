import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import GitTerminal from './GitTerminal.jsx'
import GitGraph from './GitGraph.jsx'
import { scenarios, getScenario } from '../git-sim/scenarios.js'
import { runCommand } from '../git-sim/gitEngine.js'

function welcomeMessage(scenario) {
  return `Cenário carregado: ${scenario.label}\n${scenario.description}\nDigite "help" para ver os comandos disponíveis.`
}

const GitSandbox = forwardRef(function GitSandbox(_props, ref) {
  const [scenarioId, setScenarioId] = useState('default')
  const scenario = getScenario(scenarioId)
  const [engineState, setEngineState] = useState(() => scenario.build())
  const [transcript, setTranscript] = useState(() => [
    { type: 'output', text: welcomeMessage(scenario) },
  ])

  const loadScenario = useCallback((id) => {
    const s = getScenario(id)
    setScenarioId(id)
    setEngineState(s.build())
    setTranscript([{ type: 'output', text: welcomeMessage(s) }])
  }, [])

  useImperativeHandle(ref, () => ({ loadScenario }), [loadScenario])

  function handleRun(cmd) {
    const { state, output, isError } = runCommand(cmd, engineState)
    setEngineState(state)
    setTranscript((t) => [
      ...t,
      { type: 'input', text: cmd },
      { type: isError ? 'error' : 'output', text: output },
    ])
  }

  return (
    <div id="git-sandbox" className="scroll-mt-24 rounded-2xl bg-surface-light p-5 ring-1 ring-white/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">🧪 Sandbox Interativo de Git</h2>
          <p className="text-sm text-slate-400">{scenario.description}</p>
        </div>
        <select
          value={scenarioId}
          onChange={(e) => loadScenario(e.target.value)}
          className="rounded-lg bg-surface px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-96">
          <GitTerminal transcript={transcript} onRun={handleRun} />
        </div>
        <div className="h-96">
          <GitGraph state={engineState} />
        </div>
      </div>
    </div>
  )
})

export default GitSandbox
