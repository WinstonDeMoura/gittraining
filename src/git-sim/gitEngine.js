// Motor de um Git "simulado": modela apenas o grafo de commits/branches e um
// pequeno conjunto de campos editáveis (para poder gerar conflitos reais de
// 3-way merge), sem tocar em nenhum arquivo de verdade. Cada função é pura:
// recebe um estado e retorna um novo estado + o texto de saída do comando.

const BRANCH_COLORS = [
  '#818cf8', // indigo
  '#34d399', // emerald
  '#fb923c', // orange
  '#f472b6', // pink
  '#38bdf8', // sky
  '#facc15', // yellow
]

function tokenize(input) {
  const tokens = []
  const re = /[^\s"']+|"([^"]*)"|'([^']*)'/g
  let m
  while ((m = re.exec(input))) {
    tokens.push(m[1] ?? m[2] ?? m[0])
  }
  return tokens
}

function shortId(id) {
  return id.slice(0, 7)
}

function cloneState(state) {
  return {
    ...state,
    commits: { ...state.commits },
    branches: { ...state.branches },
    remoteBranches: { ...state.remoteBranches },
    remoteFeed: Object.fromEntries(
      Object.entries(state.remoteFeed).map(([k, v]) => [k, [...v]]),
    ),
    pendingEdits: { ...state.pendingEdits },
    stash: [...state.stash],
    conflict: state.conflict
      ? { ...state.conflict, resolved: { ...state.conflict.resolved } }
      : null,
    branchColors: { ...state.branchColors },
  }
}

function nextCommitId(state) {
  return (state.seq + 1).toString(36).padStart(7, '0')
}

function makeCommit(state, { parents, message, snapshot, branchColor }) {
  const id = nextCommitId(state)
  state.seq += 1
  state.commits[id] = { id, parents, message, snapshot, seq: state.seq, branchColor }
  return id
}

export function createInitialState() {
  const state = {
    commits: {},
    branches: {},
    remoteBranches: {},
    remoteFeed: {},
    head: 'main',
    pendingEdits: {},
    dirty: false,
    stash: [],
    conflict: null,
    seq: 0,
    branchColors: { main: BRANCH_COLORS[0] },
  }
  const rootId = makeCommit(state, {
    parents: [],
    message: 'Estado inicial do projeto',
    snapshot: {
      status: 'Sprint 3 — Em andamento',
      quote: 'A melhor forma de aprender Git é errando em ambiente seguro.',
      changelog: 'v1.0.0 lançado.',
    },
  })
  state.branches.main = rootId
  state.remoteBranches.main = rootId
  return state
}

function currentSnapshot(state) {
  const tip = state.branches[state.head]
  return state.commits[tip].snapshot
}

function branchColorFor(state, name) {
  if (state.branchColors[name]) return state.branchColors[name]
  const used = Object.values(state.branchColors).length
  const color = BRANCH_COLORS[used % BRANCH_COLORS.length]
  state.branchColors[name] = color
  return color
}

// Compara 3 snapshots (base, a, b) e retorna { merged, conflictKeys }
function threeWayMerge(base, a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const merged = {}
  const conflictKeys = []
  for (const key of keys) {
    const baseVal = base[key]
    const aVal = a[key]
    const bVal = b[key]
    const aChanged = aVal !== baseVal
    const bChanged = bVal !== baseVal
    if (aChanged && bChanged && aVal !== bVal) {
      conflictKeys.push(key)
      merged[key] = aVal // valor provisório até ser resolvido
    } else if (bChanged) {
      merged[key] = bVal
    } else {
      merged[key] = aVal
    }
  }
  return { merged, conflictKeys }
}

function ancestors(commits, id) {
  const seen = new Set()
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()
    if (seen.has(cur)) continue
    seen.add(cur)
    const c = commits[cur]
    if (c) stack.push(...c.parents)
  }
  return seen
}

function findMergeBase(commits, a, b) {
  if (a === b) return a
  const ancA = ancestors(commits, a)
  const queue = [b]
  const seen = new Set()
  while (queue.length) {
    const cur = queue.shift()
    if (seen.has(cur)) continue
    seen.add(cur)
    if (ancA.has(cur)) return cur
    const c = commits[cur]
    if (c) queue.push(...c.parents)
  }
  return null
}

