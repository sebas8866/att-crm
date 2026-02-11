import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST make an outbound call
export async function POST(req: NextRequest) {
  try {
    const { customerId, to, userId } = await req.json()

    if (!to) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        customerId: customer.id,
        phoneNumber: to,
        direction: 'OUTBOUND',
        status: 'IN_PROGRESS',
        twilioCallSid: `outbound-${Date.now()}`,
        answeredById: userId || null,
      }
    })

    // Voice calls not yet implemented with Telnyx
    // For now, we just create a call record for tracking

    return NextResponse.json({ 
      success: true, 
      call,
      message: 'Call record created. Voice integration coming soon with Telnyx.' 
    })
  } catch (error) {
    console.error('Error making call:', error)
    return NextResponse.json({ error: 'Failed to make call' }, { status: 500 })
  }
}
