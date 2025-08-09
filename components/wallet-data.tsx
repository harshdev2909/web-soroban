import React from 'react';
import { useAccount } from '@/hooks/useAccount';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ConnectButton } from './connect-button';
import { Wallet } from 'lucide-react';

export function WalletData() {
  const mounted = useIsMounted();
  const account = useAccount();

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

  return <ConnectButton label="Connect Wallet" />;
} 