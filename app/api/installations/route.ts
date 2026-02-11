import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all installations
export async function GET() {
  try {
    const installations = await prisma.installation.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        installDate: 'desc',
      },
    })

    return NextResponse.json(installations)
  } catch (error) {
    console.error('Error fetching installations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch installations' },
      { status: 500 }
    )
  }
}

// POST create new installation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, phoneNumber, installDate, notes } = body

    if (!phoneNumber || !installDate) {
      return NextResponse.json(
        { error: 'Phone number and install date are required' },
        { status: 400 }
      )
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber,
          name: customerName || null,
        },
      })
    }

    // Create installation
    const installation = await prisma.installation.create({
      data: {
        customerId: customer.id,
        installDate: new Date(installDate),
        status: 'SCHEDULED',
        notes: notes || null,
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(installation)
  } catch (error) {
    console.error('Error creating installation:', error)
    return NextResponse.json(
      { error: 'Failed to create installation' },
      { status: 500 }
    )
  }
}
