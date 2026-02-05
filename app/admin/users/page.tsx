'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface User {
  id: string
  email: string
  username: string
  display_name: string
  balance: number
  total_spent: number
  is_admin: boolean
  is_active: boolean
  created_at: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, session } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && session && user) {
      checkAdminStatus()
    }
  }, [isAuthenticated, session, user, loading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin, currentPage, search])

  const checkAdminStatus = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (userData?.is_admin) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        setLoadingData(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      setLoadingData(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch(
        `/api/admin/users?page=${currentPage}&search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${authSession.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentState: boolean) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentState,
        }),
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleToggleActive = async (userId: string, currentState: boolean) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          userId,
          isActive: !currentState,
        }),
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession) return

      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (loading || loadingData) {
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
              You do not have permission to access this page.
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/admin" className="text-muted-foreground hover:text-foreground mb-2 inline-block">
                ← Admin Dashboard
              </Link>
              <h1 className="text-2xl font-bold">Manage Users</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search by email or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="max-w-md"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {users.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No users found</p>
            </Card>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Admin</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Active</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{u.email}</td>
                        <td className="px-4 py-3 text-sm">{u.username}</td>
                        <td className="px-4 py-3 text-sm font-mono">${u.balance.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={u.is_admin ? 'default' : 'outline'}
                            onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                          >
                            {u.is_admin ? 'Admin' : 'User'}
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={u.is_active ? 'default' : 'outline'}
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                          >
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-2">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(
                            Math.ceil(pagination.total / pagination.limit),
                            currentPage + 1
                          )
                        )
                      }
                      disabled={currentPage >= Math.ceil(pagination.total / pagination.limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
