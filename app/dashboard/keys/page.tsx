'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface ApiKey {
  id: string
  name: string
  rate_limit_rpm: number
  rate_limit_tpm: number
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export default function ApiKeysPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, session } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    rateLimitRpm: 60,
    rateLimitTpm: 90000,
  })
  const [loadingData, setLoadingData] = useState(true)
  const [creatingKey, setCreatingKey] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<{ key: string; name: string } | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && session) {
      fetchApiKeys()
    }
  }, [isAuthenticated, session, loading, router])

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, rate_limit_rpm, rate_limit_tpm, is_active, last_used_at, created_at')
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreateKey = async () => {
    if (!session) return

    setCreatingKey(true)
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newKeyData.name,
          rateLimitRpm: newKeyData.rateLimitRpm,
          rateLimitTpm: newKeyData.rateLimitTpm,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedKey({
          key: data.key,
          name: newKeyData.name,
        })
        setNewKeyData({ name: '', rateLimitRpm: 60, rateLimitTpm: 90000 })
        setShowForm(false)
        await fetchApiKeys()
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    } finally {
      setCreatingKey(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', keyId)

      if (!error) {
        await fetchApiKeys()
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
    }
  }

  const handleToggleKey = async (keyId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentState })
        .eq('id', keyId)

      if (!error) {
        await fetchApiKeys()
      }
    } catch (error) {
      console.error('Error toggling API key:', error)
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
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-2 inline-block">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold">API Keys</h1>
            </div>
            <Button onClick={() => setShowForm(true)}>
              Create New Key
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Generated Key Display */}
          {generatedKey && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-green-900">API Key Created: {generatedKey.name}</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Save this key somewhere safe. You won't be able to see it again!
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-green-200 font-mono text-sm break-all">
                  {generatedKey.key}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey.key)
                    }}
                    variant="outline"
                  >
                    Copy to Clipboard
                  </Button>
                  <Button onClick={() => setGeneratedKey(null)} variant="outline">
                    Done
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Create Key Form */}
          {showForm && (
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="font-bold">Create New API Key</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="e.g., Production Key"
                    value={newKeyData.name}
                    onChange={(e) =>
                      setNewKeyData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate Limit RPM</label>
                    <Input
                      type="number"
                      value={newKeyData.rateLimitRpm}
                      onChange={(e) =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          rateLimitRpm: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate Limit TPM</label>
                    <Input
                      type="number"
                      value={newKeyData.rateLimitTpm}
                      onChange={(e) =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          rateLimitTpm: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateKey} disabled={!newKeyData.name || creatingKey}>
                    {creatingKey ? 'Creating...' : 'Create Key'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* API Keys List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Your API Keys</h2>
            {apiKeys.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No API keys yet. Create one to get started.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <Card key={key.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{key.name}</h3>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                          <div>
                            <span className="block">RPM Limit</span>
                            <span className="font-mono">{key.rate_limit_rpm}</span>
                          </div>
                          <div>
                            <span className="block">TPM Limit</span>
                            <span className="font-mono">{key.rate_limit_tpm}</span>
                          </div>
                          <div>
                            <span className="block">Created</span>
                            <span className="font-mono">
                              {new Date(key.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={key.is_active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleKey(key.id, key.is_active)}
                        >
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
