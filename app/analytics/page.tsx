"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usageApi, systemApi, UsageResponse, HealthResponse } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Activity, BarChart3, Server } from "lucide-react"
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
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [usage, setUsage] = useState<UsageResponse | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [usageResponse, healthResponse] = await Promise.all([
          usageApi.getUsage(),
          systemApi.getHealth(),
        ])

        setUsage(usageResponse)
        setHealth(healthResponse)
      } catch (err: any) {
        console.error("Failed to load analytics:", err)
        setError(err.message || "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [authLoading, isAuthenticated])

  const dailyUsage: DailyUsagePoint[] = useMemo(() => {
    if (!usage?.logs || !Array.isArray(usage.logs)) return []

    const map = new Map<string, DailyUsagePoint>()

    for (const log of usage.logs as any[]) {
      if (!log || !log.createdAt || !log.action) continue
      const date = new Date(log.createdAt).toISOString().slice(0, 10)

      if (!map.has(date)) {
        map.set(date, {
          date,
          compile: 0,
          deploy: 0,
          function_test: 0,
        })
      }

      const entry = map.get(date)!
      if (log.action === "compile") entry.compile += 1
      if (log.action === "deploy") entry.deploy += 1
      if (log.action === "function_test") entry.function_test += 1
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [usage])

  if (authLoading || loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            You need to be signed in to view your analytics. Open the IDE to sign in, then return to this page.
          </AlertDescription>
        </Alert>
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
              Overview of your IDE usage, backend health, and Vercel page analytics.
            </p>
          </div>
          <Button
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
          </Button>
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
                Frontend usage
              </CardTitle>
              <CardDescription>Your usage quotas and recent activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Deployments
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {usage?.usage?.deployments?.count ?? 0}
                    {usage?.usage?.deployments?.limit &&
                    usage.usage.deployments.limit !== -1
                      ? ` / ${usage.usage.deployments.limit}`
                      : " / ∞"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Remaining:{" "}
                    {usage?.usage?.deployments?.remaining ?? "unlimited"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase text-muted-foreground">
                    Function tests
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {usage?.usage?.functionTests?.count ?? 0}
                    {usage?.usage?.functionTests?.limit &&
                    usage.usage.functionTests.limit !== -1
                      ? ` / ${usage.usage.functionTests.limit}`
                      : " / ∞"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Remaining:{" "}
                    {usage?.usage?.functionTests?.remaining ?? "unlimited"}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-violet-500" />
                Vercel analytics
              </CardTitle>
              <CardDescription>
                Page views and visitor stats are being collected for this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Vercel Analytics is enabled via the{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  &lt;Analytics /&gt;
                </code>{" "}
                component and captures traffic across all routes, including this
                dashboard.
              </p>
              <p>
                Use the button above to open the full Vercel dashboard with detailed
                breakdowns by page, country, device, and more.
              </p>
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
      </div>
    </div>
  )
}

