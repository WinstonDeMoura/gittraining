const groups = [
  {
    title: 'Arquivo de trabalho',
    commands: [
      { cmd: 'edit <campo> <valor>', desc: 'simula uma alteração no arquivo (ou clique nos campos do painel "Arquivo do projeto" acima do terminal)' },
      { cmd: 'git status', desc: 'mostra a branch atual, alterações pendentes e conflitos em aberto' },
      { cmd: 'git log', desc: 'lista o histórico de commits da branch atual' },
    ],
  },
  {
    title: 'Branches & commits',
    commands: [
      { cmd: 'git branch [nome]', desc: 'lista as branches, ou cria uma nova a partir da atual' },
      { cmd: 'git branch -d <nome>', desc: 'apaga uma branch' },
      { cmd: 'git checkout [-b] <nome>', desc: 'troca de branch (com -b, cria e já troca)' },
      { cmd: 'git commit -m "msg"', desc: 'grava as alterações pendentes como um novo commit' },
    ],
  },
  {
    title: 'Juntando históricos',
    commands: [
      { cmd: 'git merge <branch>', desc: 'junta o histórico de outra branch na atual (pode gerar conflito)' },
      { cmd: 'git rebase <branch>', desc: 'reaplica seus commits em cima de outra branch, gerando histórico linear' },
      { cmd: 'git rebase --continue | --abort', desc: 'continua ou cancela um rebase com conflito em aberto' },
      { cmd: 'git cherry-pick <id>', desc: 'traz um commit específico de outra branch para a atual' },
      { cmd: 'git revert <id>', desc: 'cria um novo commit que desfaz as mudanças de um commit antigo' },
      { cmd: 'resolve <campo> ours|theirs|"valor"', desc: 'resolve um campo em conflito durante merge/rebase/cherry-pick' },
    ],
  },
  {
    title: 'Remoto & stash',
    commands: [
      { cmd: 'git fetch', desc: 'busca novidades da branch remota, sem aplicar nada ainda' },
      { cmd: 'git pull', desc: 'busca e já aplica as novidades (fetch + merge)' },
      { cmd: 'git push [-u origin <branch>]', desc: 'envia seus commits locais para a branch remota (bloqueia se origin tiver commits que você não tem)' },
      { cmd: 'git stash [push|pop|list]', desc: 'guarda ou recupera alterações não commitadas temporariamente' },
      { cmd: 'git reset --hard <ref>', desc: 'descarta tudo e aponta a branch para outro commit (cuidado!)' },
    ],
  },
]

export default function CommandReference() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-white/10">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-200">📋 Comandos disponíveis</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>
            <ul className="space-y-1.5">
              {group.commands.map((c) => (
                <li key={c.cmd} className="text-xs leading-relaxed">
                  <code className="rounded bg-black/40 px-1.5 py-0.5 text-emerald-300">{c.cmd}</code>
                  <p className="mt-0.5 text-slate-400">{c.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
