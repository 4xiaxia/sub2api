'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string
  display_name: string
  balance: number
}

interface UsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  successfulRequests: number
  failedRequests: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, signOut } = useAuth()
  const [userData, setUserData] = useState<User | null>(null)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && user) {
      fetchUserData()
      fetchUsageStats()
    }
  }, [isAuthenticated, user, loading, router])

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchUsageStats = async () => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/usage?days=30', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sub2API</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {userData?.display_name || user?.email}!
            </h2>
            <p className="text-muted-foreground">
              Manage your API keys and subscriptions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account Balance</p>
                <p className="text-3xl font-bold">${userData?.balance.toFixed(2) || '0.00'}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Requests (30d)</p>
                <p className="text-3xl font-bold">{stats?.totalRequests || 0}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                <p className="text-3xl font-bold">{(stats?.totalTokens || 0).toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Cost (30d)</p>
                <p className="text-3xl font-bold">${stats?.totalCost.toFixed(4) || '0.0000'}</p>
              </div>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/keys">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">API Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your API keys and rate limits
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/usage">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">Usage History</h3>
                  <p className="text-sm text-muted-foreground">
                    View detailed usage and cost breakdown
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard/subscriptions">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription plans
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
