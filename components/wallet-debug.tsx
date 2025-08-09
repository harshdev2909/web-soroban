'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WalletDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    checkWalletStatus()
  }, [])

  const checkWalletStatus = async () => {
    const info: any = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server side',
      hasWindow: typeof window !== 'undefined',
    }

    if (typeof window !== 'undefined') {
      try {
        const { getAddress, isConnected, getNetwork, requestAccess } = await import('@stellar/freighter-api');
        
        // Test if Freighter is available
        const addressResult = await getAddress();
        info.hasFreighter = !addressResult.error;
        info.freighterError = addressResult.error;
        info.addressResult = addressResult;
        
        if (!addressResult.error) {
          // Test connection status
          const connectedResult = await isConnected();
          info.isConnected = connectedResult.isConnected;
          info.connectionError = connectedResult.error;
          info.connectedResult = connectedResult;
          
          // Test network
          const networkResult = await getNetwork();
          info.network = networkResult.network;
          info.networkError = networkResult.error;
          info.networkResult = networkResult;
          
          info.address = addressResult.address;
        } else {
          // If address failed, try requesting access
          console.log('Address failed, trying requestAccess...');
          try {
            const accessResult = await requestAccess();
            info.accessResult = accessResult;
            info.accessError = accessResult.error;
            if (!accessResult.error) {
              info.address = accessResult.address;
            }
          } catch (accessError) {
            info.accessError = accessError instanceof Error ? accessError.message : String(accessError);
          }
        }
      } catch (error) {
        info.freighterError = error instanceof Error ? error.message : String(error);
        info.hasFreighter = false;
      }
    }

    setDebugInfo(info)
  }

  const testFreighterConnection = async () => {
    if (typeof window === 'undefined') {
      alert('Not in browser environment')
      return
    }

    try {
      const { isConnected } = await import('@stellar/freighter-api');
      const result = await isConnected();
      alert(`Freighter isConnected: ${result.isConnected}`)
    } catch (error) {
      alert(`Freighter error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Debug Wallet
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 bg-gray-900 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-300 flex justify-between items-center">
          Wallet Debug Info
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <div>
            <strong>Has Window:</strong> {debugInfo.hasWindow ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Has Freighter:</strong> {debugInfo.hasFreighter ? 'Yes' : 'No'}
          </div>
          {debugInfo.freighterError && (
            <div className="text-red-400">
              <strong>Freighter Error:</strong> {debugInfo.freighterError}
            </div>
          )}
          {debugInfo.isConnected !== undefined && (
            <div>
              <strong>Is Connected:</strong> {debugInfo.isConnected ? 'Yes' : 'No'}
            </div>
          )}
          {debugInfo.connectionError && (
            <div className="text-red-400">
              <strong>Connection Error:</strong> {debugInfo.connectionError}
            </div>
          )}
          {debugInfo.network && (
            <div>
              <strong>Network:</strong> {debugInfo.network}
            </div>
          )}
          {debugInfo.networkError && (
            <div className="text-red-400">
              <strong>Network Error:</strong> {debugInfo.networkError}
            </div>
          )}
          {debugInfo.address && (
            <div>
              <strong>Address:</strong> {debugInfo.address}
            </div>
          )}
          {debugInfo.addressResult && (
            <div className="text-xs text-gray-400">
              <strong>Address Result:</strong> {JSON.stringify(debugInfo.addressResult)}
            </div>
          )}
          {debugInfo.accessResult && (
            <div className="text-xs text-gray-400">
              <strong>Access Result:</strong> {JSON.stringify(debugInfo.accessResult)}
            </div>
          )}
          {debugInfo.accessError && (
            <div className="text-red-400 text-xs">
              <strong>Access Error:</strong> {debugInfo.accessError}
            </div>
          )}
          <div className="pt-2 space-x-2">
            <Button
              onClick={checkWalletStatus}
              size="sm"
              variant="outline"
              className="h-6 text-xs"
            >
              Refresh
            </Button>
            <Button
              onClick={testFreighterConnection}
              size="sm"
              variant="outline"
              className="h-6 text-xs"
            >
              Test Connection
            </Button>
            <Button
              onClick={async () => {
                try {
                  const { requestAccess } = await import('@stellar/freighter-api');
                  const result = await requestAccess();
                  alert(`Access result: ${JSON.stringify(result)}`);
                  checkWalletStatus();
                } catch (error) {
                  alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
              }}
              size="sm"
              variant="outline"
              className="h-6 text-xs"
            >
              Request Access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 