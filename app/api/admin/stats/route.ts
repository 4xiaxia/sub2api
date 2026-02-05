import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { checkIsAdmin } from '@/lib/supabase/admin-check'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token || !(await checkIsAdmin(token))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Get active users (users with usage in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeUsersData } = await supabase
      .from('usage_logs')
      .select('user_id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString())

    const activeUsers = new Set(activeUsersData?.map(log => log.user_id) || []).size

    // Get total API keys
    const { count: totalKeys } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Get usage stats
    const { data: usageLogs } = await supabase
      .from('usage_logs')
      .select('total_tokens, cost, status')

    const usageStats = {
      totalRequests: usageLogs?.length || 0,
      totalTokens: usageLogs?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0,
      totalCost: usageLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0,
      successfulRequests: usageLogs?.filter(log => log.status === 'success').length || 0,
      failedRequests: usageLogs?.filter(log => log.status === 'error').length || 0,
    }

    // Get subscription stats
    const { count: totalSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('is_active', true)

    // Get account balance info
    const { data: balanceData } = await supabase
      .from('users')
      .select('balance, total_spent')

    const balanceStats = {
      totalBalance: balanceData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0,
      totalSpent: balanceData?.reduce((sum, user) => sum + (user.total_spent || 0), 0) || 0,
    }

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        active: activeUsers,
      },
      apiKeys: {
        total: totalKeys || 0,
      },
      subscriptions: {
        active: totalSubscriptions || 0,
      },
      usage: usageStats,
      balance: balanceStats,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
