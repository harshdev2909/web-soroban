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
  ApiError,
} from "@/lib/api"
import PlaygroundNavbar from "@/components/playground-navbar"
import PlaygroundFooter from "@/components/playground-footer"
import { LoginModal } from "@/components/login-modal"
import { Reveal } from "@/components/reveal"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3, Server, Receipt, ListTodo, ExternalLink, Copy, Check,
  Activity, Hammer, Rocket, FlaskConical, Users, Zap, Search, ShieldAlert, LogIn,
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
  compile: "hsl(200 90% 62%)", // info
  deploy: "hsl(152 58% 48%)", // success
  function_test: "hsl(280 78% 66%)", // cosmic
  invoke: "hsl(250 86% 66%)", // brand
  grid: "hsl(233 16% 16%)",
  axis: "hsl(224 12% 62%)",
  surface: "hsl(233 28% 9%)",
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<UsageSummaryResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<PlatformPaymentItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [userQuery, setUserQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState<{ status: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)

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
        setAccessDenied(null)
        const [usageResponse, healthResponse, activityRes, transactionsRes, usersRes] = await Promise.all([
          analyticsApi.getUsageSummary(),
          systemApi.getHealth(),
          analyticsApi.getActivityLogs(50),
          analyticsApi.getAllTransactions(50),
          analyticsApi.getUsers("", 200),
        ])
        setSummary(usageResponse)
        setHealth(healthResponse)
        setActivityLogs(activityRes.success ? activityRes.logs : [])
        setTransactionHistory(transactionsRes.success ? transactionsRes.payments : [])
        setUsers(usersRes.success ? usersRes.users : [])
        setUsersTotal(usersRes.total ?? 0)
      } catch (err: unknown) {
        // 401 (not signed in) / 403 (not an admin) → show the gate, not a red error.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setAccessDenied({ status: err.status })
        } else {
          console.error("Failed to load analytics:", err)
          setError(err instanceof Error ? err.message : "Failed to load analytics")
        }
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
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" aria-hidden />
      <PlaygroundNavbar onSignInClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pb-8 pt-12 sm:pt-16">
          <Reveal>
            <p className="eyebrow">Admin · Platform analytics</p>
            <h1 className="mt-3 font-display text-title font-semibold tracking-tight">
              WebSoroban <span className="text-gradient-brand">at a glance</span>
            </h1>
            <p className="lead mt-3 max-w-2xl text-[15px]">
              Platform-wide usage, backend health, transactions, and activity across all users.
            </p>
          </Reveal>
        </section>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {accessDenied ? (
          <AdminGate status={accessDenied.status} onSignIn={() => setLoginOpen(true)} />
        ) : (
        <>
        {/* KPI tiles */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : kpis.map((k, i) => {
                const Icon = k.icon
                return (
                  <Reveal key={k.label} delay={Math.min(i * 0.04, 0.2)}>
                    <div className="rounded-xl border border-border bg-card/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</span>
                        <Icon className={cn("h-3.5 w-3.5", k.tint)} />
                      </div>
                      <div className="mt-2 font-mono-tnum text-2xl font-semibold text-foreground">
                        {k.value.toLocaleString()}
                      </div>
                      {(k as any).split ? (
                        <DeploySplit split={(k as any).split} />
                      ) : (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{k.hint}</div>
                      )}
                    </div>
                  </Reveal>
                )
              })}
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
                    className="w-full rounded-lg border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/50 focus:outline-none"
                  />
                </div>

                {/* Column header (md+) */}
                <div className="hidden items-center gap-3 border-b border-border/60 px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:flex">
                  <span className="min-w-0 flex-1">User</span>
                  <span className="w-14 text-center">Plan</span>
                  <span className="w-16 text-right">Projects</span>
                  <span className="w-16 text-right">Deploys</span>
                  <span className="w-16 text-right">Invokes</span>
                  <span className="w-24 text-right">Joined</span>
                  <span className="w-16 text-right">Status</span>
                </div>

                <div className="max-h-[460px] space-y-1.5 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <EmptyHint>No users match “{userQuery}”.</EmptyHint>
                  ) : (
                    filteredUsers.map((u) => <UserRow key={u.id} u={u} />)
                  )}
                </div>

                {usersTotal > users.length && (
                  <p className="px-1 text-[11px] text-muted-foreground/70">
                    Showing the newest {users.length.toLocaleString()} of {usersTotal.toLocaleString()} users.
                  </p>
                )}
              </div>
            )}
          </Panel>
        </section>

        {/* Health + chart */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Usage timeline */}
          <Panel icon={BarChart3} title="Usage timeline" subtitle="Compile, deploy, and function-test activity over time.">
            {loading ? (
              <Skeleton className="h-72 w-full rounded-lg" />
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
                      cursor={{ fill: "hsl(233 20% 16% / 0.4)" }}
                      contentStyle={{
                        background: CHART.surface,
                        border: `1px solid ${CHART.grid}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: "hsl(220 18% 96%)",
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
              <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                <Legend color={CHART.compile} label="Compile" />
                <Legend color={CHART.deploy} label="Deploy" />
                <Legend color={CHART.function_test} label="Function tests" />
                <Legend color={CHART.invoke} label="Invocations" />
              </div>
            )}
          </Panel>

          {/* Backend health */}
          <Panel icon={Server} title="Backend health" subtitle="Live status from the API.">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]", healthy ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", healthy ? "bg-success" : "bg-destructive")} />
                      {health?.status ?? "unknown"}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Database</dt>
                  <dd className="font-mono text-xs text-foreground/90">{health?.database ?? "unknown"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Last check</dt>
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
              <div className="max-h-[360px] space-y-1.5 overflow-y-auto">
                {transactionHistory.map((tx) => (
                  <div key={tx._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {tx.plan === "plan2" ? "Pro" : "Team"} · {tx.amount} {tx.currency}
                      </span>
                      {tx.user?.email && <span className="truncate text-xs text-muted-foreground">{tx.user.email}</span>}
                      <span className="max-w-[220px] truncate font-mono text-[11px] text-muted-foreground">{tx.txHash}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={tx.status} />
                      <a
                        href={explorerTx((tx.network as NetworkId) || "testnet", tx.txHash)}
                        target="_blank" rel="noreferrer"
                        className="text-muted-foreground transition-colors hover:text-brand"
                        title="View on Stellar Expert"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="w-full font-mono-tnum text-[11px] text-muted-foreground/70">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* Activity log */}
        <section className="mb-16 mt-6">
          <Panel icon={ListTodo} title="User activity" subtitle="Recent compile, deploy, and test activity across all users.">
            {loading ? (
              <ListSkeleton />
            ) : activityLogs.length === 0 ? (
              <EmptyHint>No activity yet.</EmptyHint>
            ) : (
              <div className="max-h-[420px] space-y-1.5 overflow-y-auto">
                {activityLogs.map((log, idx) => (
                  <div key={log._id ?? idx} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm">
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
                      <span className="shrink-0 font-mono-tnum text-[11px] text-muted-foreground/70">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </span>
                    </div>
                    {log.contractAddress && (
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="min-w-0 break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                          {log.contractAddress}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyContractAddress(log.contractAddress!, log._id)}
                          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Copy address"
                        >
                          {copiedId === log._id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <a
                          href={explorerContract((log.network as NetworkId) || "testnet", log.contractAddress!)}
                          target="_blank" rel="noreferrer"
                          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-brand"
                          title="View on Stellar Expert"
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
        </>
        )}
      </main>

      <PlaygroundFooter />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}

/* ---- small presentational helpers ---- */

function Panel({ icon: Icon, title, subtitle, children }: { icon: any; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card/40 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand/12 text-brand">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 px-4 py-6 text-[13px] text-muted-foreground">
      <Activity className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      {children}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}

function AdminGate({ status, onSignIn }: { status: number; onSignIn: () => void }) {
  const notSignedIn = status === 401
  return (
    <div className="mx-auto mb-16 flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card/40 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-warning/12 text-warning">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {notSignedIn ? "Sign in required" : "Admin access required"}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {notSignedIn
            ? "The analytics dashboard is restricted to administrators. Sign in with an admin account to continue."
            : "This account doesn't have access to the analytics dashboard. Contact an administrator if you think this is a mistake."}
        </p>
      </div>
      {notSignedIn && (
        <button
          onClick={onSignIn}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
        >
          <LogIn className="h-4 w-4" /> Sign in
        </button>
      )}
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const label = plan === "plan3" || plan === "team" ? "Team" : plan === "plan2" || plan === "pro" ? "Pro" : "Free"
  const cls =
    label === "Team" ? "bg-cosmic/15 text-cosmic" : label === "Pro" ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
  return <span className={cn("inline-block rounded-full px-2 py-0.5 font-mono text-[10px]", cls)}>{label}</span>
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("text-right font-mono-tnum text-xs text-foreground/90", className)}>
      <span className="mr-1 text-[10px] text-muted-foreground md:hidden">{label}</span>
      {value.toLocaleString()}
    </div>
  )
}

function UserRow({ u }: { u: AdminUserItem }) {
  const initials = (u.name || u.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "U"
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 md:flex-row md:items-center md:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/12 font-mono text-[10px] font-semibold text-brand">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm text-foreground">{u.name || u.email}</div>
          {u.name && <div className="truncate text-[11px] text-muted-foreground">{u.email}</div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 md:flex-nowrap md:pl-0">
        <div className="w-14 text-center"><PlanBadge plan={u.plan} /></div>
        <Stat className="w-16" label="proj" value={u.projects} />
        <Stat className="w-16" label="dep" value={u.deployments} />
        <Stat className="w-16" label="inv" value={u.invocations} />
        <div className="w-24 text-right font-mono-tnum text-[11px] text-muted-foreground">
          {new Date(u.createdAt).toLocaleDateString()}
        </div>
        <div className="w-16 text-right">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px]",
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
      <span className="h-2 w-2 rounded-[3px]" style={{ background: color }} />
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
  return <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px]", cls)}>{status}</span>
}

function DeploySplit({ split }: { split: { testnet: number; mainnet: number } }) {
  const total = split.testnet + split.mainnet
  const testnetPct = total > 0 ? (split.testnet / total) * 100 : 0
  return (
    <div className="mt-1">
      <div className="flex h-1 w-full overflow-hidden rounded-full bg-muted">
        <span className="h-full bg-success" style={{ width: `${testnetPct}%` }} />
        <span className="h-full bg-warning" style={{ width: `${100 - testnetPct}%` }} />
      </div>
      <div className="mt-1 flex items-center gap-2 font-mono-tnum text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />{split.testnet} testnet</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />{split.mainnet} mainnet</span>
      </div>
    </div>
  )
}

function NetworkBadge({ network }: { network?: string }) {
  const net = getNetwork(network === "mainnet" ? "mainnet" : "testnet")
  return (
    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", net.badgeClass)}>
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
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", cls)}>
      {action.replace("_", " ")}
    </span>
  )
}
