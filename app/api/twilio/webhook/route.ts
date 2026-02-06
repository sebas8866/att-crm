import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS, normalizePhoneNumber } from '@/lib/twilio';
import { processMessageWithAI, generateAddressRequestResponse } from '@/lib/ai-handler';

// Disable body parsing for Twilio webhook
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const status = formData.get('MessageStatus') as string;
    
    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(from);

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber: normalizedPhone,
        },
      });
    }

    // Find or create active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: customer.id,
        status: { not: 'CLOSED' },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          status: 'NEW',
        },
      });
    }

    // Store the incoming message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        customerId: customer.id,
        body: body,
        direction: 'INBOUND',
        status: 'DELIVERED',
        twilioSid: messageSid,
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Process with AI
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const history = recentMessages.reverse().map(m => ({
      role: (m.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.body,
    }));

    const aiResult = await processMessageWithAI(body, history);

    // Handle different intents
    let responseMessage: string | null = null;
    
    switch (aiResult.intent) {
      case 'address_provide':
        if (aiResult.extractedAddress?.fullAddress) {
          // Update customer address
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              address: aiResult.extractedAddress.street || aiResult.extractedAddress.fullAddress,
              city: aiResult.extractedAddress.city,
              state: aiResult.extractedAddress.state,
              zipCode: aiResult.extractedAddress.zipCode,
            },
          });
          
          // Update conversation status
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: 'CHECKING' },
          });
          
          responseMessage = "Thank you! I'm checking AT&T service availability at your address now. This will just take a moment.";
          
          // Trigger availability check (async)
          checkAvailability(customer.id, conversation.id, aiResult.extractedAddress);
        } else {
          responseMessage = "Thanks for that information. To check availability, I'll need your complete address including street, city, state, and ZIP code. Could you provide that?";
        }
        break;
        
      case 'availability_check':
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'ADDRESS_REQUESTED' },
        });
        responseMessage = await generateAddressRequestResponse();
        break;
        
      case 'opt_out':
        responseMessage = aiResult.suggestedResponse || "You've been unsubscribed.";
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'CLOSED' },
        });
        break;
        
      default:
        responseMessage = aiResult.suggestedResponse || "Thank you for reaching out! How can we help you with AT&T services today?";
    }

    // Send response if we have one
    if (responseMessage) {
      const twilioResult = await sendSMS({
        to: from,
        body: responseMessage,
      });

      if (twilioResult.success) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            customerId: customer.id,
            body: responseMessage,
            direction: 'OUTBOUND',
            status: 'SENT',
            twilioSid: twilioResult.sid,
          },
        });
        
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'RESPONDED' },
        });
      }
    }

    // Return TwiML response (empty, since we sent via API)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

async function checkAvailability(
  customerId: string,
  conversationId: string,
  address: { street?: string; city?: string; state?: string; zipCode?: string; fullAddress?: string }
) {
  try {
    // Call the availability check API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/att/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        conversationId,
        address: {
          street: address.street || address.fullAddress,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
        },
      }),
    });
  } catch (error) {
    console.error('Error triggering availability check:', error);
  }
}
