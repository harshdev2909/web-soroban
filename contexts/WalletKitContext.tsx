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
import { WatchWalletChanges, signAuthEntry as signFreighterAuthEntry } from '@stellar/freighter-api'

/** The connected wallet's real, live network (as reported by the wallet itself). */
export interface WalletNetworkInfo {
  /** wallet-reported name, e.g. "PUBLIC" | "TESTNET" */
  network: string
  /** the passphrase — the reliable identity of the network */
  networkPassphrase: string
}

interface WalletKitContextType {
  kit: StellarWalletsKit | null
  isInitialized: boolean
  selectedWallet: ISupportedWallet | null
  address: string | null
  /** true while a connect flow is in progress */
  connecting: boolean
  /** last connection error, cleared on the next connect attempt */
  error: string | null
  /** convenience: is a wallet currently connected */
  isConnected: boolean
  /** the kit's target network (derived from the live wallet network; defaults testnet) */
  network: WalletNetwork
  /** the connected wallet's live network passphrase, or null when unknown/disconnected */
  walletNetworkPassphrase: string | null
  connect: () => Promise<void>
  connectFreighter: () => Promise<string>
  disconnect: () => void
  signMessage: (message: string) => Promise<string>
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>
  signAuthEntry: (authEntry: string, networkPassphrase?: string) => Promise<{ signedAuthEntry: string; signerAddress?: string }>
  /** Opens the wallet picker and resolves with the connected address (or null if cancelled). */
  openWalletModal: (onWalletSelected?: (wallet: ISupportedWallet) => void) => Promise<string | null>
  /** Reads the connected wallet's network fresh (not cached). Used to guard mainnet signs. */
  getWalletNetwork: () => Promise<WalletNetworkInfo | null>
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
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The connected wallet's live network passphrase (from the wallet itself), not
  // the app's target network. null until known / after disconnect.
  const [walletNetworkPassphrase, setWalletNetworkPassphrase] = useState<string | null>(null)

  // Derive the kit network from the live wallet network so the signTransaction
  // fallback picks the right passphrase (fixes the old hardcoded-TESTNET bug).
  const network: WalletNetwork =
    walletNetworkPassphrase === WalletNetwork.PUBLIC ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET

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

  // Keep the wallet's module selected on the kit whenever the id is known
  // (survives reloads where only the cached id is available).
  const ensureWalletSelected = (): string | null => {
    const id =
      selectedWalletId ||
      (typeof window !== 'undefined' ? window.localStorage.getItem(LS_WALLET_ID) : null)
    if (id && kit) {
      try { kit.setWallet(id) } catch {}
    }
    return id
  }

  const persistWallet = (id: string) => {
    try { window.localStorage.setItem(LS_WALLET_ID, id) } catch {}
  }
  const persistAddress = (addr: string) => {
    try { window.localStorage.setItem(LS_ADDRESS, addr) } catch {}
  }

  // Read the connected wallet's live network and cache the passphrase. Best-effort:
  // some wallet modules don't expose the network — we leave it null then.
  const readAndStoreNetwork = async (): Promise<WalletNetworkInfo | null> => {
    if (!kit) return null
    try {
      ensureWalletSelected()
      const net = await kit.getNetwork()
      if (net?.networkPassphrase) {
        setWalletNetworkPassphrase(net.networkPassphrase)
        return { network: net.network, networkPassphrase: net.networkPassphrase }
      }
    } catch (e) {
      console.error('Failed to read wallet network:', e)
    }
    return null
  }

  const getWalletNetwork = async (): Promise<WalletNetworkInfo | null> => {
    const info = await readAndStoreNetwork()
    return info
  }

  // Watch for account / network changes made inside the wallet (Freighter) so the
  // cached address + network never go stale mid-session. Uses Freighter's poller,
  // which reads current state without popping the extension. Only meaningful for
  // Freighter; other wallets fall back to the pre-sign network check.
  useEffect(() => {
    if (!kit || typeof window === 'undefined' || !address) return
    const id = selectedWalletId || window.localStorage.getItem(LS_WALLET_ID)
    if (id !== FREIGHTER_ID) return

    let active = true
    const watcher = new WatchWalletChanges(2000)
    watcher.watch(({ address: nextAddr, networkPassphrase, error: watchError }) => {
      if (!active || watchError) return

      if (!nextAddr) {
        // Wallet locked or disconnected — reflect it so the UI stops showing a
        // stale connected state (keep the wallet id for an easy reconnect).
        setAddress(null)
        setWalletNetworkPassphrase(null)
        try { window.localStorage.removeItem(LS_ADDRESS) } catch {}
        return
      }

      // Network switched in the wallet (React ignores an unchanged value).
      if (networkPassphrase) setWalletNetworkPassphrase(networkPassphrase)

      // Active account switched in the wallet.
      if (nextAddr !== address) {
        setAddress(nextAddr)
        persistAddress(nextAddr)
      }
    })

    return () => {
      active = false
      watcher.stop()
    }
  }, [kit, address, selectedWalletId])

