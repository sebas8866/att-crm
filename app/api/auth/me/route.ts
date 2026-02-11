import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'info@myhomepromotions.com'
const ADMIN_PASSWORD = 'CallCenterATT2006@'

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth-token')
    
    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Decode token to get email
    const decoded = Buffer.from(authCookie.value, 'base64').toString('utf-8')
    const [email] = decoded.split(':')
    const normalizedEmail = email.toLowerCase().trim()

    // Check if admin
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({
        user: {
          email: ADMIN_EMAIL,
          name: 'Administrator',
          role: 'ADMIN',
          isAdmin: true,
        }
      })
    }

    // Check database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'ADMIN',
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
