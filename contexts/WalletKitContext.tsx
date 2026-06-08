'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  ISupportedWallet,
  FREIGHTER_ID,
  XBULL_ID,
  xBullModule,
  FreighterModule,
  AlbedoModule,
  RabetModule,
  LobstrModule,
  HanaModule,
  HotWalletModule,
  KleverModule,
} from '@creit.tech/stellar-wallets-kit'

interface WalletKitContextType {
  kit: StellarWalletsKit | null
  isInitialized: boolean
  selectedWallet: ISupportedWallet | null
  address: string | null
  network: WalletNetwork
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>
  /** Opens the wallet picker and resolves with the connected address (or null if cancelled). */
  openWalletModal: (onWalletSelected?: (wallet: ISupportedWallet) => void) => Promise<string | null>
}

const WalletKitContext = createContext<WalletKitContextType | undefined>(undefined)

// Persist the selected wallet + address so a page reload keeps the connection
// and the kit still knows which wallet module to sign with (otherwise the kit
// throws code -3 "Please set the wallet first").
const LS_WALLET_ID = 'sw_wallet_id'
const LS_ADDRESS = 'sw_address'

export function WalletKitProvider({ children }: { children: ReactNode }) {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<ISupportedWallet | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<WalletNetwork>(WalletNetwork.TESTNET)

  useEffect(() => {
    // Initialize the wallet kit
    const initializeKit = async () => {
      try {
        const walletKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: FREIGHTER_ID, // Default to Freighter
          modules: [
            new FreighterModule(),
            new xBullModule(),
            new AlbedoModule(),
            new RabetModule(),
            new LobstrModule(),
            new HanaModule(),
            new HotWalletModule(),
            new KleverModule(),
          ],
        })

        // Restore a previously connected wallet so the kit knows which module to
        // use for signing after a reload (does NOT pop the extension — we only
        // re-select the module and rehydrate the cached address).
        try {
          const savedId = window.localStorage.getItem(LS_WALLET_ID)
          const savedAddress = window.localStorage.getItem(LS_ADDRESS)
          if (savedId) {
            walletKit.setWallet(savedId)
            setSelectedWalletId(savedId)
          }
          if (savedAddress) setAddress(savedAddress)
        } catch {
          /* ignore restore errors */
        }

        setKit(walletKit)
        setIsInitialized(true)

        // Do NOT call getAddress() here - it triggers the wallet extension popup
        // on every page load. User must click "Connect Wallet" to connect.
      } catch (error) {
        console.error('Failed to initialize wallet kit:', error)
        setIsInitialized(true) // Mark as initialized even if failed
      }
    }

    if (typeof window !== 'undefined') {
      initializeKit()
    }

    return () => {
      // Cleanup if needed
      if (kit) {
        // Kit doesn't have explicit cleanup, but we can reset state
        setKit(null)
        setAddress(null)
        setSelectedWallet(null)
      }
    }
  }, [])

  const connect = async () => {
    if (!kit) {
      throw new Error('Wallet kit not initialized')
    }

    try {
      // Open modal to let user select wallet
      await kit.openModal({
        onWalletSelected: async (wallet: ISupportedWallet) => {
          kit.setWallet(wallet.id)
          setSelectedWallet(wallet)
          setSelectedWalletId(wallet.id)
          persistWallet(wallet.id)

          // Get address
          const addressResult = await kit.getAddress()
          if (addressResult?.address) {
            setAddress(addressResult.address)
            persistAddress(addressResult.address)
          }
        },
        onClosed: (err) => {
          if (err) {
            console.error('Wallet modal closed with error:', err)
          }
        },
        modalTitle: 'Connect Stellar Wallet',
      })
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const persistWallet = (id: string) => {
    try { window.localStorage.setItem(LS_WALLET_ID, id) } catch {}
  }
  const persistAddress = (addr: string) => {
    try { window.localStorage.setItem(LS_ADDRESS, addr) } catch {}
  }

  const disconnect = () => {
    setAddress(null)
    setSelectedWallet(null)
    setSelectedWalletId(null)
    try {
      window.localStorage.removeItem(LS_WALLET_ID)
      window.localStorage.removeItem(LS_ADDRESS)
    } catch {}
    if (kit) {
      // Reset wallet selection
      kit.setWallet(FREIGHTER_ID)
    }
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!kit || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Check if Freighter is available and connected
      // First check selectedWallet, then check if Freighter extension is available
      const isFreighter = selectedWallet?.id === FREIGHTER_ID || 
                         (typeof window !== 'undefined' && (window as any).freighterApi)
      
     
      const isFreighterWallet = isFreighter || (!selectedWallet && typeof window !== 'undefined' && (window as any).freighterApi)

      if (isFreighterWallet) {
        // Use Freighter's direct API for message signing
        try {
          const freighterApi = await import('@stellar/freighter-api')
          // Freighter signMessage signature: signMessage(message: string, publicKey: string)
          // @ts-ignore - TypeScript types for freighter-api may be incorrect
          const result = await freighterApi.signMessage(message, address)
          
        
          if ('error' in result && result.error) {
            console.error('Freighter signMessage error:', result.error)
            throw new Error(result.error || 'Failed to sign message with Freighter')
          }
          
          // V4 response has signature property, V3 might have different structure
          // Check both possible response formats
          const signature = (result as any).signature || (result as any).publicKey || (result as any).signatureBase64
          if (!signature) {
            console.error('Freighter response:', result)
            throw new Error('Freighter returned no signature. Please make sure you approve the signing request in Freighter.')
          }
          
          return signature
        } catch (freighterError: any) {
          console.error('Freighter API error:', freighterError)
          // If Freighter API fails, provide helpful error
          if (freighterError.message?.includes('User rejected')) {
            throw new Error('Message signing was cancelled. Please try again and approve the signing request.')
          }
          throw new Error(`Freighter signing failed: ${freighterError.message || 'Unknown error'}`)
        }
      } else {
      
        throw new Error('Message signing not fully supported for this wallet. Please use Freighter wallet for authentication, or use Google OAuth instead.')
      }
    } catch (error: any) {
      console.error('Message signing error:', error)
      // Re-throw with more context if it's not already a user-friendly error
      if (error.message && !error.message.includes('not fully supported') && !error.message.includes('cancelled')) {
        throw new Error(`Failed to sign message: ${error.message}`)
      }
      throw error
    }
  }

  const signTransaction = async (xdr: string, networkPassphrase?: string): Promise<string> => {
    if (!kit) {
      throw new Error('Wallet not initialized')
    }

    // Make sure the kit knows which wallet module to use (survives reloads where
    // only the cached id is available). Without this the kit throws code -3.
    const walletId = selectedWalletId || (typeof window !== 'undefined' ? window.localStorage.getItem(LS_WALLET_ID) : null)
    if (walletId) {
      try { kit.setWallet(walletId) } catch {}
    }

    // Resolve the signer address — re-read from the wallet if state is empty.
    let signer = address
    if (!signer) {
      try {
        const res = await kit.getAddress()
        signer = res?.address || null
        if (signer) {
          setAddress(signer)
          persistAddress(signer)
        }
      } catch {
        /* fall through to the explicit error below */
      }
    }
    if (!signer) {
      throw new Error('Connect a wallet before signing.')
    }

    // Resolve the network passphrase (default to the kit's network).
    let passphrase = networkPassphrase
    if (!passphrase) {
      const { Networks } = await import('@stellar/stellar-sdk')
      passphrase = network === WalletNetwork.TESTNET ? Networks.TESTNET : Networks.PUBLIC
    }

    try {
      // Pass `address` so the wallet signs with the connected account (critical
      // for Freighter, which otherwise signs with whatever account is active).
      const result = await kit.signTransaction(xdr, {
        address: signer,
        networkPassphrase: passphrase,
      })
      if (!result?.signedTxXdr) {
        throw new Error('The wallet returned no signed transaction.')
      }
      return result.signedTxXdr
    } catch (error: any) {
      const code = error?.code
      const msg = error?.message || error?.toString?.() || ''
      console.error('Failed to sign transaction:', error)
      if (code === -3 || /set the wallet|wallet first/i.test(msg)) {
        throw new Error('Wallet disconnected — please reconnect and try again.')
      }
      if (/reject|denied|declin|cancel/i.test(msg)) {
        throw new Error('You cancelled the signing request.')
      }
      if (/different account|account.*not|mismatch/i.test(msg)) {
        throw new Error('The wallet is on a different account. Switch to the connected account and retry.')
      }
      throw new Error(msg || 'Failed to sign transaction.')
    }
  }

  const openWalletModal = async (
    onWalletSelected?: (wallet: ISupportedWallet) => void
  ): Promise<string | null> => {
    if (!kit) {
      throw new Error('Wallet kit not initialized')
    }

    // Resolve with the freshly connected address so callers don't read stale
    // React state (setAddress only reflects on the next render).
    return new Promise<string | null>((resolve) => {
      let settled = false
      kit.openModal({
        onWalletSelected: async (wallet: ISupportedWallet) => {
          try {
            kit.setWallet(wallet.id)
            setSelectedWallet(wallet)
            setSelectedWalletId(wallet.id)
            persistWallet(wallet.id)
            const addressResult = await kit.getAddress()
            const addr = addressResult?.address || null
            if (addr) {
              setAddress(addr)
              persistAddress(addr)
            }
            onWalletSelected?.(wallet)
            settled = true
            resolve(addr)
          } catch (error) {
            console.error('Failed to read wallet address:', error)
            settled = true
            resolve(null)
          }
        },
        onClosed: () => {
          if (!settled) resolve(null)
        },
        modalTitle: 'Select Stellar Wallet',
      })
    })
  }

  return (
    <WalletKitContext.Provider
      value={{
        kit,
        isInitialized,
        selectedWallet,
        address,
        network,
        connect,
        disconnect,
        signMessage,
        signTransaction,
        openWalletModal,
      }}
    >
      {children}
    </WalletKitContext.Provider>
  )
}

export function useWalletKit() {
  const context = useContext(WalletKitContext)
  if (context === undefined) {
    throw new Error('useWalletKit must be used within a WalletKitProvider')
  }
  return context
}