function isAncestor(commits, maybeAncestor, id) {
  return ancestors(commits, id).has(maybeAncestor)
}

function requireCleanState(state) {
  if (state.conflict) {
    return 'Existe um conflito em aberto. Resolva com "resolve <campo> <ours|theirs|valor>" e finalize antes de continuar.'
  }
  if (state.dirty) {
    return 'Você tem alterações não commitadas. Faça "git commit" ou "git stash push" antes de continuar.'
  }
  return null
}

function fmtSnapshotBlock(label, snapshot, keys) {
  return keys.map((k) => `  ${label}.${k} = ${snapshot[k]}`).join('\n')
}

function conflictOutput(conflict) {
  const lines = [`⚠️  CONFLITO em: ${conflict.keys.join(', ')}\n`]
  for (const key of conflict.keys) {
    lines.push(
      `<<<<<<< ${conflict.sideA.label}\n${key}: ${conflict.sideA.snapshot[key]}\n=======\n${key}: ${conflict.sideB.snapshot[key]}\n>>>>>>> ${conflict.sideB.label}`,
    )
  }
  lines.push(
    '\nResolva cada campo com: resolve <campo> ours|theirs|"valor customizado"',
  )
  return lines.join('\n')
}

function finalizeIfResolved(state) {
  const c = state.conflict
  if (!c) return null
  if (c.keys.some((k) => !(k in c.resolved))) return null // ainda falta resolver algo

  const finalSnapshot = { ...c.mergedSnapshot, ...c.resolved }

  if (c.kind === 'merge' || c.kind === 'pull') {
    const newId = makeCommit(state, {
      parents: [c.headBefore, c.otherCommitId],
      message: c.message,
      snapshot: finalSnapshot,
    })
    state.branches[state.head] = newId
    state.conflict = null
    return `Merge concluído. Novo commit de merge: ${shortId(newId)}`
  }

  if (c.kind === 'cherry-pick') {
    const newId = makeCommit(state, {
      parents: [c.headBefore],
      message: `${c.message} (cherry-pick)`,
      snapshot: finalSnapshot,
    })
    state.branches[state.head] = newId
    state.conflict = null
    return `Cherry-pick concluído. Novo commit: ${shortId(newId)}`
  }

  if (c.kind === 'rebase') {
    const newId = makeCommit(state, {
      parents: [c.replayTip],
      message: c.message,
      snapshot: finalSnapshot,
    })
    return continueRebase(state, { ...c, replayTip: newId })
  }

  return null
}

function continueRebase(state, rebaseInfo) {
  const { queue, replayTip, originalBranch } = rebaseInfo
  if (queue.length === 0) {
    state.branches[originalBranch] = replayTip
    state.conflict = null
    return `Rebase concluído. "${originalBranch}" agora aponta para ${shortId(replayTip)}.`
  }

  const [next, ...rest] = queue
  const originalParent = state.commits[next.parents[0]]
  const baseSnapshot = originalParent ? originalParent.snapshot : {}
  const tipSnapshot = state.commits[replayTip].snapshot
  const { merged, conflictKeys } = threeWayMerge(baseSnapshot, tipSnapshot, next.snapshot)

  if (conflictKeys.length > 0) {
    state.conflict = {
      kind: 'rebase',
      keys: conflictKeys,
      sideA: { label: 'branch de destino', snapshot: tipSnapshot },
      sideB: { label: `commit ${shortId(next.id)}`, snapshot: next.snapshot },
      mergedSnapshot: merged,
      resolved: {},
      message: next.message,
      replayTip,
      queue: rest,
      originalBranch,
    }
    return conflictOutput(state.conflict)
  }

  const newId = makeCommit(state, {
    parents: [replayTip],
    message: next.message,
    snapshot: merged,
  })
  return continueRebase(state, { ...rebaseInfo, queue: rest, replayTip: newId })
}

