"use client"

// Active network (testnet | mainnet) for the whole app. Persisted to
// localStorage so a refresh keeps the choice. Switching scopes every
// deploy/invoke/balance/explorer view to that network.

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { NetworkId } from '@/lib/networks'

interface NetworkContextValue {
  network: NetworkId
  setNetwork: (n: NetworkId) => void
  /** has the user seen the mainnet manual at least once this browser */
  mainnetAcknowledged: boolean
  acknowledgeMainnet: () => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

const LS_NETWORK = 'ws.network'
const LS_MAINNET_ACK = 'ws.mainnetAcknowledged'

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<NetworkId>('testnet')
  const [mainnetAcknowledged, setAck] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(LS_NETWORK)
    if (saved === 'mainnet' || saved === 'testnet') setNetworkState(saved)
    setAck(window.localStorage.getItem(LS_MAINNET_ACK) === '1')
  }, [])

  const setNetwork = useCallback((n: NetworkId) => {
    setNetworkState(n)
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_NETWORK, n)
  }, [])

  const acknowledgeMainnet = useCallback(() => {
    setAck(true)
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_MAINNET_ACK, '1')
  }, [])

  return (
    <NetworkContext.Provider value={{ network, setNetwork, mainnetAcknowledged, acknowledgeMainnet }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within a NetworkProvider')
  return ctx
}
