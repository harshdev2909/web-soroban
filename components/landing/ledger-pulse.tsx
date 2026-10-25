'use client'

/**
 * A live readout of the Stellar mainnet ledger: the sequence that just closed
 * and how long it took. Polls Horizon every few seconds from the browser; the
 * server renders a quiet placeholder so the hero paints without waiting.
 */
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const HORIZON = 'https://horizon.stellar.org/ledgers?order=desc&limit=1'
const POLL_MS = 6000

type Ledger = { sequence: number; closedAt: number }

export function LedgerPulse({ className }: { className?: string }) {
  const [ledger, setLedger] = useState<Ledger | null>(null)
  const [age, setAge] = useState(0)
  const [flash, setFlash] = useState(false)
  const last = useRef<number>(0)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const response = await fetch(HORIZON, { cache: 'no-store' })
        if (!response.ok) return
        const body = (await response.json()) as { _embedded?: { records?: { sequence: number; closed_at: string }[] } }
        const record = body._embedded?.records?.[0]
        if (!record || !alive) return
        if (record.sequence !== last.current) {
          last.current = record.sequence
          setLedger({ sequence: record.sequence, closedAt: Date.parse(record.closed_at) })
          setFlash(true)
          window.setTimeout(() => alive && setFlash(false), 500)
        }
      } catch {
        // Offline or blocked: the placeholder stays.
      }
    }
    void load()
    const poll = window.setInterval(() => void load(), POLL_MS)
    const tick = window.setInterval(() => {
      if (last.current) setAge((previous) => previous + 1)
    }, 1000)
    return () => {
      alive = false
      window.clearInterval(poll)
      window.clearInterval(tick)
    }
  }, [])

  useEffect(() => { setAge(0) }, [ledger?.sequence])

  return (
    <p className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground', className)} aria-live="off">
      <span className="flex items-center gap-2 text-foreground">
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full rounded-full bg-brand transition-opacity duration-500', flash ? 'opacity-100 motion-safe:animate-ping' : 'opacity-0')} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
        </span>
        Stellar mainnet
      </span>
      <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:inline" />
      <span className="font-mono-tnum">
        {ledger ? (
          <>
            ledger <span className={cn('text-foreground transition-colors duration-300', flash && 'text-brand')}>{ledger.sequence.toLocaleString()}</span>
          </>
        ) : (
          'ledger syncing'
        )}
      </span>
      {ledger && (
        <>
          <span aria-hidden="true" className="hidden h-3 w-px bg-border sm:inline" />
          <span className="font-mono-tnum">closed {age}s ago</span>
        </>
      )}
    </p>
  )
}
