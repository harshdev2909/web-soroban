import React from 'react';
import { useWalletKit } from '@/contexts/WalletKitContext';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ConnectButton } from './connect-button';
import { Wallet, X } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';

export function WalletData() {
  const mounted = useIsMounted();
  const { address, connect, disconnect, isInitialized, selectedWallet } = useWalletKit();

  if (!mounted || !isInitialized) {
    return null;
  }

  if (address) {
    const displayName = `${address.substring(0, 6)}...${address.substring(48)}`;
    
    const handleDisconnect = () => {
      disconnect();
      toast.success('Wallet disconnected');
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-green-500/20 border-2 border-green-400/50 text-green-300 hover:bg-green-500/30 hover:border-green-400 rounded-lg px-3 py-2 shadow-lg shadow-green-500/10 font-semibold"
          >
            <Wallet className="w-4 h-4 text-green-400 mr-2" />
            <span className="font-mono text-sm">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700">
          <div className="px-2 py-1.5">
            <p className="text-xs text-slate-400">Connected Wallet</p>
            <p className="text-sm text-slate-200 font-mono">{displayName}</p>
            {selectedWallet && (
              <p className="text-xs text-slate-400 mt-1">{selectedWallet.name}</p>
            )}
          </div>
          <DropdownMenuItem 
            className="text-red-400 hover:bg-slate-700 hover:text-red-300"
            onClick={handleDisconnect}
          >
            <X className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <ConnectButton label="Connect Wallet" onClick={connect} />;
} 