"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Play, Terminal } from "lucide-react";
import { toast } from "sonner";
import { rpcApi, getApiKey, setApiKey } from "@/lib/devApi";

const defaultBody = `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getLatestLedger",
  "params": {}
}`;

export function RpcTester() {
  const [body, setBody] = useState(defaultBody);
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey() || "");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      toast.success("API key saved for this session");
    } else {
      setApiKey("");
      toast.success("API key cleared");
    }
  };

  const handleSend = async () => {
    const key = getApiKey();
    if (!key) {
      toast.error("Set an API key first (X-API-KEY). Create one in API Keys.");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      let parsed: object | object[];
      try {
        parsed = JSON.parse(body);
      } catch {
        toast.error("Invalid JSON request body");
        setLoading(false);
        return;
      }
      const result = await rpcApi.post(parsed);
      setResponse(JSON.stringify(result, null, 2));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "RPC request failed";
      toast.error(msg);
      setResponse(JSON.stringify({ error: msg }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          RPC Tester
        </CardTitle>
        <CardDescription>Send JSON-RPC requests to the hosted Soroban RPC. Set your API key below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label>X-API-KEY (saved in browser)</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="wsk_..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="font-mono"
            />
            <Button variant="outline" onClick={saveApiKey}>Save</Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Request body (JSON-RPC)</Label>
          <textarea
            className="min-h-[200px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 font-mono text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
          />
        </div>
        <Button onClick={handleSend} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Send request
        </Button>
        {response && (
          <div className="grid gap-2">
            <Label>Response</Label>
            <pre className="rounded-md border bg-muted/30 p-4 text-sm overflow-auto max-h-[400px] whitespace-pre-wrap font-mono">
              {response}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
