import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'

// GET - Check RingCentral configuration
export async function GET() {
  const hasClientId = !!process.env.RINGCENTRAL_CLIENT_ID
  const hasClientSecret = !!process.env.RINGCENTRAL_CLIENT_SECRET
  const hasJWT = !!process.env.RINGCENTRAL_JWT
  const hasPhoneNumber = !!process.env.RINGCENTRAL_PHONE_NUMBER
  
  return NextResponse.json({
    configured: hasClientId && hasClientSecret && hasJWT && hasPhoneNumber,
    clientId: hasClientId ? 'Set (hidden)' : 'NOT SET',
    clientSecret: hasClientSecret ? 'Set (hidden)' : 'NOT SET',
    jwt: hasJWT ? 'Set (hidden)' : 'NOT SET',
    phoneNumber: process.env.RINGCENTRAL_PHONE_NUMBER || 'NOT SET',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    instructions: {
      outbound: 'POST to /api/ringcentral/outbound with { to: "+1234567890", body: "Hello" }',
      webhookSetup: 'Set webhook URL in RingCentral portal: https://att-crm.vercel.app/api/ringcentral/webhook'
    }
  })
}

// POST - Send test outbound SMS
export async function POST(req: NextRequest) {
  try {
    const { to, body } = await req.json()
    
    if (!to || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      )
    }

    console.log('=== RINGCENTRAL OUTBOUND TEST ===')
    console.log('Sending to:', to)
    console.log('Body:', body)

    const result = await sendSMS({ to, body })
    
    console.log('Result:', result)

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
      body: body.substring(0, 50),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Outbound test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
