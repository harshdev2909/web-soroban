import { useEffect, useState } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";

// returning the same object identity every time avoids unnecessary re-renders
const addressObject = {
  address: '',
  displayName: '',
};

const addressToHistoricObject = (address: string) => {
  addressObject.address = address;
  addressObject.displayName = `${address.slice(0, 4)}...${address.slice(-4)}`;
  return addressObject;
};

/**
 * Returns an object containing `address` and `displayName` properties, with
 * the address fetched from Freighter's `getAddress` method in a
 * render-friendly way.
 *
 * Before the address is fetched, returns null.
 *
 * Caches the result so that the Freighter lookup only happens once, no matter
 * how many times this hook is called.
 *
 * NOTE: This does not update the return value if the user changes their
 * Freighter settings; they will need to refresh the page.
 */
export function useAccount(): typeof addressObject | null {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddress = async () => {
    try {
      if (await isConnected()) {
        const result = await getAddress();
        if (!result.error && result.address) {
          setAddress(result.address);
        }
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletConnected = (event: CustomEvent) => {
      if (event.detail?.address) {
        setAddress(event.detail.address);
      }
    };

    window.addEventListener('walletConnected', handleWalletConnected as EventListener);
    return () => window.removeEventListener('walletConnected', handleWalletConnected as EventListener);
  }, []);

  if (address) return addressToHistoricObject(address);

  return null;
} 