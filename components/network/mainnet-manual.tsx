"use client"

// The mainnet instruction manual: shown the first time a user switches to
// mainnet (and re-openable). Real, concise copy, mirrored in /docs/networks.

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Check, Copy, ExternalLink, KeyRound, ShieldCheck, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn, copyToClipboard } from '@/lib/utils'
import { networkApi } from '@/lib/mainnetApi'

const FUND_STEPS = [
  'Buy XLM on an exchange (Coinbase, Kraken, Binance), or send from another Stellar wallet.',
  "Withdraw to the address below. No memo needed, it's your own account.",
  'Leave a buffer: ~1 XLM base reserve, ~0.5 per ledger entry, plus fees and rent.',
]

const COSTS: [string, string][] = [
  ['Deploy', 'one-time fee + storage rent · a few XLM'],
  ['Write call', 'small per-call fee · shown before you sign'],
  ['Read call', 'free · simulated, no signature'],
]

function SectionLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-brand" />
      {children}
    </h3>
  )
}

export function MainnetManual({
  open,
  onOpenChange,
  onProceed,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** called when the user confirms they want to use mainnet */
  onProceed?: () => void
}) {
  const [address, setAddress] = useState<string>('')
  const [mode, setMode] = useState<'connected' | 'custodial'>('connected')
  const [ack, setAck] = useState(false)
  const [savingMode, setSavingMode] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    networkApi.wallet('mainnet').then((w) => setAddress(w.publicKey)).catch(() => {})
    networkApi.getSigningMode().then((r) => setMode(r.mainnetSigningMode)).catch(() => {})
  }, [open])

  const copyAddr = async () => {
    if (await copyToClipboard(address)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const chooseMode = async (next: 'connected' | 'custodial') => {
    if (next === 'custodial' && !ack) {
      toast.error('Tick the acknowledgement to enable custodial signing.')
      return
    }
    setSavingMode(true)
    try {
      const r = await networkApi.setSigningMode(next, next === 'custodial')
      setMode(r.mainnetSigningMode)
      toast.success(next === 'connected' ? 'Using your connected wallet on mainnet' : 'Custodial mainnet signing enabled')
    } catch (e: any) {
      toast.error(e.message || 'Could not save signing mode')
    } finally {
      setSavingMode(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto p-0 sm:max-w-[540px]">
        {/* Header */}
        <DialogHeader className="space-y-3 border-b border-border px-6 pb-5 pt-6">
          <DialogTitle className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning ring-1 ring-inset ring-warning/25">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Switching to Mainnet</span>
          </DialogTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The live Stellar network. Transactions cost <span className="font-medium text-foreground">real XLM</span> and
            are <span className="font-medium text-foreground">irreversible</span>. There&apos;s no faucet, so you fund
            your own account.
          </p>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {/* Fund */}
          <section className="rounded-xl border border-border bg-card/40 p-4">
            <SectionLabel icon={Wallet}>Fund your wallet</SectionLabel>
            <ol className="mt-3 space-y-2.5">
              {FUND_STEPS.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/12 font-mono text-[10px] font-semibold text-brand">
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{s}</p>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Deposit address</span>
                <span className="text-[10px] text-muted-foreground/70">same on testnet &amp; mainnet</span>
              </div>
              <button
                onClick={copyAddr}
                className="group mt-1.5 flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-brand/40 hover:bg-accent"
                title="Copy address"
              >
                <span className="min-w-0 flex-1 break-all font-mono text-[12px] text-foreground/90">{address || 'Loading…'}</span>
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Copy className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                )}
              </button>
            </div>
          </section>

          {/* Custody */}
          <section className="rounded-xl border border-border bg-card/40 p-4">
            <SectionLabel icon={ShieldCheck}>Who signs your transactions</SectionLabel>
            <div className="mt-3 grid gap-2.5">
              {/* Connected */}
              <button
                onClick={() => chooseMode('connected')}
                disabled={savingMode}
                aria-pressed={mode === 'connected'}
                className={cn(
                  'rounded-lg border p-3 text-left transition',
                  mode === 'connected'
                    ? 'border-brand/60 bg-brand/[0.06] ring-1 ring-inset ring-brand/30'
                    : 'border-border hover:border-brand/40 hover:bg-accent/40',
                )}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-brand" />
                  <span className="text-[13px] font-medium text-foreground">Connect an external wallet</span>
                  <span className="ml-auto rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand">
                    Recommended
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  Freighter, xBull, Albedo, Lobstr, or Hana. You sign in the browser, so your key never touches our servers.
                </p>
              </button>

              {/* Custodial: a div (not a button) so it can hold the real checkbox */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => chooseMode('custodial')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    chooseMode('custodial')
                  }
                }}
                aria-pressed={mode === 'custodial'}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-warning/50',
                  mode === 'custodial'
                    ? 'border-warning/60 bg-warning/[0.06] ring-1 ring-inset ring-warning/30'
                    : 'border-border hover:border-warning/40 hover:bg-accent/40',
                )}
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-warning" />
                  <span className="text-[13px] font-medium text-foreground">Use the generated wallet (custodial)</span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  We sign with a key stored on our servers. Faster, but your funds are at risk if our systems are
                  compromised.
                </p>
                <label className="mt-2.5 flex cursor-pointer items-start gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                  />
                  <span
                    className={cn(
                      'mt-px grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:ring-1 peer-focus-visible:ring-warning/50',
                      ack ? 'border-warning bg-warning/20' : 'border-border bg-background',
                    )}
                  >
                    {ack && <Check className="h-2.5 w-2.5 text-warning" />}
                  </span>
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    I understand a server-held key will sign my real-fund transactions.
                  </span>
                </label>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
              Prefer to self-custody? <span className="text-foreground">Export your private key</span> from the wallet
              panel anytime.
            </p>
          </section>

          {/* Costs */}
          <section className="rounded-xl border border-border bg-card/40 p-4">
            <SectionLabel icon={Wallet}>What it costs</SectionLabel>
            <dl className="mt-2 divide-y divide-border/60">
              {COSTS.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 py-2 text-[12px]">
                  <dt className="font-medium text-foreground">{k}</dt>
                  <dd className="text-right text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <a
            href="https://stellar.expert/explorer/public"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-brand"
          >
            View on stellar.expert <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              className="gap-1.5 bg-warning text-background hover:bg-warning/90"
              onClick={() => {
                onProceed?.()
                onOpenChange(false)
              }}
            >
              <Check className="h-3.5 w-3.5" /> Use Mainnet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MainnetManual
