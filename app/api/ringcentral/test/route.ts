import { NextRequest, NextResponse } from 'next/server'
import { testRingCentralConnection, sendSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Testing RingCentral connection...')
    
    const result = await testRingCentralConnection()
    
    if (!result.connected) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to connect to RingCentral'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      extension: result.extension,
      name: result.name,
      phoneNumber: process.env.RINGCENTRAL_PHONE_NUMBER,
      message: 'RingCentral connection successful'
    })
  } catch (error) {
    console.error('RingCentral test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { to, body } = await req.json()
    
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      )
    }

    console.log('Sending test SMS via RingCentral:', { to, body: body.substring(0, 50) })

    const result = await sendSMS({ to, body })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
      to,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RingCentral send error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
// Rebuild trigger Wed Feb 11 12:32:22 EST 2026
