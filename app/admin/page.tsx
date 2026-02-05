'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface AdminStats {
  users: {
    total: number
    active: number
  }
  apiKeys: {
    total: number
  }
  subscriptions: {
    active: number
  }
  usage: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    successfulRequests: number
    failedRequests: number
  }
  balance: {
    totalBalance: number
    totalSpent: number
  }
}

interface UserData {
  id: string
  is_admin: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [adminCheckDone, setAdminCheckDone] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && session && user) {
      checkAdminStatus()
    }
  }, [isAuthenticated, session, user, loading, router])

  const checkAdminStatus = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (userData?.is_admin) {
        setIsAdmin(true)
        await fetchAdminStats()
      } else {
        setIsAdmin(false)
        setAdminCheckDone(true)
        setLoadingData(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setAdminCheckDone(true)
      setLoadingData(false)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setAdminCheckDone(true)
      setLoadingData(false)
    }
  }

  if (loading || loadingData || !adminCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the admin dashboard.
            </p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.users.active || 0} active (30d)
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">API Keys</p>
                <p className="text-3xl font-bold">{stats?.apiKeys.total || 0}</p>
                <p className="text-xs text-muted-foreground">Active keys</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-3xl font-bold">{stats?.subscriptions.active || 0}</p>
                <p className="text-xs text-muted-foreground">Current plans</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Usage Cost</p>
                <p className="text-3xl font-bold">${stats?.usage.totalCost.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
            </Card>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-3xl font-bold">{(stats?.usage.totalRequests || 0).toLocaleString()}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>✓ {(stats?.usage.successfulRequests || 0).toLocaleString()}</span>
                  <span>✗ {(stats?.usage.failedRequests || 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                <p className="text-3xl font-bold">{(stats?.usage.totalTokens || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account Balances</p>
                <p className="text-3xl font-bold">${stats?.balance.totalBalance.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-muted-foreground">
                  Spent: ${stats?.balance.totalSpent.toFixed(2) || '0.00'}
                </p>
              </div>
            </Card>
          </div>

          {/* Management Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage user accounts
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/accounts">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">Admin Accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage upstream provider accounts
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/subscriptions">
              <Card className="p-6 cursor-pointer hover:bg-accent transition-colors">
                <div className="space-y-2">
                  <h3 className="font-bold">Subscriptions</h3>
                  <p className="text-sm text-muted-foreground">
                    View subscription plans
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
