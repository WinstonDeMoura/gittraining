import { useState } from 'react'

const exercises = [
  {
    title: 'Exercício 1 — Commit & Push',
    subtitle: 'Adicione seu próprio card no mural',
    steps: [
      'Crie uma branch a partir da main: git checkout -b feature/meu-card',
      'Abra src/data/teamData.js e adicione seu objeto na "ZONA DE CONFLITO", seguindo o exemplo em comentário.',
      'Salve, revise as mudanças com git status e git diff.',
      'git add src/data/teamData.js',
      'git commit -m "feat: adiciona card de [seu nome]"',
      'git push -u origin feature/meu-card',
      'Abra um Pull Request no GitHub para a branch main.',
    ],
  },
  {
    title: 'Exercício 2 — Conflitos & Merge',
    subtitle: 'Dois alunos editando a mesma linha',
    steps: [
      'Combine com um colega: ambos vão editar a MESMA linha do teamData.js (ex: a frase do dia em projectInfo).',
      'Cada um cria sua própria branch e faz um commit diferente na mesma linha.',
      'O primeiro faz merge/PR normalmente para a main.',
      'O segundo tenta atualizar sua branch: git fetch origin && git merge origin/main',
      'Git vai marcar o conflito no arquivo com:',
      '<<<<<<< HEAD\\n(sua versão)\\n=======\\n(versão da main)\\n>>>>>>> origin/main',
      'Edite o arquivo manualmente, decidindo o que manter, e remova as marcações <<<<<<<, ======= e >>>>>>>.',
      'git add src/data/teamData.js',
      'git commit (finaliza o merge)',
      'git push',
    ],
  },
  {
    title: 'Exercício 3 — Stash & Pop',
    subtitle: 'Alteração urgente no meio de uma tarefa',
    steps: [
      'Comece uma alteração qualquer (ex: mexendo em MemberCard.jsx) e NÃO finalize o commit.',
      'Simule um pedido urgente: você precisa mudar de branch para corrigir algo no layout do Header.',
      'Guarde seu trabalho em progresso: git stash push -m "wip: ajuste no card"',
      'Troque de branch, faça a correção urgente, commit e push normalmente.',
      'Volte para sua branch original: git checkout feature/meu-card',
      'Recupere o trabalho guardado: git stash pop',
      'Confira a lista de stashes a qualquer momento com git stash list',
    ],
  },
  {
    title: 'Exercício 4 — Rebase vs Merge',
    subtitle: 'Atualizando sua branch antes do PR',
    steps: [
      'Enquanto você trabalhava, a main recebeu novos commits de outros colegas.',
      'Opção A (merge): git fetch origin && git merge origin/main — cria um commit de merge, preserva o histórico exatamente como aconteceu.',
      'Opção B (rebase): git fetch origin && git rebase origin/main — reescreve seus commits em cima da main, gerando um histórico linear.',
      'Resolva conflitos se aparecerem (igual ao Exercício 2). No rebase, use git rebase --continue após resolver cada conflito.',
      'Compare os dois históricos com git log --oneline --graph --all',
      'Envie com git push (ou git push --force-with-lease se reescreveu o histórico com rebase).',
    ],
  },
  {
    title: 'Exercício 5 — Fetch vs Pull',
    subtitle: 'Baixando alterações sem aplicar de imediato',
    steps: [
      'git fetch origin — baixa os commits novos da main, mas NÃO altera seus arquivos locais.',
      'Explore o que mudou antes de aplicar: git log HEAD..origin/main --oneline',
      'Veja as diferenças reais: git diff HEAD origin/main',
      'Só depois de revisar, aplique as mudanças com git merge origin/main (ou git rebase origin/main).',
      'Compare com git pull, que faz fetch + merge (ou fetch + rebase, se configurado) em um único comando — mais rápido, porém menos controlado.',
    ],
  },
  {
    title: 'Exercício 6 — Cherry-pick / Revert',
    subtitle: 'Resgatando ou desfazendo commits específicos',
    steps: [
      'Cherry-pick: peça a um colega o hash de um commit interessante em outra branch: git log branch-do-colega --oneline',
      'Traga só aquele commit para a sua branch: git cherry-pick <hash-do-commit>',
      'Resolva conflitos se necessário e finalize com git cherry-pick --continue',
      'Revert: para desfazer uma alteração já mesclada na main SEM apagar o histórico: git revert <hash-do-commit>',
      'Isso cria um novo commit que desfaz as mudanças, mantendo o commit original registrado.',
      'Compare com git reset, que apaga commits do histórico — evite usar em branches compartilhadas!',
    ],
  },
]

export default function ExerciseGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:bg-indigo-500 active:scale-95"
      >
        📖 Guia de Exercícios Git
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <aside className="relative flex h-full w-full max-w-lg flex-col bg-surface-light shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold">📖 Guia de Exercícios Git</h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar guia"
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {exercises.map((exercise) => (
                  <section
                    key={exercise.title}
                    className="rounded-xl bg-surface p-4 ring-1 ring-white/10"
                  >
                    <h3 className="font-semibold text-indigo-400">
                      {exercise.title}
                    </h3>
                    <p className="mb-3 text-sm text-slate-400">
                      {exercise.subtitle}
                    </p>
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                      {exercise.steps.map((step, i) => (
                        <li key={i}>
                          <code className="block whitespace-pre-wrap rounded bg-black/40 px-1.5 py-0.5 text-xs leading-relaxed text-emerald-300">
                            {step}
                          </code>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
