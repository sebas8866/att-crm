import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/twilio';
import { z } from 'zod';

const sendSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, body: messageBody } = sendSchema.parse(body);

    // Get conversation with customer
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Send SMS via Twilio
    const result = await sendSMS({
      to: conversation.customer.phoneNumber,
      body: messageBody,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    // Store message in database
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        customerId: conversation.customer.id,
        body: messageBody,
        direction: 'OUTBOUND',
        status: 'SENT',
        twilioSid: result.sid,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'RESPONDED',
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
