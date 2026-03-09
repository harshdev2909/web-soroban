"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { webhooksApi, type WebhookItem } from "@/lib/devApi";

export function WebhookTable() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [eventType, setEventType] = useState("contract_event");
  const [url, setUrl] = useState("");
  const [contract, setContract] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await webhooksApi.list();
      setWebhooks(res.webhooks || []);
    } catch (e) {
      toast.error("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!url.trim()) {
      toast.error("Webhook URL is required");
      return;
    }
    setCreating(true);
    try {
      await webhooksApi.create(eventType.trim(), url.trim(), contract.trim() || undefined);
      setCreateOpen(false);
      setUrl("");
      setContract("");
      await load();
      toast.success("Webhook created");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await webhooksApi.delete(id);
      await load();
      toast.success("Webhook deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhooks
            </CardTitle>
            <CardDescription>Receive POST requests when indexed contract events match.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create webhook
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No webhooks. Create one to get notified on contract events.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event type</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last triggered</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.eventType}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate">{w.contract || "—"}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[180px] truncate" title={w.url}>{w.url}</TableCell>
                    <TableCell>
                      <span className={w.active ? "text-green-600" : "text-muted-foreground"}>{w.active ? "Active" : "Inactive"}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {w.lastTriggeredAt ? new Date(w.lastTriggeredAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === w.id}
                        onClick={() => handleDelete(w.id)}
                      >
                        {deletingId === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create webhook</DialogTitle>
            <DialogDescription>Example payload: eventType, contract, url. We will POST to your URL when events match.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event type</Label>
              <Input id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="contract_event" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contract">Contract address (optional)</Label>
              <Input id="contract" value={contract} onChange={(e) => setContract(e.target.value)} placeholder="CABC..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhook" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
