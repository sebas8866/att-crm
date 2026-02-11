import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE - Clear all conversations and messages (for reset)
export async function DELETE() {
  try {
    // Delete all messages first (due to foreign key constraints)
    await prisma.message.deleteMany({});
    
    // Delete all conversations
    await prisma.conversation.deleteMany({});
    
    // Delete all installations
    await prisma.installation.deleteMany({});
    
    // Delete all commissions
    await prisma.commission.deleteMany({});
    
    // Delete all availability checks
    await prisma.availabilityCheck.deleteMany({});
    
    // Delete all calls
    await prisma.call.deleteMany({});
    
    // Keep customers but reset their info
    await prisma.customer.updateMany({
      data: {
        address: null,
        city: null,
        state: null,
        zipCode: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All conversations, messages, and related data cleared. Customers preserved.' 
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}

// GET - Check all customers and their phone numbers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        phoneNumber: true,
        name: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
