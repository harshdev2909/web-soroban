import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet } from 'lucide-react';

export function WalletTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testWalletConnection = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addResult('Starting wallet connection test...');
      
      // Check if we're in browser
      if (typeof window === 'undefined') {
        addResult('❌ Running on server side');
        return;
      }
      
      addResult('✅ Running in browser');
      
      // Try to import Freighter API to check if it's available
      try {
        const { getAddress, getNetwork, isConnected, requestAccess } = await import('@stellar/freighter-api');
        addResult('✅ Freighter API imported successfully');
        
        // Check connection status
        const connected = await isConnected();
        addResult(`Connection status: ${JSON.stringify(connected)}`);
        
        if (!connected.isConnected) {
          addResult('❌ Wallet not connected, trying to request access...');
          
          const accessResult = await requestAccess();
          addResult(`Access result: ${JSON.stringify(accessResult)}`);
          
          if (accessResult.error) {
            addResult(`❌ Failed to request access: ${accessResult.error}`);
            return;
          }
          
          addResult('✅ Access granted');
        } else {
          addResult('✅ Wallet already connected');
        }
        
        // Get address
        const addressResult = await getAddress();
        addResult(`Address result: ${JSON.stringify(addressResult)}`);
        
        if (addressResult.error) {
          addResult(`❌ Failed to get address: ${addressResult.error}`);
          return;
        }
        
        addResult(`✅ Wallet address: ${addressResult.address}`);
        
        // Get network
        const networkResult = await getNetwork();
        addResult(`Network result: ${JSON.stringify(networkResult)}`);
        
        if (networkResult.error) {
          addResult(`❌ Failed to get network: ${networkResult.error}`);
          return;
        }
        
        addResult(`✅ Network: ${networkResult.network}`);
        addResult('✅ Wallet connection test completed successfully!');
        
      } catch (importError) {
        addResult(`❌ Failed to import Freighter API: ${importError}`);
        addResult('Please install Freighter from: https://freighter.app/');
      }
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm text-gray-200 flex items-center">
          <Wallet className="w-4 h-4 mr-2" />
          Wallet Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={testWalletConnection}
          disabled={isTesting}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          {isTesting ? 'Testing...' : 'Test Wallet Connection'}
        </Button>
        
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-xs font-mono">
              {result}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 