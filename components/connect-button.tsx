import React from 'react';
import { useConnect } from '@/hooks/useConnect';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

interface ConnectButtonProps {
  label?: string;
}

export function ConnectButton({ label = "Connect Wallet" }: ConnectButtonProps) {
  const { isLoading, connect } = useConnect();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Wallet connection error:', err);
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