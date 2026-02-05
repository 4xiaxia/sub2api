import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import crypto from 'crypto'

// Generate a random API key
function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex')
}

// Hash API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function GET(request: NextRequest) {
  try {
    // Get the session
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

    // Fetch user's API keys (without showing the full key)
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, name, rate_limit_rpm, rate_limit_tpm, is_active, last_used_at, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, rateLimitRpm, rateLimitTpm } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Key name is required' },
        { status: 400 }
      )
    }

    // Generate API key
    const rawKey = generateApiKey()
    const keyHash = hashApiKey(rawKey)

    // Store hashed key in database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        rate_limit_rpm: rateLimitRpm || 60,
        rate_limit_tpm: rateLimitTpm || 90000,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Return the raw key only once (can't be retrieved later)
    return NextResponse.json({
      message: 'API key created successfully. Save it somewhere safe!',
      key: rawKey,
      metadata: data,
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
