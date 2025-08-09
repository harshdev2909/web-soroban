import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

export function WalletDataSimple() {
  const mounted = useIsMounted();
  const { account, isLoading, connect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Wallet connection error:', err);
    }
  };

  if (!mounted) {
    return null;
  }

  if (account) {
    return (
      <div className="flex items-center space-x-3 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600">
        <Wallet className="w-4 h-4 text-green-400" />
        <span className="text-gray-200 font-mono text-sm">
          {account.displayName}
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-gray-800/30 rounded-lg px-3 py-2"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
} 