import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import crypto from 'crypto'

// Verify API key
async function verifyApiKey(keyHash: string) {
  const { data, error } = await supabase
    .from('api_keys')
    .select('user_id, is_active, rate_limit_rpm, rate_limit_tpm')
    .eq('key_hash', keyHash)
    .is('deleted_at', null)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// Check rate limits
async function checkRateLimit(
  userId: string,
  keyId: string,
  rpmLimit: number,
  tpmLimit: number
) {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60000)

  // Count requests in last minute
  const { data: recentRequests } = await supabase
    .from('usage_logs')
    .select('total_tokens', { count: 'exact' })
    .eq('user_id', userId)
    .eq('api_key_id', keyId)
    .gte('created_at', oneMinuteAgo.toISOString())

  const requestCount = recentRequests?.length || 0
  const tokenCount = recentRequests?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0

  if (requestCount >= rpmLimit) {
    return { allowed: false, reason: 'rate_limit_rpm' }
  }

  if (tokenCount >= tpmLimit) {
    return { allowed: false, reason: 'rate_limit_tpm' }
  }

  return { allowed: true }
}

// Log usage
async function logUsage(
  userId: string,
  apiKeyId: string,
  request: NextRequest,
  response: Response,
  tokens: { input: number; output: number }
) {
  const cost = (tokens.input * 0.0005 + tokens.output * 0.0015) / 1000 // Example pricing

  // Calculate response time
  const startTime = request.headers.get('x-start-time')
  const responseTime = startTime ? Date.now() - parseInt(startTime) : 0

  await supabase.from('usage_logs').insert({
    user_id: userId,
    api_key_id: apiKeyId,
    model: request.headers.get('x-model') || 'unknown',
    input_tokens: tokens.input,
    output_tokens: tokens.output,
    total_tokens: tokens.input + tokens.output,
    cost,
    status: response.status === 200 ? 'success' : 'error',
    upstream_provider: request.headers.get('x-provider') || 'unknown',
    request_path: request.nextUrl.pathname,
    request_method: request.method,
    response_time_ms: responseTime,
    ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    user_agent: request.headers.get('user-agent'),
  })

  // Update user balance
  if (response.status === 200) {
    const { data: user } = await supabase
      .from('users')
      .select('balance, total_spent')
      .eq('id', userId)
      .single()

    if (user) {
      const newBalance = user.balance - cost
      const newSpent = user.total_spent + cost

      await supabase
        .from('users')
        .update({
          balance: newBalance,
          total_spent: newSpent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      // Log balance change
      await supabase.from('balance_history').insert({
        user_id: userId,
        amount: -cost,
        reason: 'api_usage',
        previous_balance: user.balance,
        new_balance: newBalance,
      })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKeyHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!apiKeyHeader) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }

    // Hash the API key
    const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex')

    // Verify API key
    const keyData = await verifyApiKey(keyHash)
    if (!keyData) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    // Check rate limits
    const rateCheck = await checkRateLimit(
      keyData.user_id,
      request.headers.get('x-key-id') || '',
      keyData.rate_limit_rpm,
      keyData.rate_limit_tpm
    )

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded: ${rateCheck.reason}` },
        { status: 429 }
      )
    }

    // Get upstream provider URL from request headers
    const upstreamUrl = request.headers.get('x-upstream-url')
    if (!upstreamUrl) {
      return NextResponse.json(
        { error: 'Missing upstream URL' },
        { status: 400 }
      )
    }

    // Forward request to upstream
    const body = await request.text()
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body || undefined,
    })

    const responseText = await upstreamResponse.text()

    // Extract token count from response (this is simplified)
    let tokens = { input: 0, output: 0 }
    try {
      const jsonResponse = JSON.parse(responseText)
      if (jsonResponse.usage) {
        tokens.input = jsonResponse.usage.prompt_tokens || 0
        tokens.output = jsonResponse.usage.completion_tokens || 0
      }
    } catch (e) {
      console.error('Error parsing upstream response:', e)
    }

    // Log usage
    const responseObj = new Response(responseText, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers,
    })

    await logUsage(keyData.user_id, request.headers.get('x-key-id') || '', request, responseObj, tokens)

    return NextResponse.json(JSON.parse(responseText), {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