function doMerge(state, targetBranchName, { kind = 'merge', asPull = false } = {}) {
  const targetTip = asPull
    ? state.remoteBranches[targetBranchName]
    : state.branches[targetBranchName]
  if (!targetTip) return `branch/ref "${targetBranchName}" não encontrada.`

  const headTip = state.branches[state.head]
  if (isAncestor(state.commits, targetTip, headTip)) {
    return `Já está atualizado — "${targetBranchName}" já está contido em "${state.head}".`
  }
  if (isAncestor(state.commits, headTip, targetTip)) {
    state.branches[state.head] = targetTip
    return `Fast-forward: "${state.head}" agora aponta para ${shortId(targetTip)}.`
  }

  const base = findMergeBase(state.commits, headTip, targetTip)
  const baseSnapshot = base ? state.commits[base].snapshot : {}
  const headSnapshot = state.commits[headTip].snapshot
  const targetSnapshot = state.commits[targetTip].snapshot
  const { merged, conflictKeys } = threeWayMerge(baseSnapshot, headSnapshot, targetSnapshot)

  const message = `Merge branch '${targetBranchName}' into ${state.head}`

  if (conflictKeys.length > 0) {
    state.conflict = {
      kind,
      keys: conflictKeys,
      sideA: { label: state.head, snapshot: headSnapshot },
      sideB: { label: targetBranchName, snapshot: targetSnapshot },
      mergedSnapshot: merged,
      resolved: {},
      message,
      headBefore: headTip,
      otherCommitId: targetTip,
    }
    return conflictOutput(state.conflict)
  }

  const newId = makeCommit(state, { parents: [headTip, targetTip], message, snapshot: merged })
  state.branches[state.head] = newId
  return `Merge concluído sem conflitos. Novo commit: ${shortId(newId)}`
}

function doFetch(state) {
  const branches = Object.keys(state.remoteFeed)
  let any = false
  const lines = []
  for (const name of branches) {
    const feed = state.remoteFeed[name]
    if (!feed.length) continue
    any = true
    let tip = state.remoteBranches[name] ?? state.branches[name]
    for (const entry of feed) {
      const parentSnapshot = state.commits[tip].snapshot
      tip = makeCommit(state, {
        parents: [tip],
        message: entry.message,
        snapshot: { ...parentSnapshot, ...entry.edits },
      })
    }
    state.remoteBranches[name] = tip
    state.remoteFeed[name] = []
    lines.push(`  origin/${name} avançou para ${shortId(tip)}`)
  }
  if (!any) return 'Já sincronizado — nada de novo em nenhuma branch remota.'
  return `Buscando alterações...\n${lines.join('\n')}`
}

