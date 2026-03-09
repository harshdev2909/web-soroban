"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AccountIndexPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/explorer/account/${encodeURIComponent(address.trim())}`);
    }
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
      <main className="container py-8 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Account activity</CardTitle>
            <CardDescription>Enter a Stellar account address (G...) to view its transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Account address</Label>
                <Input
                  id="address"
                  placeholder="G..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button type="submit" className="w-full">Search</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
