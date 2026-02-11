import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// Admin credentials from environment variables only
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedAdminEmail = (ADMIN_EMAIL || '').toLowerCase().trim()

    // Check admin credentials
    if (normalizedEmail === normalizedAdminEmail) {
      // Check if password hash is configured
      if (!ADMIN_PASSWORD_HASH) {
        console.error('ADMIN_PASSWORD_HASH not configured')
        return NextResponse.json(
          { error: 'Authentication not configured' },
          { status: 500 }
        )
      }

      const isValidAdmin = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      
      if (!isValidAdmin) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      
      const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString('base64')
      
      const response = NextResponse.json({ 
        success: true, 
        user: { 
          email: ADMIN_EMAIL, 
          name: 'Administrator', 
          role: 'ADMIN' 
        } 
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
      
      return response
    }

    // Check database users
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
