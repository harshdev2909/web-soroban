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
  openWalletModal: (onWalletSelected?: (wallet: ISupportedWallet) => void) => Promise<void>
}

const WalletKitContext = createContext<WalletKitContextType | undefined>(undefined)

export function WalletKitProvider({ children }: { children: ReactNode }) {
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<ISupportedWallet | null>(null)
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
          console.log('Wallet selected:', wallet.id, wallet.name)
          kit.setWallet(wallet.id)
          setSelectedWallet(wallet)
          
          // Get address
          const addressResult = await kit.getAddress()
          if (addressResult?.address) {
            setAddress(addressResult.address)
            console.log('Wallet connected:', addressResult.address, 'Type:', wallet.id)
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

  const disconnect = () => {
    setAddress(null)
    setSelectedWallet(null)
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
    if (!kit || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert network passphrase to string if it's a Networks enum
      let passphrase: string
      if (networkPassphrase) {
        passphrase = networkPassphrase
      } else {
        // Default to testnet
        const { Networks } = await import('@stellar/stellar-sdk')
        passphrase = network === WalletNetwork.TESTNET ? Networks.TESTNET : Networks.PUBLIC
      }

      // Sign transaction with the kit
      // The kit should use the currently connected address
      const result = await kit.signTransaction(xdr, {
        networkPassphrase: passphrase,
      })

      // The result should be an object with signedTxXdr
      if (!result || !result.signedTxXdr) {
        throw new Error('Transaction signing failed - no signed transaction returned')
      }

      return result.signedTxXdr
    } catch (error: any) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  const openWalletModal = async (onWalletSelected?: (wallet: ISupportedWallet) => void) => {
    if (!kit) {
      throw new Error('Wallet kit not initialized')
    }

    await kit.openModal({
      onWalletSelected: async (wallet: ISupportedWallet) => {
        console.log('Wallet selected in modal:', wallet.id, wallet.name)
        kit.setWallet(wallet.id)
        setSelectedWallet(wallet)
        
        const addressResult = await kit.getAddress()
        if (addressResult?.address) {
          setAddress(addressResult.address)
          console.log('Wallet address set:', addressResult.address)
        }
        
        if (onWalletSelected) {
          onWalletSelected(wallet)
        }
      },
      modalTitle: 'Select Stellar Wallet',
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
