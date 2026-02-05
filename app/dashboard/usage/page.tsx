'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface UsageLog {
  id: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  status: string
  created_at: string
}

interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  successfulRequests: number
  failedRequests: number
}

export default function UsagePage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, session } = useAuth()
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && session) {
      fetchUsageData()
    }
  }, [isAuthenticated, session, loading, router, days])

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`/api/usage?days=${days}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Usage History</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold">{stats?.totalRequests || 0}</p>
                <p className="text-xs text-muted-foreground">Last {days} days</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Tokens</p>
                <p className="text-3xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Input + Output</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-3xl font-bold">${stats?.totalCost.toFixed(4) || '0.0000'}</p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">
                  {stats?.totalRequests ? 
                    ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) : 
                    '0'
                  }%
                </p>
                <p className="text-xs text-muted-foreground">Successful requests</p>
              </div>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
              >
                Last {d} days
              </Button>
            ))}
          </div>

          {/* Usage Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Model</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Input Tokens</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Output Tokens</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Total Tokens</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Cost</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No usage data available
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm font-mono">{log.model || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-right">{log.input_tokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right">{log.output_tokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold">{log.total_tokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right">${log.cost.toFixed(6)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
