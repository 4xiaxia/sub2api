import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, displayName } = await request.json()

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const admin = supabaseAdmin()

    // Check if user exists
    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const { data: newUser, error: insertError } = await admin
      .from('users')
      .insert({
        email,
        username,
        password_hash: hashedPassword,
        display_name: displayName || username,
        balance: 0,
        role: 'user',
        is_email_verified: false,
      })
      .select()
      .single()

    if (insertError || !newUser) {
      console.error('[v0] Registration insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('[v0] User registered successfully:', newUser.id)

    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        display_name: newUser.display_name,
      },
    })
  } catch (error) {
    console.error('[v0] Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
