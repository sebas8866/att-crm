import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const customerCount = await prisma.customer.count();
    const conversationCount = await prisma.conversation.count();
    
    return Response.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        customers: customerCount,
        conversations: conversationCount,
      },
      ringcentral: {
        configured: !!process.env.RINGCENTRAL_CLIENT_ID,
        phoneNumber: process.env.RINGCENTRAL_PHONE_NUMBER,
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
