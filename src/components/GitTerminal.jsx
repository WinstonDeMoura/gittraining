import { useEffect, useRef, useState } from 'react'

export default function GitTerminal({ transcript, onRun }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [transcript])

  function submit(e) {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return
    onRun(cmd)
    setHistory((h) => [...h, cmd])
    setHistoryIndex(null)
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const next = historyIndex + 1
      if (next >= history.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(next)
        setInput(history[next])
      }
    }
  }

  const styleFor = (type) => {
    if (type === 'input') return 'text-emerald-400'
    if (type === 'error') return 'whitespace-pre-wrap text-rose-400'
    return 'whitespace-pre-wrap text-slate-300'
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl bg-black/60 ring-1 ring-white/10"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        {transcript.map((entry, i) => (
          <pre key={i} className={styleFor(entry.type)}>
            {entry.type === 'input' ? `$ ${entry.text}` : entry.text}
          </pre>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
        <span className="font-mono text-xs text-emerald-400">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="git status"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent font-mono text-xs text-slate-100 outline-none placeholder:text-slate-600"
        />
      </form>
    </div>
  )
}
