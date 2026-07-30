import { useRef } from 'react'
import Header from './components/Header.jsx'
import GitSandbox from './components/GitSandbox.jsx'
import ExerciseGuide from './components/ExerciseGuide.jsx'
import Footer from './components/Footer.jsx'
import { projectInfo } from './data/sandboxProject.js'

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
        projectStatus="Simulador de Git — pratique branches, merges e conflitos em tempo real."
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-10">
        <GitSandbox ref={sandboxRef} />
      </main>

      <Footer />
      <ExerciseGuide onPractice={handlePractice} />
    </div>
  )
}
