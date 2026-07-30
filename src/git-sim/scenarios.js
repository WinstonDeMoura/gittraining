import { createInitialState, runCommand, seedRemoteFeed } from './gitEngine.js'

function applyCommands(state, commands) {
  let current = state
  for (const cmd of commands) {
    current = runCommand(cmd, current).state
  }
  return current
}

function buildScenario(commands, remoteFeed) {
  let state = createInitialState()
  if (remoteFeed) {
    for (const [branch, entries] of Object.entries(remoteFeed)) {
      state = seedRemoteFeed(state, branch, entries)
    }
  }
  return applyCommands(state, commands)
}

export const scenarios = [
  {
    id: 'default',
    label: 'Sandbox livre',
    exercise: null,
    description: 'Estado inicial limpo — explore os comandos livremente.',
    build: () => buildScenario([]),
  },
  {
    id: 'ex1',
    label: 'Exercício 1 — Commit & Push',
    exercise: 1,
    description: 'Crie sua branch, edite um campo e faça commit.',
    build: () => buildScenario([]),
  },
  {
    id: 'ex2',
    label: 'Exercício 2 — Conflitos & Merge',
    exercise: 2,
    description:
      'Sua branch e a main mudaram o mesmo campo. Rode "git merge main" e resolva o conflito.',
    build: () =>
      buildScenario([
        'git checkout -b sua-branch',
        'edit quote "Feito é melhor que perfeito."',
        'git commit -m "sua-branch: atualiza frase do dia"',
        'git checkout main',
        'edit quote "Qualidade nunca é acidental."',
        'git commit -m "main: colega atualiza frase do dia"',
        'git checkout sua-branch',
      ]),
  },
  {
    id: 'ex3',
    label: 'Exercício 3 — Stash & Pop',
    exercise: 3,
    description:
      'Rode "edit status ..." e depois tente "git checkout main" — vai bloquear até você usar stash.',
    build: () => buildScenario(['git checkout -b feature/layout']),
  },
  {
    id: 'ex4',
    label: 'Exercício 4 — Rebase vs Merge',
    exercise: 4,
    description:
      'A main recebeu commits novos enquanto você trabalhava. Atualize com merge ou rebase.',
    build: () =>
      buildScenario([
        'git checkout -b sua-branch',
        'edit status "Sprint 3 — Card em revisão"',
        'git commit -m "sua-branch: atualiza status do card"',
        'git checkout main',
        'edit changelog "v1.1.0: corrige bug no login."',
        'git commit -m "main: changelog v1.1.0"',
        'edit changelog "v1.2.0: melhora performance."',
        'git commit -m "main: changelog v1.2.0"',
        'git checkout sua-branch',
      ]),
  },
  {
    id: 'ex5',
    label: 'Exercício 5 — Fetch vs Pull',
    exercise: 5,
    description:
      'Rode "git fetch" e compare "git log" local com origin/main antes de aplicar com merge/pull.',
    build: () =>
      buildScenario([], {
        main: [
          { message: 'colega: adiciona changelog v1.1.0', edits: { changelog: 'v1.1.0: novo dashboard.' } },
          { message: 'colega: adiciona changelog v1.2.0', edits: { changelog: 'v1.2.0: correções de acessibilidade.' } },
        ],
      }),
  },
  {
    id: 'ex6',
    label: 'Exercício 6 — Cherry-pick / Revert',
    exercise: 6,
    description:
      'Pegue o commit da branch "outra-feature" com cherry-pick, e desfaça o commit ruim da main com revert.',
    build: () =>
      buildScenario([
        'git checkout -b outra-feature',
        'edit status "Sprint 3 — Hotfix de acessibilidade aplicado"',
        'git commit -m "outra-feature: hotfix de acessibilidade"',
        'git checkout main',
        'edit changelog "v1.1.0: experimento quebrado, reverter depois."',
        'git commit -m "main: commit ruim (v1.1.0 quebrado)"',
      ]),
  },
]

export function getScenario(id) {
  return scenarios.find((s) => s.id === id) ?? scenarios[0]
}
