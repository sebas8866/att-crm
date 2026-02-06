import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkATTAvalability } from '@/lib/att-checker';
import { generateAvailabilityResponse } from '@/lib/ai-handler';
import { sendSMS } from '@/lib/twilio';
import { z } from 'zod';

const checkSchema = z.object({
  customerId: z.string(),
  conversationId: z.string(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, conversationId, address } = checkSchema.parse(body);

    // Validate address
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return NextResponse.json(
        { error: 'Complete address required' },
        { status: 400 }
      );
    }

    // Create availability check record
    const checkRecord = await prisma.availabilityCheck.create({
      data: {
        customerId,
        conversationId,
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        status: 'PENDING',
      },
    });

    // Perform the check
    const result = await checkATTAvalability({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });

    // Map result status to database status
    let dbStatus: 'FIBER_AVAILABLE' | 'INTERNET_AIR_AVAILABLE' | 'NOT_AVAILABLE' | 'ERROR';
    switch (result.status) {
      case 'FIBER_AVAILABLE':
        dbStatus = 'FIBER_AVAILABLE';
        break;
      case 'INTERNET_AIR_AVAILABLE':
        dbStatus = 'INTERNET_AIR_AVAILABLE';
        break;
      case 'NOT_AVAILABLE':
        dbStatus = 'NOT_AVAILABLE';
        break;
      default:
        dbStatus = 'ERROR';
    }

    // Update check record
    await prisma.availabilityCheck.update({
      where: { id: checkRecord.id },
      data: {
        status: dbStatus,
        services: result.services,
        fiberSpeeds: result.fiberSpeeds,
        internetAir: result.internetAir,
        notes: result.notes,
      },
    });

    // Get customer for sending response
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { customer: true },
    });

    if (conversation) {
      // Generate AI response based on results
      const responseMessage = await generateAvailabilityResponse(
        result.services,
        result.fiberSpeeds,
        result.internetAir
      );

      // Send response
      const twilioResult = await sendSMS({
        to: conversation.customer.phoneNumber,
        body: responseMessage,
      });

      if (twilioResult.success) {
        await prisma.message.create({
          data: {
            conversationId,
            customerId,
            body: responseMessage,
            direction: 'OUTBOUND',
            status: 'SENT',
            twilioSid: twilioResult.sid,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('AT&T check error:', error);
    
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
