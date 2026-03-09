"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { indexerApi, getApiKey } from "@/lib/devApi";
import type { IndexedTransaction } from "@/lib/devApi";

export default function AccountExplorerPage() {
  const params = useParams();
  const router = useRouter();
  const address = (params?.address as string) || "";
  const [inputAddress, setInputAddress] = useState(address);
  const [txs, setTxs] = useState<IndexedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const load = async (addr: string, cursor?: string) => {
    if (!addr.trim()) return;
    const key = getApiKey();
    if (!key) {
      toast.error("Set an API key in Explorer or Dashboard → API Keys.");
      return;
    }
    setLoading(true);
    try {
      const res = await indexerApi.getAccountTransactions(addr.trim(), 20, cursor);
      if (cursor) {
        setTxs((prev) => [...prev, ...res.transactions]);
      } else {
        setTxs(res.transactions || []);
      }
      setNextCursor(res.nextCursor);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      setInputAddress(address);
      load(address);
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAddress.trim()) {
      router.push(`/explorer/account/${encodeURIComponent(inputAddress.trim())}`);
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
          <Link href="/explorer" className="flex items-center gap-2 font-semibold mr-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Explorer
          </Link>
        </div>
      </header>
      <main className="container py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Account activity</h1>
            <p className="text-muted-foreground mt-1">Transactions where this account is the sender (indexed data).</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account address</CardTitle>
              <CardDescription>Enter a Stellar account address (G...).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="G..."
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  className="font-mono"
                />
                <Button type="submit" disabled={loading}>Search</Button>
              </form>
            </CardContent>
          </Card>

          {address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Transactions</span>
                  <div className="flex items-center gap-2 font-mono text-sm font-normal text-muted-foreground">
                    {address.slice(0, 12)}...
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(address)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>From indexer (requires API key).</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && txs.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : txs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No transactions found for this account.</p>
                ) : (
                  <div className="space-y-2">
                    {txs.map((tx) => (
                      <div
                        key={tx.hash}
                        className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm"
                      >
                        <div className="min-w-0">
                          <Link href={`/explorer?hash=${encodeURIComponent(tx.hash)}`} className="font-mono text-primary hover:underline truncate block" title={tx.hash}>
                            {tx.hash.slice(0, 16)}...
                          </Link>
                          <span className="text-muted-foreground">Ledger {tx.ledger} · {tx.status}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {tx.contract && (
                            <Link href={`/explorer/contract/${tx.contract}`} className="text-xs text-muted-foreground hover:underline">
                              Contract
                            </Link>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(tx.hash)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {nextCursor && (
                      <Button variant="outline" className="w-full mt-2" disabled={loading} onClick={() => load(address, nextCursor)}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Load more
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
