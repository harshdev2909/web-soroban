"use client";

import { RpcTester } from "@/components/devtools/RpcTester";

export default function RpcPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RPC Tester</h1>
        <p className="text-muted-foreground mt-1">
          Test Soroban RPC methods (getLatestLedger, getLedgers, getTransaction, etc.) through WebSoroban.
        </p>
      </div>
      <RpcTester />
    </div>
  );
}
