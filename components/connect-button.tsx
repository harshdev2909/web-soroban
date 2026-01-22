import React, { useState } from 'react';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

interface ConnectButtonProps {
  label?: string;
  onClick?: () => Promise<void> | void;
}

export function ConnectButton({ label = "Connect Wallet", onClick }: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (onClick) {
      try {
        setIsLoading(true);
        await onClick();
      } catch (err) {
        console.error('Wallet connection error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-gray-800/30 rounded-lg px-3 py-2"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isLoading ? 'Connecting...' : label}
    </Button>
  );
} 