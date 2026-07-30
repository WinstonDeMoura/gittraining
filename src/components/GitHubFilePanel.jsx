import { useCallback, useEffect, useState } from 'react'
import {
  githubRepo,
  githubCommitsApiUrl,
  githubRawUrl,
  githubFileUrl,
} from '../config/githubRepo.js'

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `há ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.round(hours / 24)
  return `há ${days}d`
}

async function fetchLatestCommit() {
  const res = await fetch(githubCommitsApiUrl(githubRepo))
  if (!res.ok) throw new Error(`GitHub API respondeu ${res.status}`)
  const data = await res.json()
  const commit = data[0]
  if (!commit) throw new Error('nenhum commit encontrado para esse arquivo.')
  return {
    sha: commit.sha,
    message: commit.commit.message.split('\n')[0],
    author: commit.commit.author?.name ?? 'desconhecido',
    date: commit.commit.author?.date,
  }
}

async function fetchRawContent() {
  const res = await fetch(githubRawUrl(githubRepo))
  if (!res.ok) throw new Error(`Não foi possível baixar o arquivo (${res.status})`)
  return res.text()
}

export default function GitHubFilePanel() {
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState(null)
  const [meta, setMeta] = useState(null)
  const [syncedMeta, setSyncedMeta] = useState(null)
  const [content, setContent] = useState(null)
  const [checking, setChecking] = useState(false)
  const [pulling, setPulling] = useState(false)

  const loadInitial = useCallback(async () => {
    setStatus('loading')
    setErrorMsg(null)
    try {
      const [latestMeta, latestContent] = await Promise.all([fetchLatestCommit(), fetchRawContent()])
      setMeta(latestMeta)
      setSyncedMeta(latestMeta)
      setContent(latestContent)
      setStatus('ready')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e.message)
    }
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  async function handleCheck() {
    setChecking(true)
    setErrorMsg(null)
    try {
      const latestMeta = await fetchLatestCommit()
      setMeta(latestMeta)
      setStatus('ready')
    } catch (e) {
      setErrorMsg(e.message)
    } finally {
      setChecking(false)
    }
  }

  async function handlePull() {
    setPulling(true)
    setErrorMsg(null)
    try {
      const latestContent = await fetchRawContent()
      setContent(latestContent)
      setSyncedMeta(meta)
      setStatus('ready')
    } catch (e) {
      setErrorMsg(e.message)
    } finally {
      setPulling(false)
    }
  }

  const isBehind = meta && syncedMeta && meta.sha !== syncedMeta.sha

  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-white/10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-indigo-400">☁️ origin/main — ao vivo do GitHub</h3>
          <p className="text-xs text-slate-500">{githubRepo.path}</p>
        </div>
        <a
          href={githubFileUrl(githubRepo)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
        >
          Ver no GitHub ↗
        </a>
      </div>

      {status === 'loading' && (
        <p className="text-sm text-slate-400">Carregando estado atual do repositório...</p>
      )}

      {status === 'error' && (
        <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300 ring-1 ring-rose-500/30">
          <p>⚠️ Não foi possível conectar ao GitHub agora ({errorMsg}).</p>
          <button
            onClick={loadInitial}
            className="mt-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold ring-1 ring-rose-500/30 hover:bg-rose-500/25"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          {isBehind ? (
            <div className="mb-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300 ring-1 ring-amber-500/30">
              <p>
                ⚠️ origin/main avançou: "{meta.message}" — {meta.author}, {relativeTime(meta.date)}.
                Sua visualização está desatualizada.
              </p>
              <button
                onClick={handlePull}
                disabled={pulling}
                className="mt-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold ring-1 ring-amber-500/30 hover:bg-amber-500/25 disabled:opacity-50"
              >
                {pulling ? 'Sincronizando...' : '⬇️ git pull (sincronizar)'}
              </button>
            </div>
          ) : (
            <div className="mb-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300 ring-1 ring-emerald-500/30">
              ✅ Sincronizado — último commit: "{syncedMeta.message}" ({syncedMeta.author},{' '}
              {relativeTime(syncedMeta.date)}).
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={checking}
            className="mb-3 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50"
          >
            {checking ? 'Verificando...' : '🔄 git fetch (verificar atualizações)'}
          </button>

          <pre className="max-h-64 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-xs leading-relaxed text-slate-300">
            {content}
          </pre>
        </>
      )}
    </div>
  )
}
