import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const admin = supabaseAdmin()

    // Find user by email or username
    const query = email
      ? admin.from('users').select('*').eq('email', email)
      : admin.from('users').select('*').eq('username', username)

    const { data: user, error: userError } = await query.single()

    if (userError || !user) {
      console.log('[v0] User not found:', email || username)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      console.log('[v0] Invalid password for user:', user.id)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    )

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    console.log('[v0] User logged in successfully:', user.id)

    // Return user data and token
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        balance: user.balance,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
