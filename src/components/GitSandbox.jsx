import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import GitTerminal from './GitTerminal.jsx'
import GitGraph from './GitGraph.jsx'
import CommandReference from './CommandReference.jsx'
import FileEditor from './FileEditor.jsx'
import { getScenario } from '../git-sim/scenarios.js'
import { runCommand, applyFieldEdit } from '../git-sim/gitEngine.js'

function welcomeMessage(scenario) {
  return `Cenário carregado: ${scenario.label}\n${scenario.description}`
}

const GitSandbox = forwardRef(function GitSandbox(_props, ref) {
  const [scenario, setScenario] = useState(() => getScenario('default'))
  const [engineState, setEngineState] = useState(() => scenario.build())
  const [transcript, setTranscript] = useState(() => [
    { type: 'output', text: welcomeMessage(scenario) },
  ])

  const loadScenario = useCallback((id) => {
    const s = getScenario(id)
    setScenario(s)
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

  function handleEditField(field, value) {
    const { state, output } = applyFieldEdit(engineState, field, value)
    setEngineState(state)
    setTranscript((t) => [
      ...t,
      { type: 'input', text: `edit ${field} "${value}"` },
      { type: 'output', text: output },
    ])
  }

  const headTip = engineState.branches[engineState.head]
  const snapshot = { ...engineState.commits[headTip].snapshot, ...engineState.pendingEdits }

  return (
    <div id="git-sandbox" className="scroll-mt-24 rounded-2xl bg-surface-light p-5 ring-1 ring-white/10">
      <div className="mb-4">
        <h2 className="text-lg font-bold">🧪 Sandbox Interativo de Git</h2>
        <p className="text-sm text-slate-400">
          Cenário atual: <span className="font-semibold text-indigo-300">{scenario.label}</span> —{' '}
          {scenario.description}
        </p>
      </div>

      <div className="mb-4">
        <FileEditor snapshot={snapshot} dirty={engineState.dirty} onSave={handleEditField} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-96">
          <GitTerminal transcript={transcript} onRun={handleRun} />
        </div>
        <div className="h-96">
          <CommandReference />
        </div>
        <div className="h-96">
          <GitGraph state={engineState} />
        </div>
      </div>
    </div>
  )
})

export default GitSandbox