  const connect = async () => {
    if (!kit) {
      throw new Error('Wallet kit not initialized')
    }

    setConnecting(true)
    setError(null)
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
          // Cache the wallet's live network too.
          await readAndStoreNetwork()
        },
        onClosed: (err) => {
          if (err) {
            console.error('Wallet modal closed with error:', err)
          }
        },
        modalTitle: 'Connect Stellar Wallet',
      })
    } catch (err: any) {
      console.error('Failed to connect wallet:', err)
      setError(err?.message || 'Failed to connect wallet')
      throw err
    } finally {
      setConnecting(false)
    }
  }

  const connectFreighter = async (): Promise<string> => {
    if (!kit) throw new Error('Wallet kit not initialized')
    setConnecting(true)
    setError(null)
    try {
      kit.setWallet(FREIGHTER_ID)
      setSelectedWalletId(FREIGHTER_ID)
      persistWallet(FREIGHTER_ID)
      const supported = await kit.getSupportedWallets()
      setSelectedWallet(supported.find((wallet) => wallet.id === FREIGHTER_ID) || null)
      const result = await kit.getAddress()
      if (!result?.address) throw new Error('Freighter returned no account address.')
      setAddress(result.address)
      persistAddress(result.address)
      await readAndStoreNetwork()
      return result.address
    } catch (error: any) {
      const message = error?.message || 'Could not connect Freighter.'
      setError(message)
      throw new Error(message)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setSelectedWallet(null)
    setSelectedWalletId(null)
    setWalletNetworkPassphrase(null)
    setError(null)
    try {
      window.localStorage.removeItem(LS_WALLET_ID)
      window.localStorage.removeItem(LS_ADDRESS)
    } catch {}
    if (kit) {
      // Best-effort: let the kit clear its own stored connection, then reset the
      // default module so a fresh connect starts clean.
      Promise.resolve(kit.disconnect?.()).catch(() => {})
      try { kit.setWallet(FREIGHTER_ID) } catch {}
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
    ensureWalletSelected()

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

  const signAuthEntry = async (authEntry: string, networkPassphrase?: string) => {
    if (!kit) throw new Error('Wallet not initialized')

    ensureWalletSelected()
    // Never trust cached React/localStorage state here. Freighter accounts can
    // change while this page remains open, and signing for a stale payer yields
    // the opaque SDK error "signature doesn't match payload".
    const addressResult = await kit.getAddress()
    const signer = addressResult?.address || null
    if (signer) {
      setAddress(signer)
      persistAddress(signer)
    }
    if (!signer) throw new Error('Connect Freighter before approving the payment.')

    try {
      // Use Freighter's SEP-43 API directly here. Wallets Kit 1.9 always runs
      // Buffer.from(value).toString('base64'), which corrupts signatures from
      // newer Freighter extensions when they already return a base64 string.
      const result = await signFreighterAuthEntry(authEntry, {
        address: signer,
        networkPassphrase: networkPassphrase || WalletNetwork.TESTNET,
      })
      if (result.error) throw result.error
      if (!result?.signedAuthEntry) throw new Error('Freighter returned no signed authorization entry.')
      if (result.signerAddress && result.signerAddress !== signer) {
        throw new Error('Freighter signed with a different account. Reconnect the active account and retry.')
      }

      const { Buffer } = await import('buffer')
      const { Keypair, hash } = await import('@stellar/stellar-sdk')
      const rawSignature = result.signedAuthEntry as unknown
      const candidates: InstanceType<typeof Buffer>[] = []

      if (typeof rawSignature === 'string') {
        // Freighter versions have returned base64, base64url, and byte-like
        // values across releases. Accept only a decoding that cryptographically
        // verifies for this exact preimage and connected account.
        candidates.push(Buffer.from(rawSignature, 'base64'))
        if (/^[0-9a-fA-F]{128}$/.test(rawSignature)) {
          candidates.push(Buffer.from(rawSignature, 'hex'))
        }

        const onceDecoded = Buffer.from(rawSignature, 'base64').toString('utf8')
        if (/^[A-Za-z0-9+/_-]+={0,2}$/.test(onceDecoded)) {
          candidates.push(Buffer.from(onceDecoded, 'base64'))
        }
        if (/^[0-9a-fA-F]{128}$/.test(onceDecoded)) {
          candidates.push(Buffer.from(onceDecoded, 'hex'))
        }
      } else if (rawSignature instanceof Uint8Array) {
        candidates.push(Buffer.from(rawSignature))
      } else if (rawSignature instanceof ArrayBuffer) {
        candidates.push(Buffer.from(new Uint8Array(rawSignature)))
      }

      const payloadHash = hash(Buffer.from(authEntry, 'base64'))
      const publicKey = Keypair.fromPublicKey(signer)
      const verifiedSignature = candidates.find(
        (candidate) => candidate.length === 64 && publicKey.verify(payloadHash, candidate),
      )
      if (!verifiedSignature) {
        throw new Error('Freighter returned a signature for a different authorization. Reconnect Freighter and retry.')
      }

      return {
        signedAuthEntry: verifiedSignature.toString('base64'),
        signerAddress: result.signerAddress,
      }
    } catch (error: any) {
      const message = error?.message || error?.toString?.() || ''
      if (/reject|denied|declin|cancel/i.test(message)) {
        throw new Error('You cancelled the payment approval in Freighter.')
      }
      throw new Error(message || 'Freighter could not sign the payment authorization.')
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
            // Cache the wallet's live network for the pre-sign guard.
            await readAndStoreNetwork()
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
        connecting,
        error,
        isConnected: !!address,
        network,
        walletNetworkPassphrase,
        connect,
        connectFreighter,
        disconnect,
        signMessage,
        signTransaction,
        signAuthEntry,
        openWalletModal,
        getWalletNetwork,
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
