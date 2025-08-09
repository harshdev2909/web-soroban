import { getAddress, isConnected, getNetwork as freighterGetNetwork, signTransaction as freighterSignTransaction, signAuthEntry as freighterSignAuthEntry, requestAccess } from '@stellar/freighter-api';

export interface WalletInfo {
  publicKey: string;
  network: string;
  isConnected: boolean;
}

export class WalletService {
  private static instance: WalletService;
  private walletInfo: WalletInfo | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async isFreighterAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.log('WalletService: Running on server side');
      return false;
    }

    try {
      // Check if Freighter is installed by trying to get the address
      const result = await getAddress();
      console.log('WalletService: Freighter available:', !result.error);
      return !result.error;
    } catch (error) {
      console.log('WalletService: Freighter not available:', error);
      return false;
    }
  }

  // Note: connect() method is now implemented directly in navbar.tsx
  // This method is kept for compatibility but not used
  async connect(): Promise<WalletInfo> {
    throw new Error('Use direct API calls in navbar instead');
  }

  async disconnect(): Promise<void> {
    // Freighter API doesn't have a disconnect function
    // The wallet stays connected until the user manually disconnects
        this.walletInfo = null;
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    try {
      const connected = await isConnected();
      
      if (!connected.isConnected) {
        this.walletInfo = null;
        return null;
      }

      if (!this.walletInfo) {
        const addressResult = await getAddress();
        if (addressResult.error) {
          console.error('Failed to get address:', addressResult.error);
          return null;
        }
        
        const networkResult = await freighterGetNetwork();
        if (networkResult.error) {
          console.error('Failed to get network:', networkResult.error);
          return null;
        }
        
        this.walletInfo = {
          publicKey: addressResult.address,
          network: networkResult.network,
          isConnected: true
        };
      }

      return this.walletInfo;
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      return null;
    }
  }

  async signTransactionWithWallet(transaction: string, network: string): Promise<string> {
    try {
      console.log('Signing transaction for network:', network);
      console.log('Transaction XDR length:', transaction.length);
      console.log('Transaction XDR preview:', transaction.substring(0, 100) + '...');
      
      // Convert network format for Freighter
      const networkPassphrase = network === 'mainnet' 
        ? 'Public Global Stellar Network ; September 2015' 
        : 'Test SDF Network ; September 2015';
      console.log('Using Freighter network passphrase:', networkPassphrase);
      
      const signResult = await freighterSignTransaction(transaction, { networkPassphrase });
      
      console.log('Sign result:', signResult);
      console.log('Sign result type:', typeof signResult);
      console.log('Sign result error:', signResult.error);
      console.log('Sign result error type:', typeof signResult.error);
      
      if (signResult.error) {
        console.error('Sign transaction error:', signResult.error);
        
        // Handle different error types
        let errorMessage = '';
        if (typeof signResult.error === 'string') {
          errorMessage = signResult.error;
        } else if (typeof signResult.error === 'object') {
          // If it's an object, try to extract meaningful information
          if (signResult.error.message) {
            errorMessage = signResult.error.message;
          } else if (signResult.error.toString) {
            errorMessage = signResult.error.toString();
          } else {
            errorMessage = JSON.stringify(signResult.error);
          }
        } else {
          errorMessage = String(signResult.error);
        }
        
        console.log('Processed error message:', errorMessage);
        
        // Provide more specific error messages
        if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
          throw new Error('Transaction was rejected by user');
        } else if (errorMessage.includes('insufficient') || errorMessage.includes('Insufficient')) {
          throw new Error('Insufficient balance for transaction fees');
        } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
          throw new Error('Network mismatch. Please check your wallet network settings');
        } else {
          throw new Error(`Sign transaction error: ${errorMessage}`);
        }
      }
      
      console.log('Transaction signed successfully');
      console.log('Signed transaction XDR length:', signResult.signedTxXdr?.length || 0);
      return signResult.signedTxXdr;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to sign transaction: ${error}`);
      }
    }
  }

  async signAuthEntryWithWallet(entry: string, networkPassphrase?: string): Promise<string> {
    try {
      const opts = networkPassphrase ? { networkPassphrase } : undefined;
      const result = await freighterSignAuthEntry(entry, opts);
      if (result.error) {
        throw new Error(`Sign auth entry error: ${result.error}`);
      }
      return result.signedAuthEntry ? result.signedAuthEntry.toString() : '';
    } catch (error) {
      throw new Error(`Failed to sign auth entry: ${error}`);
    }
  }

  async setNetwork(network: string): Promise<void> {
    // Freighter API doesn't have a setNetwork function
    // The user needs to change the network manually in the Freighter extension
    console.warn('setNetwork not supported by Freighter API. Please change network manually in Freighter extension.');
      if (this.walletInfo) {
        this.walletInfo.network = network;
    }
  }

  async getNetworkFromWallet(): Promise<string> {
    try {
      const result = await freighterGetNetwork();
      if (result.error) {
        throw new Error(`Failed to get network: ${result.error}`);
      }
      return result.network;
    } catch (error) {
      throw new Error(`Failed to get network: ${error}`);
    }
  }
}

export const walletService = WalletService.getInstance(); 