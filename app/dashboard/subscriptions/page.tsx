'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Subscription {
  id: string
  name: string
  description: string
  credits: number
  used_credits: number
  price: number
  billing_cycle: string
  is_active: boolean
  start_date: string
  end_date: string
  created_at: string
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, session } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && session) {
      fetchSubscriptions()
    }
  }, [isAuthenticated, session, loading, router])

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          is_active: false,
          end_date: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (!error) {
        await fetchSubscriptions()
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
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
          <h1 className="text-2xl font-bold">Subscriptions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Basic Plan */}
            <Card className="p-6 border-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Basic</h3>
                  <p className="text-2xl font-bold mt-2">$10<span className="text-sm text-muted-foreground">/month</span></p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>✓ 100K tokens/month</p>
                  <p>✓ 10 API keys</p>
                  <p>✓ 60 requests/minute</p>
                </div>
                <Button className="w-full">Subscribe</Button>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-6 border-2 border-primary">
              <div className="space-y-4">
                <div>
                  <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-xs rounded-full mb-2">
                    Popular
                  </div>
                  <h3 className="text-lg font-bold">Pro</h3>
                  <p className="text-2xl font-bold mt-2">$50<span className="text-sm text-muted-foreground">/month</span></p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>✓ 1M tokens/month</p>
                  <p>✓ Unlimited API keys</p>
                  <p>✓ 500 requests/minute</p>
                  <p>✓ Priority support</p>
                </div>
                <Button className="w-full">Subscribe</Button>
              </div>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-6 border-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Enterprise</h3>
                  <p className="text-2xl font-bold mt-2">Custom</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>✓ Unlimited tokens</p>
                  <p>✓ Unlimited API keys</p>
                  <p>✓ Custom rate limits</p>
                  <p>✓ Dedicated support</p>
                </div>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </Card>
          </div>

          {/* Active Subscriptions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Your Subscriptions</h2>
            {subscriptions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You don't have any active subscriptions yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a plan above to get started.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <Card key={sub.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{sub.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sub.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.is_active ? 'Active' : 'Canceled'}
                          </span>
                        </div>
                        {sub.description && (
                          <p className="text-sm text-muted-foreground mb-4">{sub.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Credits</p>
                            <p className="font-bold">{sub.credits.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Used</p>
                            <p className="font-bold">{sub.used_credits.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-bold">${sub.price.toFixed(2)}/{sub.billing_cycle}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="font-bold">
                              {((sub.used_credits / sub.credits) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((sub.used_credits / sub.credits) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      {sub.is_active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelSubscription(sub.id)}
                          className="ml-4"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Billing Info */}
          <Card className="p-6 bg-muted">
            <h2 className="text-lg font-bold mb-4">Billing Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Billing Cycle:</strong> Monthly - Charges on the same date each month
              </p>
              <p>
                <strong>Payment Method:</strong> Credit card on file
              </p>
              <p>
                <strong>Cancellation:</strong> Cancel anytime, no additional charges after cancellation
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
