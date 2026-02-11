import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// GET - Fetch messages for real-time polling
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      messages: conversation.messages.map((m) => ({
        id: m.id,
        body: m.body,
        direction: m.direction,
        status: m.status,
        provider: m.provider,
        createdAt: m.createdAt.toISOString(),
      })),
      status: conversation.status,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { body } = await req.json();

    if (!body || !body.trim()) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    // Get conversation with customer
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log('[SMS] Sending message via Telnyx to:', conversation.customer.phoneNumber);

    // Send SMS via Telnyx
    const smsResult = await sendSMS({
      to: conversation.customer.phoneNumber,
      body: body.trim(),
    });

    console.log('[SMS] Telnyx result:', smsResult);

    if (!smsResult.success) {
      console.error('[SMS] Failed to send:', smsResult.error);
      return NextResponse.json(
        { error: 'Failed to send message: ' + smsResult.error },
        { status: 500 }
      );
    }

    // Save message to database
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        customerId: conversation.customerId,
        body: body.trim(),
        direction: 'OUTBOUND',
        status: 'SENT',
        provider: 'telnyx',
        externalId: smsResult.id,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        status: 'RESPONDED',
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
