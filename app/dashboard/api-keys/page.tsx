"use client";

import { ApiKeysTable } from "@/components/devtools/ApiKeysTable";

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage API keys for the hosted RPC and indexer. Use a key in the <code className="rounded bg-muted px-1.5 py-0.5 text-xs">X-API-KEY</code> header.
        </p>
      </div>
      <ApiKeysTable />
    </div>
  );
}