export function runCommand(rawInput, prevState) {
  const input = rawInput.trim()
  if (!input) return { state: prevState, output: '', isError: false }

  const state = cloneState(prevState)
  const tokens = tokenize(input)
  const [cmd, ...rest] = tokens

  const ok = (output) => ({ state, output, isError: false })
  const err = (output) => ({ state: prevState, output, isError: true })

  try {
    if (cmd === 'help') {
      return ok(
        [
          'Comandos disponíveis:',
          '  edit <campo> <valor>            (simula uma alteração no "arquivo")',
          '  git status | git log',
          '  git branch [nome] | git branch -d <nome>',
          '  git checkout [-b] <nome>',
          '  git commit -m "mensagem"',
          '  git merge <branch>',
          '  git rebase <branch> | git rebase --continue | --abort',
          '  git cherry-pick <id> | --continue | --abort',
          '  git revert <id>',
          '  git reset --hard <ref>',
          '  git stash [push|pop|list]',
          '  git fetch | git pull [<branch>]',
          '  git push [-u origin <branch>] [--force-with-lease]',
          '  resolve <campo> ours|theirs|"valor"',
          '  clear',
        ].join('\n'),
      )
    }

    if (cmd === 'edit') {
      const [key, ...valueParts] = rest
      if (!key || valueParts.length === 0) return err('uso: edit <campo> <valor>')
      state.pendingEdits[key] = valueParts.join(' ')
      state.dirty = true
      return ok(`Diretório de trabalho alterado: ${key} = "${valueParts.join(' ')}"`)
    }

    if (cmd === 'resolve') {
      const [key, ...valueParts] = rest
      if (!state.conflict) return err('não há conflito em aberto.')
      if (!key || valueParts.length === 0) return err('uso: resolve <campo> ours|theirs|"valor"')
      if (!state.conflict.keys.includes(key)) return err(`"${key}" não está em conflito.`)
      const choice = valueParts.join(' ')
      let value
      if (choice === 'ours') value = state.conflict.sideA.snapshot[key]
      else if (choice === 'theirs') value = state.conflict.sideB.snapshot[key]
      else value = choice
      state.conflict.resolved[key] = value
      const pending = state.conflict.keys.filter((k) => !(k in state.conflict.resolved))
      if (pending.length === 0) {
        return ok(
          `"${key}" resolvido como "${value}".\nTodos os campos resolvidos — finalize com git commit / git rebase --continue / git cherry-pick --continue.`,
        )
      }
      return ok(`"${key}" resolvido como "${value}". Faltam: ${pending.join(', ')}`)
    }

    if (cmd !== 'git') return err(`comando não reconhecido: "${cmd}" (digite "help")`)

    const sub = rest[0]
    const args = rest.slice(1)

    if (sub === 'status') {
      const parts = [`Na branch ${state.head}`]
      parts.push(state.dirty ? 'Alterações não commitadas presentes.' : 'Nada para commitar, diretório limpo.')
      if (state.stash.length) parts.push(`${state.stash.length} entrada(s) no stash.`)
      if (state.conflict) parts.push(`Conflito em aberto: ${state.conflict.keys.join(', ')}`)
      return ok(parts.join('\n'))
    }

    if (sub === 'log') {
      const lines = []
      let cur = state.branches[state.head]
      const seen = new Set()
      while (cur && !seen.has(cur)) {
        seen.add(cur)
        const c = state.commits[cur]
        lines.push(`* ${shortId(c.id)} ${c.message}`)
        cur = c.parents[0]
      }
      return ok(lines.join('\n'))
    }

    if (sub === 'branch') {
      if (args[0] === '-d') {
        const name = args[1]
        if (!name) return err('uso: git branch -d <nome>')
        if (name === state.head) return err('não é possível apagar a branch atual.')
        if (!state.branches[name]) return err(`branch "${name}" não existe.`)
        delete state.branches[name]
        return ok(`branch "${name}" apagada.`)
      }
      if (!args[0]) {
        return ok(
          Object.keys(state.branches)
            .map((b) => (b === state.head ? `* ${b}` : `  ${b}`))
            .join('\n'),
        )
      }
      const name = args[0]
      if (state.branches[name]) return err(`branch "${name}" já existe.`)
      state.branches[name] = state.branches[state.head]
      branchColorFor(state, name)
      return ok(`branch "${name}" criada em ${shortId(state.branches[name])}.`)
    }

    if (sub === 'checkout') {
      const creating = args[0] === '-b'
      const name = creating ? args[1] : args[0]
      if (!name) return err('uso: git checkout [-b] <nome>')
      if (state.conflict) {
        return err('error: existe um conflito em aberto. Resolva ou aborte antes de trocar de branch.')
      }
      if (creating) {
        if (state.branches[name]) return err(`branch "${name}" já existe.`)
        state.branches[name] = state.branches[state.head]
        branchColorFor(state, name)
      } else {
        if (!state.branches[name]) return err(`branch "${name}" não existe.`)
        if (state.dirty) {
          return err(
            'error: você tem alterações não commitadas que seriam sobrescritas ao trocar para uma branch existente. Faça commit ou "git stash push" antes.',
          )
        }
      }
      state.head = name
      return ok(`Trocado para a branch "${name}".`)
    }

    if (sub === 'commit') {
      if (state.conflict) {
        const msg = finalizeIfResolved(state)
        if (!msg) return err('ainda há campos em conflito não resolvidos.')
        return ok(msg)
      }
      const mIdx = args.indexOf('-m')
      const message = mIdx >= 0 ? args.slice(mIdx + 1).join(' ') : 'commit sem mensagem'
      if (!state.dirty) return err('nada para commitar — use "edit <campo> <valor>" primeiro.')
      const parentId = state.branches[state.head]
      const newSnapshot = { ...state.commits[parentId].snapshot, ...state.pendingEdits }
      const newId = makeCommit(state, { parents: [parentId], message, snapshot: newSnapshot })
      state.branches[state.head] = newId
      state.pendingEdits = {}
      state.dirty = false
      return ok(`[${state.head} ${shortId(newId)}] ${message}`)
    }

    if (sub === 'merge') {
      if (args[0] === '--abort') {
        if (!state.conflict) return err('não há merge em andamento.')
        state.conflict = null
        return ok('Merge abortado.')
      }
      const blocked = requireCleanState(state)
      if (blocked) return err(blocked)
      const name = args[0]
      if (!name) return err('uso: git merge <branch>')
      if (!state.branches[name]) return err(`branch "${name}" não existe.`)
      return ok(doMerge(state, name))
    }

    if (sub === 'rebase') {
      if (args[0] === '--abort') {
        if (!state.conflict) return err('não há rebase em andamento.')
        state.conflict = null
        return ok('Rebase abortado.')
      }
      if (args[0] === '--continue') {
        if (!state.conflict || state.conflict.kind !== 'rebase') return err('não há rebase em andamento.')
        const msg = finalizeIfResolved(state)
        if (!msg) return err('ainda há campos em conflito não resolvidos.')
        return ok(msg)
      }
      const blocked = requireCleanState(state)
      if (blocked) return err(blocked)
      const name = args[0]
      if (!name) return err('uso: git rebase <branch>')
      const targetTip = state.branches[name]
      if (!targetTip) return err(`branch "${name}" não existe.`)

      const headTip = state.branches[state.head]
      if (isAncestor(state.commits, targetTip, headTip)) {
        return ok(`Já está atualizado em relação a "${name}".`)
      }
      const base = findMergeBase(state.commits, headTip, targetTip) ?? targetTip
      const toReplay = []
      let cur = headTip
      while (cur && cur !== base) {
        toReplay.unshift(state.commits[cur])
        cur = state.commits[cur].parents[0]
      }
      const result = continueRebase(state, {
        queue: toReplay,
        replayTip: targetTip,
        originalBranch: state.head,
      })
      return ok(result)
    }

    if (sub === 'cherry-pick') {
      if (args[0] === '--abort') {
        if (!state.conflict) return err('não há cherry-pick em andamento.')
        state.conflict = null
        return ok('Cherry-pick abortado.')
      }
      if (args[0] === '--continue') {
        if (!state.conflict || state.conflict.kind !== 'cherry-pick') return err('não há cherry-pick em andamento.')
        const msg = finalizeIfResolved(state)
        if (!msg) return err('ainda há campos em conflito não resolvidos.')
        return ok(msg)
      }
      const blocked = requireCleanState(state)
      if (blocked) return err(blocked)
      const idPrefix = args[0]
      if (!idPrefix) return err('uso: git cherry-pick <id-do-commit>')
      const target = Object.values(state.commits).find((c) => c.id.startsWith(idPrefix))
      if (!target) return err(`commit "${idPrefix}" não encontrado.`)
      const parent = state.commits[target.parents[0]] ?? { snapshot: {} }
      const headTip = state.branches[state.head]
      const headSnapshot = state.commits[headTip].snapshot
      const { merged, conflictKeys } = threeWayMerge(parent.snapshot, headSnapshot, target.snapshot)
      if (conflictKeys.length > 0) {
        state.conflict = {
          kind: 'cherry-pick',
          keys: conflictKeys,
          sideA: { label: state.head, snapshot: headSnapshot },
          sideB: { label: `commit ${shortId(target.id)}`, snapshot: target.snapshot },
          mergedSnapshot: merged,
          resolved: {},
          message: target.message,
          headBefore: headTip,
        }
        return ok(conflictOutput(state.conflict))
      }
      const newId = makeCommit(state, {
        parents: [headTip],
        message: `${target.message} (cherry-pick)`,
        snapshot: merged,
      })
      state.branches[state.head] = newId
      return ok(`Cherry-pick aplicado. Novo commit: ${shortId(newId)}`)
    }

    if (sub === 'revert') {
      const blocked = requireCleanState(state)
      if (blocked) return err(blocked)
      const idPrefix = args[0]
      if (!idPrefix) return err('uso: git revert <id-do-commit>')
      const target = Object.values(state.commits).find((c) => c.id.startsWith(idPrefix))
      if (!target) return err(`commit "${idPrefix}" não encontrado.`)
      const parent = state.commits[target.parents[0]] ?? { snapshot: {} }
      const headTip = state.branches[state.head]
      const headSnapshot = state.commits[headTip].snapshot
      const rollback = {}
      for (const key of Object.keys(target.snapshot)) {
        if (target.snapshot[key] !== parent.snapshot[key]) rollback[key] = parent.snapshot[key]
      }
      const newSnapshot = { ...headSnapshot, ...rollback }
      const newId = makeCommit(state, {
        parents: [headTip],
        message: `Revert "${target.message}"`,
        snapshot: newSnapshot,
      })
      state.branches[state.head] = newId
      return ok(`Revert criado como novo commit: ${shortId(newId)} (histórico original preservado).`)
    }

    if (sub === 'reset') {
      if (args[0] !== '--hard') return err('uso: git reset --hard <ref>')
      const ref = args[1]
      if (!ref) return err('uso: git reset --hard <ref>')
      const targetId = state.branches[ref] ?? Object.values(state.commits).find((c) => c.id.startsWith(ref))?.id
      if (!targetId) return err(`ref "${ref}" não encontrada.`)
      state.branches[state.head] = targetId
      state.pendingEdits = {}
      state.dirty = false
      state.conflict = null
      return ok(`HEAD e "${state.head}" agora apontam para ${shortId(targetId)}. Alterações locais descartadas.`)
    }

    if (sub === 'stash') {
      const action = args[0] ?? 'push'
      if (action === 'push') {
        if (!state.dirty) return err('nada para guardar no stash.')
        const mIdx = args.indexOf('-m')
        const label = mIdx >= 0 ? args.slice(mIdx + 1).join(' ') : 'WIP'
        state.stash.push({ edits: state.pendingEdits, label })
        state.pendingEdits = {}
        state.dirty = false
        return ok(`Guardado no stash: stash@{${state.stash.length - 1}}: ${label}`)
      }
      if (action === 'pop') {
        if (!state.stash.length) return err('stash vazio.')
        const entry = state.stash.pop()
        state.pendingEdits = entry.edits
        state.dirty = true
        return ok(`Restaurado do stash: ${entry.label}`)
      }
      if (action === 'list') {
        if (!state.stash.length) return ok('stash vazio.')
        return ok(state.stash.map((s, i) => `stash@{${i}}: ${s.label}`).join('\n'))
      }
      return err('uso: git stash [push|pop|list]')
    }

    if (sub === 'fetch') {
      return ok(doFetch(state))
    }

    if (sub === 'pull') {
      const fetchMsg = doFetch(state)
      const name = args[0] === 'origin' ? args[1] ?? state.head : args[0] ?? state.head
      const blocked = requireCleanState(state)
      if (blocked) return { state, output: `${fetchMsg}\n${blocked}`, isError: true }
      if (!state.remoteBranches[name]) {
        return { state, output: `${fetchMsg}\nnão existe origin/${name}.`, isError: true }
      }
      const mergeMsg = doMerge(state, name, { kind: 'pull', asPull: true })
      return ok(`${fetchMsg}\n${mergeMsg}`)
    }

    if (sub === 'add') {
      return ok('Alterações adicionadas à área de stage (simulado — não é necessário neste sandbox).')
    }

    if (sub === 'push') {
      const blocked = requireCleanState(state)
      if (blocked) return err(blocked)
      const force = args.includes('--force') || args.includes('--force-with-lease')
      const positional = args.filter((a) => a !== 'origin' && a !== '-u' && !a.startsWith('--'))
      const name = positional[0] ?? state.head
      const localTip = state.branches[name]
      if (!localTip) return err(`branch "${name}" não existe localmente.`)
      const remoteTip = state.remoteBranches[name]
      if (remoteTip && !force && !isAncestor(state.commits, remoteTip, localTip)) {
        return err(
          `rejected: origin/${name} tem commits que você ainda não tem localmente. Rode "git fetch" e "git merge"/"git rebase" antes de enviar (ou use --force-with-lease se reescreveu o histórico).`,
        )
      }
      state.remoteBranches[name] = localTip
      return ok(`Enviado: origin/${name} agora aponta para ${shortId(localTip)}.`)
    }

    return err(`comando "git ${sub}" não reconhecido (digite "help")`)
  } catch (e) {
    return err(`erro inesperado: ${e.message}`)
  }
}

// Mesmo efeito do comando "edit <campo> <valor>", mas chamado direto por um
// formulário da interface (sem passar por tokenização de string).
export function applyFieldEdit(prevState, key, value) {
  const state = cloneState(prevState)
  state.pendingEdits[key] = value
  state.dirty = true
  return { state, output: `Diretório de trabalho alterado: ${key} = "${value}"`, isError: false }
}

export function seedRemoteFeed(state, branch, entries) {
  return {
    ...state,
    remoteFeed: { ...state.remoteFeed, [branch]: entries },
  }
}
