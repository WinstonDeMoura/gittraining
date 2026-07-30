import Header from './components/Header.jsx'
import MemberCard from './components/MemberCard.jsx'
import ExerciseGuide from './components/ExerciseGuide.jsx'
import Footer from './components/Footer.jsx'
import { projectInfo, teamMembers } from './data/teamData.js'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        version={projectInfo.version}
        environment={projectInfo.environment}
        projectStatus={projectInfo.projectStatus}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-10 rounded-2xl bg-surface-light p-6 text-center ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-widest text-indigo-400">
            Frase do dia
          </p>
          <p className="mt-2 text-lg font-medium text-slate-200">
            “{projectInfo.quoteOfTheDay}”
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <MemberCard key={member.id} {...member} />
          ))}
        </div>
      </main>

      <Footer />
      <ExerciseGuide />
    </div>
  )
}
