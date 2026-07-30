import { useRef } from 'react'
import Header from './components/Header.jsx'
import GitSandbox from './components/GitSandbox.jsx'
import ExerciseGuide from './components/ExerciseGuide.jsx'
import Footer from './components/Footer.jsx'
import { projectInfo } from './data/sandboxProject.js'

export default function App() {
  const sandboxRef = useRef(null)

  function handlePractice(scenarioId) {
    sandboxRef.current?.loadScenario(scenarioId)
    document.getElementById('git-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        version={projectInfo.version}
        environment={projectInfo.environment}
        projectStatus="Simulador de Git — pratique branches, merges e conflitos em tempo real."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <ExerciseGuide onPractice={handlePractice} />
        <GitSandbox ref={sandboxRef} />
      </main>

      <Footer />
    </div>
  )
}
