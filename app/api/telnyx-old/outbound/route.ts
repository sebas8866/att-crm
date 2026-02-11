import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'

// GET - Check Telnyx configuration
export async function GET() {
  const hasApiKey = !!process.env.TELNYX_API_KEY
  const hasPhoneNumber = !!process.env.TELNYX_PHONE_NUMBER
  
  return NextResponse.json({
    configured: hasApiKey && hasPhoneNumber,
    apiKey: hasApiKey ? 'Set (hidden)' : 'NOT SET',
    phoneNumber: process.env.TELNYX_PHONE_NUMBER || 'NOT SET',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    instructions: {
      outbound: 'POST to /api/telnyx/outbound with { to: "+1234567890", body: "Hello" }',
      webhookSetup: 'Set webhook URL in Telnyx portal: https://att-crm.vercel.app/api/telnyx/webhook'
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

    console.log('=== TELNYX OUTBOUND TEST ===')
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
