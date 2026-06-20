"use client"

// Fee-preview confirmation for a MAINNET write invocation. Mirrors the deploy
// dialog: shows the function, signer, and simulated fee before any signature.

import type { ReactNode } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface InvokeConfirmDetails {
  mode: 'connected' | 'custodial'
  /** connected wallet address, or empty for the custodial wallet */
  signer?: string
  /** estimated fee in XLM (from simulation) */
  feeXlm?: string
  fnName: string
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  )
}

const trunc = (a?: string) => (a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || '')

export function MainnetInvokeDialog({
  open,
  details,
  onResolve,
}: {
  open: boolean
  details: InvokeConfirmDetails | null
  onResolve: (ok: boolean) => void
}) {
  const d = details
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onResolve(false) }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Invoke on Mainnet
          </DialogTitle>
        </DialogHeader>

        {d && (
          <div className="space-y-3 py-1 text-sm">
            <p className="text-muted-foreground">
              This is a state-changing call on the live network. It <span className="text-foreground">costs real
              XLM</span> and can&apos;t be undone.
            </p>
            <dl className="space-y-2 rounded-lg border border-border bg-card/50 p-3 text-[13px]">
              <Row label="Function"><span className="font-mono text-foreground">{d.fnName}</span></Row>
              <Row label="Network">
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                  Mainnet
                </span>
              </Row>
              <Row label="Signed by">
                <span>
                  {d.mode === 'connected' ? 'Connected wallet ' : 'Custodial wallet'}
                  {d.mode === 'connected' && <span className="font-mono text-foreground">{trunc(d.signer)}</span>}
                </span>
              </Row>
              <Row label="Estimated fee">
                {d.feeXlm ? (
                  <span className="font-mono-tnum text-foreground">≈ {d.feeXlm} XLM</span>
                ) : (
                  <span className="text-muted-foreground">shown at submit</span>
                )}
              </Row>
            </dl>
            {d.mode === 'custodial' && (
              <p className="text-[11px] text-muted-foreground">A server-held key will sign this transaction.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onResolve(false)}>Cancel</Button>
          <Button className="gap-1.5 bg-warning text-background hover:bg-warning/90" onClick={() => onResolve(true)}>
            <Send className="h-3.5 w-3.5" /> Sign &amp; submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MainnetInvokeDialog
