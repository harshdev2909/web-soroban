import { useState, useEffect, useCallback } from 'react';
import { getAddress, getNetwork, isConnected, requestAccess } from '@stellar/freighter-api';

export interface WalletAccount {
  publicKey: string;
  network: string;
  displayName: string;
  isConnected: boolean;
}

export function useWallet() {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setError(null);
      
      // Check if Freighter is available
      if (typeof window === 'undefined') {
        return;
      }

      // Check if connected
      const connected = await isConnected();
      
      if (!connected.isConnected) {
        setAccount(null);
        return;
      }

      // Get address
      const addressResult = await getAddress();
      
      if (addressResult.error || !addressResult.address) {
        setAccount(null);
        return;
      }

      // Get network
      const networkResult = await getNetwork();
      
      if (networkResult.error) {
        setAccount(null);
        return;
      }

      // Create display name (first 6 + last 4 characters)
      const displayName = `${addressResult.address.slice(0, 6)}...${addressResult.address.slice(-4)}`;

      const walletAccount: WalletAccount = {
        publicKey: addressResult.address,
        network: networkResult.network,
        displayName,
        isConnected: true
      };

      setAccount(walletAccount);
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
      setAccount(null);
      
      // Handle extension context invalidated error silently
      // Don't set error for this as it's a common temporary issue
      if (err instanceof Error && err.message.includes('Extension context invalidated')) {
        console.log('Extension context invalidated - this is normal and will retry automatically');
      }
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if Freighter is available
      if (typeof window === 'undefined') {
        throw new Error('Cannot connect wallet on server side');
      }

      // Wait a bit for extension context to stabilize (especially after hot reloads)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if extension context is valid by testing a simple call
      try {
        const testResult = await isConnected();
        console.log('Extension context test:', testResult);
      } catch (contextError) {
        console.log('Extension context invalid, waiting for recovery...');
        // Wait a bit more and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Request access
      console.log('Requesting access to Freighter...');
      console.log('Current URL:', window.location.href);
      console.log('Freighter available:', typeof window !== 'undefined' && (window as any).freighter);
      
      // Try requestAccess with retry for extension context issues
      let accessResult: any = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          accessResult = await requestAccess();
          console.log('Access result:', accessResult);
          break; // Success, exit retry loop
        } catch (retryError) {
          retryCount++;
          console.log(`RequestAccess attempt ${retryCount} failed:`, retryError);
          
          if (retryError instanceof Error && retryError.message.includes('Extension context invalidated')) {
            if (retryCount < maxRetries) {
              console.log(`Extension context invalidated, retrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            } else {
              throw new Error('Extension context invalidated. Please refresh the page and try again.');
            }
          } else {
            throw retryError; // Re-throw non-context errors
          }
        }
      }
      
      if (!accessResult) {
        throw new Error('Failed to get access result after retries');
      }
      
      if (accessResult.error) {
        console.log('Access result error:', accessResult.error);
        if (accessResult.error.includes('User rejected')) {
          throw new Error('Connection was rejected by user. Please approve the connection in your Freighter extension.');
        } else if (accessResult.error.includes('not installed')) {
          throw new Error('Freighter wallet extension not found. Please install Freighter first.');
        } else {
          throw new Error(`Failed to request access: ${accessResult.error}`);
        }
      }

      // Check if address is available
      if (!accessResult.address) {
        console.log('Access result:', accessResult);
        throw new Error('No address returned from wallet. Please check if Freighter is unlocked and try again.');
      }

      // Get network
      const networkResult = await getNetwork();
      
      if (networkResult.error) {
        throw new Error(`Failed to get network: ${networkResult.error}`);
      }

      // Create display name
      const displayName = `${accessResult.address.slice(0, 6)}...${accessResult.address.slice(-4)}`;

      const walletAccount: WalletAccount = {
        publicKey: accessResult.address,
        network: networkResult.network,
        displayName,
        isConnected: true
      };

      setAccount(walletAccount);
    } catch (err) {
      let errorMessage = 'Failed to connect wallet';
      
      if (err instanceof Error) {
        if (err.message.includes('Extension context invalidated')) {
          errorMessage = 'Wallet extension context lost. Please refresh the page and try again.';
        } else if (err.message.includes('No address returned')) {
          errorMessage = 'No wallet address found. Please check if Freighter is unlocked and try again.';
        } else if (err.message.includes('Connection was rejected')) {
          errorMessage = 'Connection was rejected. Please approve the connection in your Freighter extension.';
        } else if (err.message.includes('Freighter wallet extension not found')) {
          errorMessage = 'Freighter wallet extension not found. Please install Freighter first.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setError(null);
  }, []);

  // Check connection on mount and when window gains focus
  useEffect(() => {
    checkConnection();

    const handleFocus = () => {
      checkConnection();
    };

    // Add retry mechanism for extension context issues
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(() => checkConnection(), 1000); // Retry after 1 second
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkConnection]);

  return {
    account,
    isLoading,
    error,
    connect,
    disconnect,
    checkConnection
  };
} 