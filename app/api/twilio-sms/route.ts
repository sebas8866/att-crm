import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS, normalizePhoneNumber } from '@/lib/sms';
import { sendNewMessageEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Simple address parser
function parseAddress(text: string): { street?: string; city?: string; state?: string; zipCode?: string; fullAddress?: string } | null {
  const cleanText = text.replace(/\n/g, ' ').trim();
  const zipMatch = cleanText.match(/(\d{5})(-\d{4})?/);
  if (!zipMatch) return null;
  
  const zipCode = zipMatch[1];
  const stateRegex = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i;
  const stateMatch = cleanText.match(stateRegex);
  
  if (!stateMatch) return null;
  const state = stateMatch[1].toUpperCase();
  
  const beforeState = cleanText.substring(0, stateMatch.index).trim();
  const parts = beforeState.split(/,|\s{2,}/).map(p => p.trim()).filter(Boolean);
  
  if (parts.length >= 2) {
    const city = parts[parts.length - 1];
    const street = parts.slice(0, parts.length - 1).join(', ');
    return {
      street,
      city,
      state,
      zipCode,
      fullAddress: `${street}, ${city}, ${state} ${zipCode}`
    };
  }
  
  return {
    fullAddress: cleanText,
    state,
    zipCode
  };
}

export async function POST(req: NextRequest) {
  console.log('=== TWILIO WEBHOOK CALLED ===');
  
  try {
    // Twilio sends form data
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    
    console.log('Twilio webhook data:', { from, to, body: body?.substring(0, 50), messageSid });
    
    if (!from || !body) {
      console.error('Missing from or body in Twilio webhook');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const normalizedPhone = normalizePhoneNumber(from);
    console.log('Normalized phone:', normalizedPhone);

    // Check for STOP/opt-out
    const isOptOut = /^\s*(stop|unsubscribe|cancel|end|quit)\s*$/i.test(body.trim());
    if (isOptOut) {
      console.log('Opt-out received from:', normalizedPhone);
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!customer) {
      console.log('Creating new customer:', normalizedPhone);
      customer = await prisma.customer.create({
        data: { phoneNumber: normalizedPhone },
      });
    } else {
      console.log('Found existing customer:', customer.id);
    }

    // Find or create active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: customer.id,
        status: { not: 'CLOSED' },
      },
      orderBy: { createdAt: 'desc' },
    });

    const isNewConversation = !conversation;
    console.log('Is new conversation:', isNewConversation);

    if (!conversation) {
      console.log('Creating new conversation for customer:', customer.id);
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          status: 'NEW',
        },
      });
    } else {
      console.log('Found existing conversation:', conversation.id);
    }

    // Store the incoming message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        customerId: customer.id,
        body: body,
        direction: 'INBOUND',
        status: 'DELIVERED',
        provider: 'twilio',
        externalId: messageSid,
      },
    });

    // Send email notification
    await sendNewMessageEmail({
      customerName: customer.name,
      customerPhone: normalizedPhone,
      messageBody: body,
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Send auto-reply for NEW conversations only
    if (isNewConversation) {
      console.log('Sending auto-reply for new conversation...');
      const autoReply = "Hi! To confirm you qualify for the $55 Fiber deal, please reply with your Zip Code and Street Address so I can check the map.";
      
      try {
        const smsResult = await sendSMS({
          to: from,
          body: autoReply,
        });

        if (smsResult.success) {
          console.log('Auto-reply sent:', smsResult.id);
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              customerId: customer.id,
              body: autoReply,
              direction: 'OUTBOUND',
              status: 'SENT',
              provider: 'twilio',
              externalId: smsResult.id,
            },
          });
          
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { status: 'ADDRESS_REQUESTED' },
          });
        }
      } catch (smsError) {
        console.error('Failed to send auto-reply:', smsError);
      }
      
      return NextResponse.json({ received: true });
    }

    // Check if we already have an address for this customer
    const hasAddress = customer.address && customer.city && customer.state && customer.zipCode;
    
    if (hasAddress) {
      console.log('Customer already has address, no auto-reply needed');
      return NextResponse.json({ received: true });
    }

    // Try to parse address from message
    const parsedAddress = parseAddress(body);
    console.log('Parsed address:', parsedAddress);

    if (parsedAddress?.street && parsedAddress?.city && parsedAddress?.state && parsedAddress?.zipCode) {
      console.log('Complete address detected, saving...');
      
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          address: parsedAddress.street,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zipCode: parsedAddress.zipCode,
        },
      });
      
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'CHECKING' },
      });
      
      // Send thank you message
      const thankYouMessage = "Thank you! Let me check availability at your address. An agent will reach out shortly with your options.";
      
      const smsResult = await sendSMS({
        to: from,
        body: thankYouMessage,
      });

      if (smsResult.success) {
        console.log('Thank you message sent:', smsResult.id);
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            customerId: customer.id,
            body: thankYouMessage,
            direction: 'OUTBOUND',
            status: 'SENT',
            provider: 'twilio',
            externalId: smsResult.id,
          },
        });
      }
      
      return NextResponse.json({ received: true });
    }

    // Partial address or no address detected
    if (conversation.status === 'ADDRESS_REQUESTED' || conversation.status === 'NEW') {
      const requestMessage = "Thanks! To check availability, I'll need your complete address including street, city, state, and ZIP code. Could you provide that?";
      
      const smsResult = await sendSMS({
        to: from,
        body: requestMessage,
      });

      if (smsResult.success) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            customerId: customer.id,
            body: requestMessage,
            direction: 'OUTBOUND',
            status: 'SENT',
            provider: 'twilio',
            externalId: smsResult.id,
          },
        });
        
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'ADDRESS_REQUESTED' },
        });
      }
    }

    console.log('=== TWILIO WEBHOOK COMPLETED ===');
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('=== TWILIO WEBHOOK ERROR ===', error);
    return NextResponse.json({ received: true });
  }
}

// Handle GET for Twilio webhook validation
export async function GET() {
  return NextResponse.json({ status: 'Twilio webhook endpoint active' });
}
// Deploy trigger: Thu Feb 12 12:54:52 EST 2026
