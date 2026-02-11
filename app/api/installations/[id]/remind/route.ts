import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'

// POST send reminder and update status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      )
    }

    // Send SMS reminder via Telnyx
    const smsResult = await sendSMS({
      to: phoneNumber,
      body: 'Reminder: Your AT&T installation is scheduled. Please confirm your availability. Reply STOP to opt out.',
    })

    if (!smsResult.success) {
      console.error('Failed to send reminder:', smsResult.error)
      return NextResponse.json(
        { error: 'Failed to send reminder SMS' },
        { status: 500 }
      )
    }

    // Update reminder status
    const installation = await prisma.installation.update({
      where: { id },
      data: {
        reminderSent: true,
        updatedAt: new Date(),
      },
    })

    console.log(`Reminder sent to ${phoneNumber} for installation ${id}, SMS ID: ${smsResult.id}`)

    return NextResponse.json({ 
      installation, 
      message: 'Reminder sent',
      smsId: smsResult.id 
    })
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
