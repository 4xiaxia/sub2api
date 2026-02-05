import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch usage logs
    const { data: logs, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate statistics
    const stats = {
      totalRequests: logs.length,
      totalTokens: logs.reduce((sum, log) => sum + (log.total_tokens || 0), 0),
      totalCost: logs.reduce((sum, log) => sum + (log.cost || 0), 0),
      successfulRequests: logs.filter(log => log.status === 'success').length,
      failedRequests: logs.filter(log => log.status === 'error').length,
    }

    return NextResponse.json({ stats, logs })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // This is called from the proxy when forwarding requests
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      )
    }

    const { model, inputTokens, outputTokens, cost, status, model: upstreamProvider } = await request.json()

    // This would be implemented with proper key validation and logging
    // For now, return success
    return NextResponse.json({ message: 'Usage logged' })
  } catch (error) {
    console.error('Error logging usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
