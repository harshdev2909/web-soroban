"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Rocket, Loader2, Copy, ExternalLink, CheckCircle2, AlertCircle, Eye, PenLine,
  Play, Save, Trash2, FlaskConical, Droplets, ChevronRight,
} from "lucide-react"
import { contractApi, type SpecFunction, type InvokeResponse, type FunctionTestCase, authApi } from "@/lib/api"
import { cn, copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-ide-production.up.railway.app/api'
const EXPLORER_TX = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`

interface InvokePanelProps {
  contractId: string
}

type FieldKind = "bool" | "address" | "int" | "bytes" | "text" | "json"

/** Classify a ScType string into an input control + validation rules. */
function classify(type: string): { kind: FieldKind; optional: boolean; bytesN?: number; unsigned?: boolean; raw: string } {
  let optional = false
  let t = type
  if (/^Option<.*>$/.test(t)) {
    optional = true
    t = t.slice(7, -1)
  }
  if (t === "bool") return { kind: "bool", optional, raw: t }
  if (t === "Address" || t === "MuxedAddress") return { kind: "address", optional, raw: t }
  if (/^(u|i)(32|64|128|256)$/.test(t) || t === "Timepoint" || t === "Duration")
    return { kind: "int", optional, unsigned: t.startsWith("u"), raw: t }
  if (/^BytesN<(\d+)>$/.test(t)) return { kind: "bytes", optional, bytesN: Number(RegExp.$1), raw: t }
  if (t === "Bytes") return { kind: "bytes", optional, raw: t }
  if (t === "Symbol" || t === "String") return { kind: "text", optional, raw: t }
  return { kind: "json", optional, raw: t } // Vec/Map/tuple/struct/enum/Udt
}

/** Validate a single raw field value; returns an error string or null. */
function validateField(type: string, value: any): string | null {
  const c = classify(type)
  const empty = value === undefined || value === null || value === ""
  if (empty) return c.optional ? null : "Required"
  switch (c.kind) {
    case "bool":
      return null
    case "address":
      return /^[GC][A-Z2-7]{55}$/.test(String(value))
        ? null
        : "Must be a valid Stellar address (G… account or C… contract)"
    case "int": {
      const s = String(value).trim()
      if (!/^-?\d+$/.test(s)) return "Must be an integer"
      if (c.unsigned && s.startsWith("-")) return "Must be a non-negative integer"
      return null
    }
    case "bytes": {
      const hex = String(value).replace(/^0x/, "")
      if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) return "Must be hex (even length)"
      if (c.bytesN && hex.length !== c.bytesN * 2) return `Must be exactly ${c.bytesN} bytes (${c.bytesN * 2} hex chars)`
      return null
    }
    case "text":
      return null
    case "json":
      try {
        JSON.parse(String(value))
        return null
      } catch {
        return "Must be valid JSON"
      }
  }
}

/** Build the args object the backend expects (keyed by param name). */
function buildArgs(fn: SpecFunction, values: Record<string, any>): Record<string, any> {
  const args: Record<string, any> = {}
  for (const input of fn.inputs) {
    const c = classify(input.type)
    const v = values[input.name]
    const empty = v === undefined || v === null || v === ""
    if (empty) {
      if (c.optional) args[input.name] = null
      continue
    }
    if (c.kind === "bool") args[input.name] = Boolean(v)
    else if (c.kind === "json") args[input.name] = JSON.parse(String(v))
    else args[input.name] = v // int sent as string, address/text/bytes as string
  }
  return args
}

export function InvokePanel({ contractId }: InvokePanelProps) {
  const [loading, setLoading] = useState(true)
  const [functions, setFunctions] = useState<SpecFunction[]>([])
  const [specError, setSpecError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string>("")
  const [values, setValues] = useState<Record<string, any>>({})
  const [running, setRunning] = useState(false)
  const [signing, setSigning] = useState(false)
  const [result, setResult] = useState<InvokeResponse | null>(null)
  const [funding, setFunding] = useState(false)

  // Saved tests
  const [tests, setTests] = useState<FunctionTestCase[]>([])
  const [runningTests, setRunningTests] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, { status: string; error?: string | null }>>({})

  const fn = functions.find((f) => f.name === selected)

  const loadSpec = useCallback(async () => {
    setLoading(true)
    setSpecError(null)
    try {
      const res = await contractApi.getSpec(contractId)
      if (res.success && res.functions) {
        setFunctions(res.functions)
        setSelected(res.functions[0]?.name ?? "")
      } else {
        setSpecError(res.error || "Contract spec unavailable")
      }
    } catch (e: any) {
      setSpecError(e.message || "Failed to load contract spec")
    } finally {
      setLoading(false)
    }
  }, [contractId])

  const loadTests = useCallback(async () => {
    try {
      const res = await contractApi.listTests(contractId)
      if (res.success) setTests(res.tests)
    } catch {
      /* non-fatal */
    }
  }, [contractId])

  useEffect(() => {
    loadSpec()
    loadTests()
  }, [loadSpec, loadTests])

  // Reset form state when switching functions.
  useEffect(() => {
    setValues({})
    setResult(null)
  }, [selected])

  const fieldErrors: Record<string, string | null> = {}
  if (fn) for (const input of fn.inputs) fieldErrors[input.name] = validateField(input.type, values[input.name])
  const isValid = fn ? fn.inputs.every((i) => !fieldErrors[i.name]) : false

  const setField = (name: string, value: any) => setValues((prev) => ({ ...prev, [name]: value }))

  const run = async (execute: boolean) => {
    if (!fn) return
    execute ? setSigning(true) : setRunning(true)
    try {
      const args = buildArgs(fn, values)
      const res = await contractApi.invoke(contractId, fn.name, args, { execute })
      setResult(res)
      if (res.success && execute && res.status === "success") toast.success("Transaction confirmed")
      else if (!res.success) toast.error(res.error || "Invocation failed")
    } catch (e: any) {
      setResult({ success: false, readOnly: true, status: "failed", error: e.message })
      toast.error(e.message)
    } finally {
      setRunning(false)
      setSigning(false)
    }
  }

  const fundWallet = async () => {
    setFunding(true)
    try {
      const token = authApi.getToken()
      const res = await fetch(`${API_BASE_URL}/wallet/fund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      const data = await res.json()
      if (data.success) toast.success(`Wallet funded · balance ${Number(data.balance).toFixed(2)} XLM`)
      else toast.error(data.error || "Faucet failed")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setFunding(false)
    }
  }

  const saveTest = async () => {
    if (!fn) return
    const name = window.prompt(`Name this test case for ${fn.name}:`, `${fn.name} case`)
    if (!name) return
    try {
      const res = await contractApi.saveTest(contractId, {
        functionName: fn.name,
        name,
        args: buildArgs(fn, values),
        expected: result?.returnValue !== undefined ? { mode: "equals", value: result.returnValue } : { mode: "success" },
      })
      if (res.success) {
        toast.success("Test saved")
        loadTests()
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const runAllTests = async () => {
    setRunningTests(true)
    setTestResults({})
    try {
      const res = await contractApi.runTests(contractId)
      if (!res.success || !Array.isArray(res.results)) {
        toast.error(res.error || "Failed to run tests", {
          description: res.upgradeRequired ? "Function-test limit reached — upgrade your plan." : undefined,
        })
        return
      }
      const map: Record<string, { status: string; error?: string | null }> = {}
      for (const r of res.results) map[r.testId] = { status: r.status, error: r.error }
      setTestResults(map)
      toast[res.passed === res.total ? "success" : "error"](`${res.passed}/${res.total} tests passed`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setRunningTests(false)
    }
  }

  const deleteTest = async (id: string) => {
    try {
      await contractApi.deleteTest(contractId, id)
      loadTests()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  // ---- render ----
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-2/3 rounded-md" />
      </div>
    )
  }

  if (specError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/70 px-4 py-8 text-center">
        <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-xs text-foreground">{specError}</p>
        <button onClick={loadSpec} className="text-xs text-brand hover:underline">Retry</button>
      </div>
    )
  }

  const isWritePreview = result && result.success && !result.readOnly && result.status === "simulated"
  const passed = Object.values(testResults).filter((r) => r.status === "pass").length

  return (
    <div className="space-y-4">
      {/* Function selector */}
      <div className="space-y-1.5">
        <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Function</Label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="h-9 bg-background/60 text-sm">
            <SelectValue placeholder="Select a function…" />
          </SelectTrigger>
          <SelectContent>
            {functions.map((f) => (
              <SelectItem key={f.name} value={f.name} className="font-mono text-xs">
                {f.name}({f.inputs.map((i) => i.name).join(", ")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fn?.doc && <p className="text-[11px] leading-relaxed text-muted-foreground">{fn.doc}</p>}
      </div>

      {/* Typed parameter inputs */}
      {fn && fn.inputs.length > 0 && (
        <div className="space-y-3">
          {fn.inputs.map((input) => {
            const c = classify(input.type)
            const err = fieldErrors[input.name]
            return (
              <div key={input.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs text-foreground">
                    {input.name}
                    {c.optional && <span className="text-muted-foreground"> ?</span>}
                  </Label>
                  <span className="font-mono text-[10px] text-muted-foreground">{input.type}</span>
                </div>
                {c.kind === "bool" ? (
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(values[input.name])} onCheckedChange={(v) => setField(input.name, v)} />
                    <span className="font-mono text-xs text-muted-foreground">{values[input.name] ? "true" : "false"}</span>
                  </div>
                ) : c.kind === "json" ? (
                  <Textarea
                    value={values[input.name] ?? ""}
                    onChange={(e) => setField(input.name, e.target.value)}
                    placeholder={c.raw.startsWith("Vec") ? "[ … ]" : c.raw.startsWith("Map") ? "{ … }" : "JSON value"}
                    className={cn("min-h-[64px] bg-background/60 font-mono text-xs", err && "border-destructive")}
                  />
                ) : (
                  <Input
                    value={values[input.name] ?? ""}
                    onChange={(e) => setField(input.name, e.target.value)}
                    placeholder={
                      c.kind === "address" ? "G… or C…" : c.kind === "bytes" ? "hex" : c.kind === "int" ? "123" : input.name
                    }
                    className={cn("h-9 bg-background/60 font-mono text-xs", err && "border-destructive")}
                  />
                )}
                {err && <p className="text-[10px] text-destructive">{err}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Run / sign actions */}
      {fn && (
        <div className="space-y-2">
          {!isWritePreview ? (
            <Button onClick={() => run(false)} disabled={!isValid || running} className="w-full gap-1.5">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {running ? "Running…" : "Run (simulate)"}
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-md bg-warning/10 px-2.5 py-2 text-[11px] text-warning">
                <PenLine className="h-3.5 w-3.5 shrink-0" />
                State-changing call — review the simulated result, then sign &amp; submit.
              </div>
              <Button onClick={() => run(true)} disabled={signing} className="w-full gap-1.5">
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {signing ? "Submitting…" : "Invoke & sign"}
              </Button>
              <Button onClick={() => run(false)} variant="outline" disabled={signing} className="w-full">
                Re-simulate
              </Button>
            </>
          )}
          {result && (
            <button onClick={saveTest} className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Save className="h-3.5 w-3.5" /> Save as test case
            </button>
          )}
        </div>
      )}

      {/* Result / error panel */}
      {result && <ResultPanel result={result} onFund={fundWallet} funding={funding} />}

      {/* Saved tests */}
      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <FlaskConical className="h-3.5 w-3.5" /> Tests
            {tests.length > 0 && Object.keys(testResults).length > 0 && (
              <span className={cn("ml-1", passed === tests.length ? "text-success" : "text-warning")}>
                {passed}/{tests.length}
              </span>
            )}
          </div>
          {tests.length > 0 && (
            <Button onClick={runAllTests} disabled={runningTests} size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
              {runningTests ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              Run all
            </Button>
          )}
        </div>
        {tests.length === 0 ? (
          <p className="py-2 text-center text-[11px] text-muted-foreground/70">
            No saved tests. Run a function and “Save as test case”.
          </p>
        ) : (
          <ul className="space-y-1">
            {tests.map((t) => {
              const r = testResults[t.id]
              return (
                <li key={t.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent/50">
                  {r ? (
                    r.status === "pass" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    )
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-foreground">{t.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{t.functionName}</span>
                  <button
                    onClick={() => deleteTest(t.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete test"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function ResultPanel({ result, onFund, funding }: { result: InvokeResponse; onFund: () => void; funding: boolean }) {
  const ok = result.success
  const showFaucet = !ok && /balance|fund|faucet|insufficient/i.test(result.error || "")
  const pretty = (v: any) =>
    v === undefined || v === null ? "—" : typeof v === "string" ? v : JSON.stringify(v, null, 2)

  return (
    <div
      className={cn(
        "space-y-2.5 rounded-lg border p-3",
        ok ? "border-success/30 bg-success/[0.05]" : "border-destructive/30 bg-destructive/[0.05]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider", ok ? "text-success" : "text-destructive")}>
          {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {result.status}
          {result.readOnly && ok && <span className="text-muted-foreground"> · read-only</span>}
        </span>
        {result.resourceFee && (
          <span className="font-mono text-[10px] text-muted-foreground">fee {result.resourceFee} stroops</span>
        )}
      </div>

      {ok ? (
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Return</div>
          <pre className="max-h-48 overflow-auto rounded bg-background/60 p-2 font-mono text-[11px] text-foreground/90">
            {pretty(result.returnValue ?? result.result)}
          </pre>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-destructive">{result.error}</p>
          {showFaucet && (
            <Button onClick={onFund} disabled={funding} size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              {funding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Droplets className="h-3.5 w-3.5" />}
              Fund via faucet
            </Button>
          )}
        </div>
      )}

      {result.txHash && (
        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
          <button
            onClick={() => copyToClipboard(result.txHash!).then((okk) => okk && toast.success("Tx hash copied"))}
            className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            title={result.txHash}
          >
            <Copy className="h-3 w-3 shrink-0" />
            <span className="truncate">{result.txHash.slice(0, 10)}…{result.txHash.slice(-6)}</span>
          </button>
          <a
            href={EXPLORER_TX(result.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-brand hover:underline"
          >
            stellar.expert <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {result.events && result.events.length > 0 && (
        <div className="border-t border-border/50 pt-2">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Events</div>
          <pre className="max-h-32 overflow-auto rounded bg-background/60 p-2 font-mono text-[10px] text-muted-foreground">
            {JSON.stringify(result.events, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
