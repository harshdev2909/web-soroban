"use client"

// Hardened private-key export. Gated by a typed confirmation (+ password when the
// account has one). The secret is shown once, never persisted in client state
// beyond this modal, and cleared on close. Server writes an audit log per export.

import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Check, Copy, Download, Eye, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'
import { networkApi } from '@/lib/mainnetApi'

export function ExportKeyModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [revealing, setRevealing] = useState(false)
  const [secret, setSecret] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setConfirmText('')
    setPassword('')
    setSecret('')
    setPublicKey('')
    setCopied(false)
    setRevealing(false)
  }

  const close = (o: boolean) => {
    if (!o) reset() // never leave the secret in memory after close
    onOpenChange(o)
  }

  const reveal = async () => {
    setRevealing(true)
    try {
      const r = await networkApi.exportKey(confirmText.trim(), password || undefined)
      setSecret(r.secret)
      setPublicKey(r.publicKey)
    } catch (e: any) {
      toast.error(e.message || 'Export failed')
    } finally {
      setRevealing(false)
    }
  }

  const copy = async () => {
    if (await copyToClipboard(secret)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const download = () => {
    const blob = new Blob([`Public Key: ${publicKey}\nSecret Key: ${secret}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `websoroban-keypair-${publicKey.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-destructive/15 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Export private key
          </DialogTitle>
          <DialogDescription>
            Anyone with this key controls your funds on <span className="text-foreground">mainnet and testnet</span>. Store
            it in a password manager or hardware wallet. We show it once and never again.
          </DialogDescription>
        </DialogHeader>

        {!secret ? (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs">Type <span className="font-mono text-foreground">EXPORT</span> to confirm</Label>
              <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="EXPORT" autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw" className="text-xs">Account password (if you set one)</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank if you sign in with Google/GitHub/Discord" autoComplete="current-password" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
              <Button variant="destructive" onClick={reveal} disabled={revealing || confirmText.trim() !== 'EXPORT'}>
                {revealing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                Reveal secret
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Secret key (S…)</div>
              <div className="mt-1 break-all font-mono text-[12px] text-foreground">{secret}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" className="flex-1 gap-1.5" onClick={download}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Move funds out and self-custody before relying on mainnet. Close this dialog when you're done — the key won't
              be shown again.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => close(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ExportKeyModal
