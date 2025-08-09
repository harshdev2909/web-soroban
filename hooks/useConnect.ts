import { useState, useCallback } from "react";
import { requestAccess } from "@stellar/freighter-api";

export function useConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Cannot connect wallet on server side');
      }

      // Request access to Freighter
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        throw new Error(`Failed to request access: ${accessResult.error}`);
      }

      if (!accessResult.address) {
        throw new Error('No address returned from wallet');
      }

      // Success - dispatch an event to notify other components
      console.log('Wallet connected successfully:', accessResult.address);
      
      // Dispatch a custom event to notify useAccount hook
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { address: accessResult.address } 
      }));
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { connect, isLoading };
} 