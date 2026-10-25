"use client"

import { useEffect, useState } from "react"
import {
  analyticsApi,
  systemApi,
  UsageSummaryResponse,
  HealthResponse,
  ActivityLogEntry,
  PlatformPaymentItem,
  AdminUserItem,
  BillingSummaryResponse,
} from "@/lib/api"
import PlaygroundNavbar from "@/components/playground-navbar"
import PlaygroundFooter from "@/components/playground-footer"
import { Reveal } from "@/components/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3, Server, Receipt, ListTodo, ExternalLink, Copy, Check,
  Activity, Hammer, Rocket, FlaskConical, Users, Zap, Search,
  Coins, Wallet, DollarSign, Sparkles, ShoppingCart,
} from "lucide-react"
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { explorerContract, explorerTx, getNetwork, type NetworkId } from "@/lib/networks"

interface DailyUsagePoint {
  date: string
  compile: number
  deploy: number
  function_test: number
  invoke: number
}

// Brand-aligned chart colors (literal hsl, recharts needs concrete values).
const CHART = {
  compile: "hsl(200 90% 66%)", // info
  deploy: "hsl(152 60% 54%)", // success
  function_test: "hsl(280 70% 70%)", // cosmic
  invoke: "hsl(251 95% 75%)", // brand
  grid: "hsl(40 7% 14%)",
  axis: "hsl(40 8% 60%)",
  surface: "hsl(40 8% 9%)",
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<UsageSummaryResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<PlatformPaymentItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [billing, setBilling] = useState<BillingSummaryResponse["billing"] | null>(null)
  const [userQuery, setUserQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyContractAddress = (address: string, id: string) => {
    void navigator.clipboard.writeText(address)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [usageResponse, healthResponse, activityRes, transactionsRes, usersRes, billingRes] = await Promise.all([
          analyticsApi.getUsageSummary(),
          systemApi.getHealth(),
          analyticsApi.getActivityLogs(50),
          analyticsApi.getAllTransactions(50),
          analyticsApi.getUsers("", 200),
          // Tolerate an older backend without the billing endpoint.
          analyticsApi.getBillingSummary().catch(() => null),
        ])
        setSummary(usageResponse)
        setHealth(healthResponse)
        setActivityLogs(activityRes.success ? activityRes.logs : [])
        setTransactionHistory(transactionsRes.success ? transactionsRes.payments : [])
        setUsers(usersRes.success ? usersRes.users : [])
        setUsersTotal(usersRes.total ?? 0)
        setBilling(billingRes?.success ? billingRes.billing : null)
      } catch (err: unknown) {
        console.error("Failed to load analytics:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const dailyUsage: DailyUsagePoint[] =
    summary?.daily?.map((d) => ({
      date: d.date,
      compile: d.compile,
      deploy: d.deploy,
      function_test: d.function_test,
      invoke: d.invoke ?? 0,
    })) ?? []

  const totals = summary?.summary?.totals
  const deployNet = summary?.summary?.deployByNetwork
  const invokeNet = summary?.summary?.invokeByNetwork
  const kpis = [
    { label: "Total events", value: summary?.summary?.totalEvents ?? 0, hint: "last 30 days", icon: Zap, tint: "text-brand" },
    { label: "Unique users", value: summary?.summary?.uniqueUsers ?? 0, hint: "active", icon: Users, tint: "text-cosmic" },
    {
      label: "Deployments",
      value: totals?.deploy ?? 0,
      hint: "testnet + mainnet",
      icon: Rocket,
      tint: "text-success",
      split: deployNet ? { testnet: deployNet.testnet ?? 0, mainnet: deployNet.mainnet ?? 0 } : undefined,
    },
    {
      label: "Invocations",
      value: totals?.invoke ?? 0,
      hint: "write calls",
      icon: Activity,
      tint: "text-brand",
      split: invokeNet ? { testnet: invokeNet.testnet ?? 0, mainnet: invokeNet.mainnet ?? 0 } : undefined,
    },
    { label: "Compilations", value: totals?.compile ?? 0, hint: "builds", icon: Hammer, tint: "text-info" },
    { label: "Function tests", value: totals?.function_test ?? 0, hint: "saved-test runs", icon: FlaskConical, tint: "text-warning" },
  ]

  const healthy = health?.status === "healthy"

  const q = userQuery.trim().toLowerCase()
  const filteredUsers = q
    ? users.filter((u) => u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q))
    : users

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PlaygroundNavbar />

      <main className="mx-auto max-w-7xl px-6">
        {/* Hero */}
        <section className="border-b border-border pb-10 pt-14 lg:pt-20">
          <Reveal className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow">Platform analytics</p>
              <h1 className="mt-4 font-display text-display-lg font-medium">WebSoroban at a glance.</h1>
            </div>
            <p className="lead text-base lg:col-span-5">
              Platform-wide usage, backend health, transactions, and activity across all users.
            </p>
          </Reveal>
        </section>

        {error && (
          <Alert variant="destructive" className="mb-6 mt-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KPI tiles */}
        <section className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-background p-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-5 h-7 w-16" />
                  <Skeleton className="mt-2 h-3 w-12" />
                </div>
              ))
            : kpis.map((k, i) => {
                const Icon = k.icon
                return (
                  <Reveal key={k.label} delay={Math.min(i * 0.04, 0.2)} className="bg-background p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">{k.label}</span>
                      <Icon className={cn("h-3.5 w-3.5", k.tint)} />
                    </div>
                    <div className="mt-4 font-mono-tnum text-2xl font-medium text-foreground">
                      {k.value.toLocaleString()}
                    </div>
                    {(k as any).split ? (
                      <DeploySplit split={(k as any).split} />
                    ) : (
                      <div className="mt-1 font-mono text-[0.62rem] text-muted-foreground">{k.hint}</div>
                    )}
                  </Reveal>
                )
              })}
        </section>

        {/* Credits & billing (AI credit economy via Dodo) */}
        <section className="mt-6">
          <Panel
            icon={Coins}
            title="Credits & billing"
            subtitle={
              billing
                ? `${billing.outstandingCredits.toLocaleString()} credits outstanding across ${billing.totalUsers.toLocaleString()} users · margin = credits charged vs model cost.`
                : "AI credit economy (Dodo Payments)."
            }
          >
            {loading ? (
              <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-card p-4"><Skeleton className="h-3 w-20" /><Skeleton className="mt-5 h-7 w-16" /></div>)}
              </div>
            ) : !billing ? (
              <EmptyHint>No billing data yet.</EmptyHint>
            ) : (
              <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
                <CreditTile icon={Wallet} tint="text-brand" label="Outstanding" value={billing.outstandingCredits} hint="unspent credits (liability)" />
                <CreditTile icon={ShoppingCart} tint="text-success" label="Purchased" value={billing.purchased} hint={`${billing.purchaseCount.toLocaleString()} purchase${billing.purchaseCount === 1 ? "" : "s"}`} />
                <CreditTile icon={Zap} tint="text-cosmic" label="Spent" value={billing.spent} hint="consumed by runs" />
                <CreditTile icon={Sparkles} tint="text-warning" label="Free granted" value={billing.granted} hint="signup credits" />
                <CreditTile icon={Activity} tint="text-info" label="AI runs" value={billing.ai.runs} hint={`${billing.last30d.runs.toLocaleString()} in 30d`} />
                <CreditTile icon={DollarSign} tint="text-success" label="Model cost" value={`$${billing.ai.costUsd.toFixed(2)}`} hint={`$${billing.last30d.costUsd.toFixed(2)} in 30d`} />
              </div>
            )}
          </Panel>
        </section>

        {/* Users directory */}
        <section className="mt-6">
          <Panel
            icon={Users}
            title="Users"
            subtitle={loading ? "Loading registered users…" : `${usersTotal.toLocaleString()} registered ${usersTotal === 1 ? "user" : "users"}.`}
          >
            {loading ? (
              <ListSkeleton />
            ) : users.length === 0 ? (
              <EmptyHint>No users yet.</EmptyHint>
            ) : (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search by email or name…"
                    aria-label="Search users"
                    className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 font-mono text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Column header (md+) */}
                <div className="hidden items-center gap-3 border-b border-border px-3 pb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground md:flex">
                  <span className="min-w-0 flex-1">User</span>
                  <span className="w-14 text-center">Plan</span>
                  <span className="w-16 text-right">Credits</span>
                  <span className="w-16 text-right">Projects</span>
                  <span className="w-16 text-right">Deploys</span>
                  <span className="w-16 text-right">Invokes</span>
                  <span className="w-24 text-right">Joined</span>
                  <span className="w-16 text-right">Status</span>
                </div>

                <div className="max-h-[460px] divide-y divide-border overflow-y-auto rounded-md border border-border">
                  {filteredUsers.length === 0 ? (
                    <EmptyHint>No users match “{userQuery}”.</EmptyHint>
                  ) : (
                    filteredUsers.map((u) => <UserRow key={u.id} u={u} />)
                  )}
                </div>

                {usersTotal > users.length && (
                  <p className="px-1 font-mono text-[0.62rem] text-muted-foreground">
                    Showing the newest {users.length.toLocaleString()} of {usersTotal.toLocaleString()} users.
                  </p>
                )}
              </div>
            )}
          </Panel>
        </section>

        {/* Health + chart */}
        <section className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Usage timeline */}
          <Panel icon={BarChart3} title="Usage timeline" subtitle="Compile, deploy, and function-test activity over time." className="lg:col-span-8">
            {loading ? (
              <Skeleton className="h-72 w-full rounded-md" />
            ) : dailyUsage.length === 0 ? (
              <EmptyHint>No usage data yet. Compile, deploy, or test a contract in the IDE to populate this chart.</EmptyHint>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyUsage} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis dataKey="date" tick={{ fill: CHART.axis, fontSize: 11 }} stroke={CHART.grid} />
                    <YAxis allowDecimals={false} tick={{ fill: CHART.axis, fontSize: 11 }} stroke={CHART.grid} />
                    <Tooltip
                      cursor={{ fill: "hsl(40 7% 13% / 0.5)" }}
                      contentStyle={{
                        background: CHART.surface,
                        border: `1px solid ${CHART.grid}`,
                        borderRadius: 6,
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "hsl(40 20% 93%)",
                      }}
                      labelStyle={{ color: CHART.axis }}
                    />
                    <Bar dataKey="compile" stackId="a" fill={CHART.compile} name="Compile" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="deploy" stackId="a" fill={CHART.deploy} name="Deploy" />
                    <Bar dataKey="function_test" stackId="a" fill={CHART.function_test} name="Function tests" />
                    <Bar dataKey="invoke" stackId="a" fill={CHART.invoke} name="Invocations" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {!loading && dailyUsage.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Legend color={CHART.compile} label="Compile" />
                <Legend color={CHART.deploy} label="Deploy" />
                <Legend color={CHART.function_test} label="Function tests" />
                <Legend color={CHART.invoke} label="Invocations" />
              </div>
            )}
          </Panel>

          {/* Backend health */}
          <Panel icon={Server} title="Backend health" subtitle="Live status from the API." className="lg:col-span-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ) : (
              <dl className="divide-y divide-border text-sm">
                <div className="flex items-center justify-between py-3">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Status</dt>
                  <dd>
                    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em]", healthy ? "text-success" : "text-destructive")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", healthy ? "bg-success" : "bg-destructive")} />
                      {health?.status ?? "unknown"}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Database</dt>
                  <dd className="font-mono text-xs text-foreground">{health?.database ?? "unknown"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Last check</dt>
                  <dd className="truncate font-mono-tnum text-xs text-muted-foreground">
                    {health?.timestamp ? new Date(health.timestamp).toLocaleString() : "—"}
                  </dd>
                </div>
              </dl>
            )}
          </Panel>
        </section>

        {/* Transactions */}
        <section className="mt-6">
          <Panel icon={Receipt} title="Transaction history" subtitle="Recent XLM payments across all users.">
            {loading ? (
              <ListSkeleton />
            ) : transactionHistory.length === 0 ? (
              <EmptyHint>No transactions yet.</EmptyHint>
            ) : (
              <div className="max-h-[360px] divide-y divide-border overflow-y-auto rounded-md border border-border">
                {transactionHistory.map((tx) => (
                  <div key={tx._id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {tx.plan === "plan2" ? "Pro" : "Team"} · {tx.amount} {tx.currency}
                      </span>
                      {tx.user?.email && <span className="truncate text-xs text-muted-foreground">{tx.user.email}</span>}
                      <span className="max-w-[220px] truncate font-mono text-[0.68rem] text-muted-foreground">{tx.txHash}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={tx.status} />
                      <a
                        href={explorerTx((tx.network as NetworkId) || "testnet", tx.txHash)}
                        target="_blank" rel="noreferrer"
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-brand"
                        title="View on Stellar Expert"
                        aria-label="View on Stellar Expert"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="w-full font-mono-tnum text-[0.68rem] text-muted-foreground">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* Activity log */}
        <section className="mb-24 mt-6">
          <Panel icon={ListTodo} title="User activity" subtitle="Recent compile, deploy, and test activity across all users.">
            {loading ? (
              <ListSkeleton />
            ) : activityLogs.length === 0 ? (
              <EmptyHint>No activity yet.</EmptyHint>
            ) : (
              <div className="max-h-[420px] divide-y divide-border overflow-y-auto rounded-md border border-border">
                {activityLogs.map((log, idx) => (
                  <div key={log._id ?? idx} className="flex flex-col gap-2 px-3 py-3 text-sm">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <ActionBadge action={log.action} />
                        {log.action !== "compile" && <NetworkBadge network={log.network} />}
                        <span className={cn("text-xs", log.success ? "text-success" : "text-destructive")}>
                          {log.success ? "Success" : "Failed"}
                        </span>
                        {log.user?.email && <span className="max-w-[160px] truncate text-xs text-muted-foreground">{log.user.email}</span>}
                        {log.functionName && <span className="font-mono text-xs text-muted-foreground">{log.functionName}()</span>}
                      </div>
                      <span className="shrink-0 font-mono-tnum text-[0.68rem] text-muted-foreground">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    {log.contractAddress && (
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="min-w-0 break-all rounded-sm border border-border px-1.5 py-0.5 font-mono text-[0.68rem] text-foreground">
                          {log.contractAddress}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyContractAddress(log.contractAddress!, log._id)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                          title="Copy address"
                          aria-label="Copy address"
                        >
                          {copiedId === log._id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <a
                          href={explorerContract((log.network as NetworkId) || "testnet", log.contractAddress!)}
                          target="_blank" rel="noreferrer"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-brand"
                          title="View on Stellar Expert"
                          aria-label="View on Stellar Expert"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>
      </main>

      <PlaygroundFooter />
    </div>
  )
}

/* ---- small presentational helpers ---- */

function Panel({ icon: Icon, title, subtitle, className, children }: { icon: any; title: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("figure p-5", className)}>
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-display text-lg font-medium text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p>}
        </div>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      {children}
    </section>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border px-4 py-6 font-mono text-[0.72rem] text-muted-foreground">
      <Activity className="h-4 w-4 shrink-0 text-muted-foreground/60" />
      {children}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const label = plan === "plan3" || plan === "team" ? "Team" : plan === "plan2" || plan === "pro" ? "Pro" : "Free"
  const cls =
    label === "Team" ? "bg-cosmic/15 text-cosmic" : label === "Pro" ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
  return <span className={cn("inline-block rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]", cls)}>{label}</span>
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("text-right font-mono-tnum text-xs text-foreground", className)}>
      <span className="mr-1 text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground md:hidden">{label}</span>
      {value.toLocaleString()}
    </div>
  )
}

function CreditTile({
  icon: Icon,
  tint,
  label,
  value,
  hint,
}: {
  icon: any
  tint: string
  label: string
  value: number | string
  hint: string
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <Icon className={cn("h-3.5 w-3.5", tint)} />
      </div>
      <div className="mt-4 font-mono-tnum text-2xl font-medium text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 truncate font-mono text-[0.62rem] text-muted-foreground">{hint}</div>
    </div>
  )
}

function UserRow({ u }: { u: AdminUserItem }) {
  const initials = (u.name || u.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "U"
  return (
    <div className="flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center md:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-accent font-mono text-[0.6rem] text-foreground">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm text-foreground">{u.name || u.email}</div>
          {u.name && <div className="truncate font-mono text-[0.68rem] text-muted-foreground">{u.email}</div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 md:flex-nowrap md:pl-0">
        <div className="w-14 text-center"><PlanBadge plan={u.plan} /></div>
        <div className="flex w-16 items-center justify-end gap-1 font-mono-tnum text-[0.68rem] tabular-nums">
          <span className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground md:hidden">credits</span>
          <Coins className="h-3 w-3 text-brand" />
          <span className={cn(u.credits <= 0 ? "text-destructive" : "text-foreground")}>{(u.credits ?? 0).toLocaleString()}</span>
        </div>
        <Stat className="w-16" label="proj" value={u.projects} />
        <Stat className="w-16" label="dep" value={u.deployments} />
        <Stat className="w-16" label="inv" value={u.invocations} />
        <div className="w-24 text-right font-mono-tnum text-[0.68rem] text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString()}
        </div>
        <div className="w-16 text-right">
          <span
            className={cn(
              "rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]",
              u.isActive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            {u.isActive ? "active" : "off"}
          </span>
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "confirmed"
      ? "bg-success/12 text-success"
      : status === "pending"
      ? "bg-warning/12 text-warning"
      : "bg-destructive/12 text-destructive"
  return <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]", cls)}>{status}</span>
}

function DeploySplit({ split }: { split: { testnet: number; mainnet: number } }) {
  const total = split.testnet + split.mainnet
  const testnetPct = total > 0 ? (split.testnet / total) * 100 : 0
  return (
    <div className="mt-1">
      <div className="mt-2 flex h-1 w-full overflow-hidden rounded-sm bg-muted">
        <span className="h-full bg-success" style={{ width: `${testnetPct}%` }} />
        <span className="h-full bg-warning" style={{ width: `${100 - testnetPct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center gap-2 font-mono-tnum text-[0.6rem] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />{split.testnet} testnet</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />{split.mainnet} mainnet</span>
      </div>
    </div>
  )
}

function NetworkBadge({ network }: { network?: string }) {
  const net = getNetwork(network === "mainnet" ? "mainnet" : "testnet")
  return (
    <span className={cn("shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]", net.badgeClass)}>
      {net.label}
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const cls =
    action === "deploy"
      ? "bg-success/12 text-success"
      : action === "compile"
      ? "bg-info/12 text-info"
      : action === "invoke"
      ? "bg-brand/12 text-brand"
      : "bg-cosmic/12 text-cosmic"
  return (
    <span className={cn("shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em]", cls)}>
      {action.replace("_", " ")}
    </span>
  )
}
