import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH update conversation
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, assignedToId, tags, notes, scheduledCallTime } = await req.json()

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId
    if (tags !== undefined) updateData.tags = tags
    if (notes !== undefined) updateData.notes = notes
    if (scheduledCallTime !== undefined) updateData.scheduledCallTime = new Date(scheduledCallTime)

    const conversation = await prisma.conversation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ success: true, conversation })
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}
