"use client"

// Testnet/Mainnet switcher for the IDE header. Mainnet is amber so it's never
// mistaken for testnet green. Switching to mainnet the first time (or when not
// yet acknowledged) opens the funding/custody manual and only switches on
// confirm.

import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNetwork } from '@/contexts/NetworkContext'
import { getNetwork, type NetworkId } from '@/lib/networks'
import { MainnetManual } from './mainnet-manual'

export function NetworkSwitcher() {
  const { network, setNetwork, mainnetAcknowledged, acknowledgeMainnet } = useNetwork()
  const [manualOpen, setManualOpen] = useState(false)
  const cfg = getNetwork(network)

  const choose = (next: NetworkId) => {
    if (next === network) return
    if (next === 'mainnet') {
      // Always show the manual until acknowledged; switch only on confirm.
      if (!mainnetAcknowledged) {
        setManualOpen(true)
        return
      }
    }
    setNetwork(next)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${cfg.badgeClass}`}
            title={`Network: ${cfg.label}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Network</div>
          <DropdownMenuItem onClick={() => choose('testnet')} className="gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Testnet
            <span className="ml-auto text-[10px] text-muted-foreground">free faucet</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => choose('mainnet')} className="gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Mainnet
            <span className="ml-auto text-[10px] text-warning">real XLM</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setManualOpen(true)} className="gap-2 text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Mainnet guide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MainnetManual
        open={manualOpen}
        onOpenChange={setManualOpen}
        onProceed={() => {
          acknowledgeMainnet()
          setNetwork('mainnet')
        }}
      />
    </>
  )
}

export default NetworkSwitcher
