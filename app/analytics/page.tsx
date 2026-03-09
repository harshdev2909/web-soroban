"use client"

import { useEffect, useState } from "react"
import {
  analyticsApi,
  systemApi,
  UsageSummaryResponse,
  HealthResponse,
  ActivityLogEntry,
  PlatformPaymentItem,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BarChart3, Server, Receipt, ListTodo, ExternalLink } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface DailyUsagePoint {
  date: string
  compile: number
  deploy: number
  function_test: number
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<UsageSummaryResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<PlatformPaymentItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [usageResponse, healthResponse, activityRes, transactionsRes] = await Promise.all([
          analyticsApi.getUsageSummary(),
          systemApi.getHealth(),
          analyticsApi.getActivityLogs(50),
          analyticsApi.getAllTransactions(50),
        ])

        setSummary(usageResponse)
        setHealth(healthResponse)
        setActivityLogs(activityRes.success ? activityRes.logs : [])
        setTransactionHistory(transactionsRes.success ? transactionsRes.payments : [])
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
    })) ?? []

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background via-background to-background/80 px-6 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform-wide stats for WebSoroban: usage, backend health, transaction history, and user activity.
            </p>
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noreferrer"
            >
              <Activity className="mr-2 h-4 w-4" />
              Open Vercel Analytics
            </a>
          </Button> */}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Project usage
              </CardTitle>
              <CardDescription>Aggregate activity across all users in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Total events
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {summary?.summary?.totalEvents ?? 0}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Unique users: {summary?.summary?.uniqueUsers ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Deployments
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {summary?.summary?.totals?.deploy ?? 0}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    In the last 30 days
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Compilations
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {summary?.summary?.totals?.compile ?? 0}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Function tests:{" "}
                    {summary?.summary?.totals?.function_test ?? 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4 text-emerald-500" />
                Backend API health
              </CardTitle>
              <CardDescription>Live status from the backend health endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    health?.status === "healthy"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {health?.status ?? "unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">MongoDB</span>
                <span className="text-xs font-medium">
                  {health?.mongodb ?? "unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last check</span>
                <span className="text-xs">
                  {health?.timestamp
                    ? new Date(health.timestamp).toLocaleString()
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-sky-500" />
              Backend usage timeline
            </CardTitle>
            <CardDescription>
              Recent compile, deploy, and function test activity over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyUsage.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No usage data available yet. Run a compile, deploy, or contract
                test in the IDE to start populating this chart.
              </p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="compile" stackId="a" fill="#38bdf8" name="Compile" />
                    <Bar dataKey="deploy" stackId="a" fill="#22c55e" name="Deploy" />
                    <Bar
                      dataKey="function_test"
                      stackId="a"
                      fill="#a855f7"
                      name="Function tests"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction history (all users) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-amber-500" />
              Transaction history
            </CardTitle>
            <CardDescription>
              Recent payment transactions (XLM) across all users for subscription upgrades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {transactionHistory.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium">
                        {tx.plan === "plan2" ? "Pro" : "Team"} — {tx.amount} {tx.currency}
                      </span>
                      {tx.user?.email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {tx.user.email}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[220px]">
                        {tx.txHash}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : tx.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                      <a
                        href={`https://stellar.expert/explorer/${tx.network}/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title="View on Stellar Expert"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <div className="w-full text-xs text-muted-foreground">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User activity log (all users) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-indigo-500" />
              User activity log
            </CardTitle>
            <CardDescription>
              Recent compile, deploy, and function test activity across all users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity yet. Use the IDE to compile, deploy, or run function tests.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {activityLogs.map((log, idx) => (
                  <div
                    key={log._id ?? idx}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase shrink-0 ${
                          log.action === "deploy"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : log.action === "compile"
                              ? "bg-sky-500/10 text-sky-500"
                              : "bg-violet-500/10 text-violet-500"
                        }`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                      {log.success ? (
                        <span className="text-emerald-500 text-xs shrink-0">Success</span>
                      ) : (
                        <span className="text-red-500 text-xs shrink-0">Failed</span>
                      )}
                      {log.user?.email && (
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {log.user.email}
                        </span>
                      )}
                      {log.contractAddress && (
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                          {log.contractAddress.slice(0, 8)}…
                        </span>
                      )}
                      {log.functionName && (
                        <span className="text-xs text-muted-foreground">
                          {log.functionName}()
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

