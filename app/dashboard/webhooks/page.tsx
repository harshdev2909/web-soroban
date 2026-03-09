"use client";

import { WebhookTable } from "@/components/devtools/WebhookTable";

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground mt-1">
          Subscribe to contract events. When the indexer detects a matching event, we POST to your URL.
        </p>
      </div>
      <WebhookTable />
    </div>
  );
}
