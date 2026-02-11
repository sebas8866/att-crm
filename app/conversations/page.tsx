import { AppShell } from '@/components/layout/AppShell'
import { ConversationList, type Conversation } from '@/components/conversations/ConversationList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { prisma } from '@/lib/prisma'

// Disable caching - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getConversations(): Promise<Conversation[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        availabilityChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    return conversations.map((conv) => ({
      id: conv.id,
      customerId: conv.customerId,
      status: conv.status as Conversation['status'],
      lastMessageAt: conv.lastMessageAt?.toISOString() || conv.createdAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      customer: {
        id: conv.customer.id,
        phoneNumber: conv.customer.phoneNumber,
        name: conv.customer.name,
        email: conv.customer.email,
      },
      messages: conv.messages.map((m) => ({
        id: m.id,
        body: m.body,
        direction: m.direction as 'INBOUND' | 'OUTBOUND',
        createdAt: m.createdAt.toISOString(),
      })),
      availabilityChecks: conv.availabilityChecks.map((ac) => ({
        id: ac.id,
        status: ac.status,
        createdAt: ac.createdAt.toISOString(),
      })),
    }))
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

export default async function ConversationsPage() {
  const conversations = await getConversations()

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Manage your customer conversations and messages.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ConversationList conversations={conversations} />
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-180px)] flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <CardTitle className="mb-2">Select a Conversation</CardTitle>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to view messages
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
