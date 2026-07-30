import { useState } from 'react'

const exercises = [
  {
    id: 'default',
    number: null,
    title: 'Sandbox livre',
    subtitle: 'Explore os comandos por conta própria, sem roteiro.',
    steps: [],
  },
  {
    id: 'ex1',
    number: 1,
    title: 'Exercício 1 — Commit & Push',
    subtitle: 'Adicione uma entrada sua no projeto',
    steps: [
      'Crie uma branch a partir da main: git checkout -b feature/minha-entrada',
      'Abra src/data/sandboxProject.js e adicione um item seu no changelog, seguindo o exemplo em comentário.',
      'Salve, revise as mudanças com git status e git diff.',
      'git add src/data/sandboxProject.js',
      'git commit -m "feat: adiciona entrada de [seu nome] no changelog"',
      'git push -u origin feature/minha-entrada',
      'Abra um Pull Request no GitHub para a branch main.',
    ],
  },
  {
    id: 'ex2',
    number: 2,
    title: 'Exercício 2 — Conflitos & Merge',
    subtitle: 'Dois alunos editando a mesma linha',
    steps: [
      'Combine com um colega: ambos vão editar a MESMA linha do sandboxProject.js (ex: o campo "quote").',
      'Cada um cria sua própria branch e faz um commit diferente na mesma linha.',
      'O primeiro faz merge/PR normalmente para a main.',
      'O segundo tenta atualizar sua branch: git fetch origin && git merge origin/main',
      'Git vai marcar o conflito no arquivo com:',
      '<<<<<<< HEAD\\n(sua versão)\\n=======\\n(versão da main)\\n>>>>>>> origin/main',
      'Edite o arquivo manualmente, decidindo o que manter, e remova as marcações <<<<<<<, ======= e >>>>>>>.',
      'git add src/data/sandboxProject.js',
      'git commit (finaliza o merge)',
      'git push',
    ],
  },
  {
    id: 'ex3',
    number: 3,
    title: 'Exercício 3 — Stash & Pop',
    subtitle: 'Alteração urgente no meio de uma tarefa',
    steps: [
      'Comece uma alteração qualquer (ex: mexendo em algum componente) e NÃO finalize o commit.',
      'Simule um pedido urgente: você precisa mudar de branch para corrigir algo no layout do Header.',
      'Guarde seu trabalho em progresso: git stash push -m "wip: ajuste em andamento"',
      'Troque de branch, faça a correção urgente, commit e push normalmente.',
      'Volte para sua branch original: git checkout feature/minha-entrada',
      'Recupere o trabalho guardado: git stash pop',
      'Confira a lista de stashes a qualquer momento com git stash list',
    ],
  },
  {
    id: 'ex4',
    number: 4,
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
    id: 'ex5',
    number: 5,
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
    id: 'ex6',
    number: 6,
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

export default function ExerciseGuide({ onPractice }) {
  const [selectedId, setSelectedId] = useState('default')
  const selected = exercises.find((e) => e.id === selectedId) ?? exercises[0]

  function handleSelect(exercise) {
    setSelectedId(exercise.id)
    onPractice?.(exercise.id)
  }

  return (
    <section className="rounded-2xl bg-surface-light p-5 ring-1 ring-white/10">
      <h2 className="mb-3 text-lg font-bold">📖 Exercícios</h2>

      <div className="flex flex-wrap gap-2">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => handleSelect(exercise)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedId === exercise.id
                ? 'bg-indigo-600 text-white'
                : 'bg-surface text-slate-300 ring-1 ring-white/10 hover:bg-white/10'
            }`}
          >
            {exercise.number ? `${exercise.number}. ${exercise.title.split('—')[1].trim()}` : '🧪 Sandbox livre'}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-surface p-4 ring-1 ring-white/10">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-indigo-400">{selected.title}</h3>
        </div>
        <p className="mb-3 text-sm text-slate-400">{selected.subtitle}</p>

        {selected.steps.length > 0 ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            {selected.steps.map((step, i) => (
              <li key={i}>
                <code className="block whitespace-pre-wrap rounded bg-black/40 px-1.5 py-0.5 text-xs leading-relaxed text-emerald-300">
                  {step}
                </code>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">
            O cenário livre já foi carregado no sandbox abaixo — digite comandos e use a lista de
            comandos disponíveis ao lado do terminal como referência.
          </p>
        )}
      </div>
    </section>
  )
}
