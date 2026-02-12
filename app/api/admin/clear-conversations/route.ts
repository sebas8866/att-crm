import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE endpoint to clear all conversation data
export async function DELETE() {
  try {
    console.log('=== CLEARING ALL CONVERSATION DATA ===');
    
    // Delete all messages first (due to foreign key constraints)
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`Deleted ${deletedMessages.count} messages`);
    
    // Delete all conversations
    const deletedConversations = await prisma.conversation.deleteMany({});
    console.log(`Deleted ${deletedConversations.count} conversations`);
    
    // Optionally delete customers too (commented out - keep customer data)
    // const deletedCustomers = await prisma.customer.deleteMany({});
    // console.log(`Deleted ${deletedCustomers.count} customers`);
    
    console.log('=== CONVERSATION DATA CLEARED ===');
    
    return NextResponse.json({
      success: true,
      message: 'All conversation data cleared',
      deleted: {
        messages: deletedMessages.count,
        conversations: deletedConversations.count
      }
    });
  } catch (error) {
    console.error('Error clearing conversation data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const messageCount = await prisma.message.count();
    const conversationCount = await prisma.conversation.count();
    const customerCount = await prisma.customer.count();
    
    return NextResponse.json({
      status: 'Data check',
      counts: {
        messages: messageCount,
        conversations: conversationCount,
        customers: customerCount
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
