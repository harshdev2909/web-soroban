"use client"

// Fee-preview confirmation for a MAINNET deploy. Replaces window.confirm — shows
// the signer, the simulated fee in XLM, the number of signatures, and a low-
// balance warning, then requires an explicit click. Promise-driven from the page.

import type { ReactNode } from 'react'
import { AlertTriangle, Rocket } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DeployConfirmDetails {
  mode: 'connected' | 'custodial'
  /** signer address (connected wallet, or the custodial G… wallet) */
  signer: string
  /** estimated fee in XLM (from simulation); undefined if it couldn't be read */
  feeXlm?: string
  /** number of wallet signatures (2 for non-custodial deploy, 1 custodial) */
  steps: number
  /** current mainnet balance, to warn when it may be too low */
  balance?: number
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}

const trunc = (a: string) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || '—')

export function MainnetDeployDialog({
  open,
  details,
  onResolve,
}: {
  open: boolean
  details: DeployConfirmDetails | null
  /** true = proceed, false = cancel */
  onResolve: (ok: boolean) => void
}) {
  const d = details
  const low = d?.feeXlm && d?.balance !== undefined ? d.balance < Number(d.feeXlm) : false

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onResolve(false) }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Deploy to Mainnet
          </DialogTitle>
        </DialogHeader>

        {d && (
          <div className="space-y-3 py-1 text-sm">
            <p className="text-muted-foreground">
              This deploys to the live network and <span className="text-foreground">costs real XLM</span>. It can&apos;t
              be undone.
            </p>

            <dl className="space-y-2 rounded-lg border border-border bg-card/50 p-3 text-[13px]">
              <Row label="Network">
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                  Mainnet
                </span>
              </Row>
              <Row label="Signed by">
                <span>
                  {d.mode === 'connected' ? 'Connected wallet ' : 'Custodial wallet '}
                  <span className="font-mono text-foreground">{trunc(d.signer)}</span>
                </span>
              </Row>
              <Row label="Estimated fee">
                {d.feeXlm ? (
                  <span className="font-mono-tnum text-foreground">≈ {d.feeXlm} XLM</span>
                ) : (
                  <span className="text-muted-foreground">shown at submit</span>
                )}
              </Row>
              {d.mode === 'connected' && (
                <Row label="Signatures">
                  <span className="text-foreground">{d.steps} in your wallet</span>
                </Row>
              )}
              {d.balance !== undefined && (
                <Row label="Your balance">
                  <span className={cn('font-mono-tnum', low ? 'text-warning' : 'text-foreground')}>{d.balance} XLM</span>
                </Row>
              )}
            </dl>

            {low && (
              <p className="flex items-center gap-1.5 text-[12px] text-warning">
                <AlertTriangle className="h-3.5 w-3.5" /> Balance may be too low to cover the fee plus reserves.
              </p>
            )}
            {d.mode === 'custodial' && (
              <p className="text-[11px] text-muted-foreground">A server-held key will sign this transaction.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onResolve(false)}>Cancel</Button>
          <Button className="gap-1.5 bg-warning text-background hover:bg-warning/90" onClick={() => onResolve(true)}>
            <Rocket className="h-3.5 w-3.5" /> Deploy to Mainnet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MainnetDeployDialog
