"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { indexerApi, getApiKey, setApiKey } from "@/lib/devApi";
import type { IndexedTransaction } from "@/lib/devApi";

function ExplorerPageContent() {
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");
  const [tx, setTx] = useState<IndexedTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey() || "");

  useEffect(() => {
    const q = searchParams.get("hash");
    if (q && q.trim()) {
      setHash(q.trim());
      if (getApiKey()) {
        setLoading(true);
        setTx(null);
        indexerApi.getTransaction(q.trim())
          .then((res) => setTx(res.transaction))
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, [searchParams]);

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      toast.success("API key saved");
    }
  };

  const handleSearch = async () => {
    if (!hash.trim()) return;
    const key = getApiKey();
    if (!key) {
      toast.error("Set an API key to query the indexer. Get one from Dashboard → API Keys.");
      return;
    }
    setLoading(true);
    setTx(null);
    try {
      const res = await indexerApi.getTransaction(hash.trim());
      setTx(res.transaction);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction not found";
      toast.error(msg === "Transaction not found"
        ? "Transaction not found in index or on RPC. Check the hash and network (testnet/mainnet)."
        : msg);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Link href="/dashboard/api-keys" className="flex items-center gap-2 font-semibold mr-8 text-muted-foreground hover:text-foreground">
            ← Developer Tools
          </Link>
        </div>
      </header>
      <main className="container py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Blockchain Explorer</h1>
            <p className="text-muted-foreground mt-1">Look up transactions and view account or contract activity from indexed data.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Transaction by hash
              </CardTitle>
              <CardDescription>Enter a transaction hash to fetch details. API key required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>API key (for indexer)</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="X-API-KEY"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={saveApiKey}>Save</Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Transaction hash"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="font-mono"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {tx && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction</CardTitle>
                <CardDescription>Indexed transaction details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Hash</span>
                  <div className="flex items-center gap-2 font-mono truncate max-w-[320px]">
                    {tx.hash}
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copy(tx.hash)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Ledger</span>
                  <span>{tx.ledger}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={tx.success ? "text-green-600" : "text-destructive"}>{tx.status}</span>
                </div>
                {tx.from && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">From</span>
                    <Link href={`/explorer/account/${tx.from}`} className="font-mono text-primary hover:underline truncate max-w-[240px]">
                      {tx.from}
                    </Link>
                  </div>
                )}
                {tx.contract && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Contract</span>
                    <Link href={`/explorer/contract/${tx.contract}`} className="font-mono text-primary hover:underline truncate max-w-[240px]">
                      {tx.contract}
                    </Link>
                  </div>
                )}
                {tx.function && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Function</span>
                    <span className="font-mono">{tx.function}</span>
                  </div>
                )}
                {tx.timestamp && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
              <CardDescription>View account or contract activity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/explorer/account">
                <Button variant="outline" className="gap-2">
                  Account activity <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explorer/contract">
                <Button variant="outline" className="gap-2">
                  Contract events <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ExplorerFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container flex h-14 items-center px-4">
          <Link href="/dashboard/api-keys" className="flex items-center gap-2 font-semibold mr-8 text-muted-foreground hover:text-foreground">
            ← Developer Tools
          </Link>
        </div>
      </header>
      <main className="container py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={<ExplorerFallback />}>
      <ExplorerPageContent />
    </Suspense>
  );
}
