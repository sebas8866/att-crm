import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phoneNumber, email, address, city, state, zipCode } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber }
    })

    if (customer) {
      // Update if exists
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: name || customer.name,
          email: email || customer.email,
          address: address || customer.address,
          city: city || customer.city,
          state: state || customer.state,
          zipCode: zipCode || customer.zipCode,
        }
      })
    } else {
      // Create new
      customer = await prisma.customer.create({
        data: {
          name,
          phoneNumber,
          email,
          address,
          city,
          state,
          zipCode,
        }
      })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
