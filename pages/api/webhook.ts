import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendSMS, normalizePhoneNumber } from '@/lib/sms';
import { sendNewMessageEmail } from '@/lib/email';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Webhook endpoint active' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== WEBHOOK CALLED ===');
  
  try {
    // Handle both Twilio (form data) and JSON requests
    let from: string, body: string, messageSid: string;
    
    if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      // Twilio form data
      from = req.body.From;
      body = req.body.Body;
      messageSid = req.body.MessageSid;
    } else {
      // JSON (for testing)
      from = req.body.from;
      body = req.body.body;
      messageSid = req.body.messageSid || `msg_${Date.now()}`;
    }
    
    console.log('Webhook data:', { from, body: body?.substring(0, 50), messageSid });
    
    if (!from || !body) {
      console.error('Missing from or body');
      return res.status(400).json({ error: 'Missing required fields' });
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

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          status: 'NEW',
        },
      });
    }

    // Store message
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

    // Auto-reply for NEW conversations
    if (isNewConversation) {
      const autoReply = "Hi! To confirm you qualify for the $55 Fiber deal, please reply with your Zip Code and Street Address so I can check the map.";
      
      const smsResult = await sendSMS({
        to: from,
        body: autoReply,
      });

      if (smsResult.success) {
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
    }

    // Check for address
    const hasAddress = customer.address && customer.city && customer.state && customer.zipCode;
    
    if (!hasAddress && !isNewConversation) {
      const parsedAddress = parseAddress(body);
      
      if (parsedAddress?.street && parsedAddress?.city && parsedAddress?.state && parsedAddress?.zipCode) {
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
        
        const thankYouMessage = "Thank you! Let me check availability at your address. An agent will reach out shortly with your options.";
        
        const smsResult = await sendSMS({
          to: from,
          body: thankYouMessage,
        });

        if (smsResult.success) {
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
      }
    }

    return res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ received: true });
  }
}
