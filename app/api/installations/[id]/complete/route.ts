import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const COMMISSION_AMOUNT = 200

// POST complete installation and create commission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { customerId, customerName } = body

    // Update installation status
    const installation = await prisma.installation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
    })

    // Create commission
    const commission = await prisma.commission.create({
      data: {
        customerId,
        customerName: customerName || 'Unknown Customer',
        amount: COMMISSION_AMOUNT,
        status: 'EARNED',
        type: 'SALE',
        installDate: new Date(),
      },
    })

    return NextResponse.json({ installation, commission })
  } catch (error) {
    console.error('Error completing installation:', error)
    return NextResponse.json(
      { error: 'Failed to complete installation' },
      { status: 500 }
    )
  }
}
