import { NextRequest, NextResponse } from 'next/server';
import { processMessageWithAI } from '@/lib/ai-handler';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const processSchema = z.object({
  message: z.string(),
  conversationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId } = processSchema.parse(body);

    let history: { role: 'user' | 'assistant'; content: string }[] = [];

    // Get conversation history if provided
    if (conversationId) {
      const recentMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      history = recentMessages.reverse().map((m) => ({
        role: (m.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.body,
      }));
    }

    // Process with AI
    const result = await processMessageWithAI(message, history);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('AI process error:', error);

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
