"use client"

// Minimal, dependency-free markdown renderer tuned for the Copilot chat: it
// streams safely (partial markdown won't throw), renders fenced code with a
// copy button, and uses the WebSoroban theme tokens. Not a full CommonMark
// implementation — just what an assistant turn needs.

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    })
  }
  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-border bg-[#0b0e17]">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{lang || 'code'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  )
}

// Inline: `code`, **bold**, *italic*, [text](url).
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('`')) {
      nodes.push(
        <code key={`${keyBase}-${i}`} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-brand">
          {tok.slice(1, -1)}
        </code>
      )
    } else if (tok.startsWith('**')) {
      nodes.push(<strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('*')) {
      nodes.push(<em key={`${keyBase}-${i}`}>{tok.slice(1, -1)}</em>)
    } else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)
      if (mm) {
        nodes.push(
          <a key={`${keyBase}-${i}`} href={mm[2]} target="_blank" rel="noreferrer" className="text-brand underline underline-offset-2 hover:opacity-80">
            {mm[1]}
          </a>
        )
      }
    }
    last = m.index + tok.length
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ content }: { content: string }) {
  const lines = (content || '').split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code.
    const fence = /^```(\w+)?\s*$/.exec(line.trim())
    if (fence) {
      const lang = fence[1]
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        buf.push(lines[i])
        i++
      }
      i++ // closing fence
      blocks.push(<CodeBlock key={key++} code={buf.join('\n')} lang={lang} />)
      continue
    }

    // Heading.
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const sizes = ['text-lg', 'text-base', 'text-sm', 'text-sm', 'text-xs', 'text-xs']
      blocks.push(
        <p key={key++} className={`mt-3 mb-1 font-semibold text-foreground ${sizes[level - 1]}`}>
          {renderInline(h[2], `h${key}`)}
        </p>
      )
      i++
      continue
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-3 border-border" />)
      i++
      continue
    }

    // Blockquote.
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote key={key++} className="my-2 border-l-2 border-brand/50 pl-3 text-muted-foreground">
          {renderInline(buf.join(' '), `q${key}`)}
        </blockquote>
      )
      continue
    }

    // Lists (ordered / unordered, incl. task checkboxes).
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items: React.ReactNode[] = []
      const ordered = /^\s*\d+\.\s+/.test(line)
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        const raw = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '')
        const task = /^\[([ xX])\]\s+(.*)$/.exec(raw)
        if (task) {
          items.push(
            <li key={`li${key}-${i}`} className="flex items-start gap-2">
              <span className={`mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-sm border ${task[1] === ' ' ? 'border-border' : 'border-success bg-success/20'}`}>
                {task[1] !== ' ' && <Check className="h-3 w-3 text-success" />}
              </span>
              <span>{renderInline(task[2], `t${key}-${i}`)}</span>
            </li>
          )
        } else {
          items.push(<li key={`li${key}-${i}`}>{renderInline(raw, `l${key}-${i}`)}</li>)
        }
        i++
      }
      const cls = 'my-2 space-y-1 pl-5 ' + (ordered ? 'list-decimal' : 'list-disc')
      blocks.push(
        ordered ? <ol key={key++} className={cls}>{items}</ol> : <ul key={key++} className={cls}>{items}</ul>
      )
      continue
    }

    // Blank line.
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph (gather consecutive plain lines).
    const buf: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i].trim()) &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="my-1.5 leading-relaxed text-foreground/90">
        {renderInline(buf.join(' '), `p${key}`)}
      </p>
    )
  }

  return <div className="text-[13px]">{blocks}</div>
}

export default Markdown
