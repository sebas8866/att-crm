import { AppShell } from '@/components/layout/AppShell'
import { ClientMessageThread } from '@/components/conversations/ClientMessageThread'
import { CustomerSidebar } from '@/components/conversations/CustomerSidebar'
import { ConversationList } from '@/components/conversations/ConversationList'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    id: string
  }
}

async function getConversation(id: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        availabilityChecks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!conversation) {
      return null
    }

    return {
      id: conversation.id,
      customerId: conversation.customerId,
      status: conversation.status,
      customer: {
        id: conversation.customer.id,
        phoneNumber: conversation.customer.phoneNumber,
        name: conversation.customer.name,
        email: conversation.customer.email,
        address: conversation.customer.address,
        city: conversation.customer.city,
        state: conversation.customer.state,
        zipCode: conversation.customer.zipCode,
        createdAt: conversation.customer.createdAt.toISOString(),
      },
      messages: conversation.messages.map((m) => ({
        id: m.id,
        body: m.body,
        direction: m.direction as 'INBOUND' | 'OUTBOUND',
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
      availabilityChecks: conversation.availabilityChecks.map((ac) => ({
        id: ac.id,
        status: ac.status,
        address: ac.address || undefined,
        city: ac.city || undefined,
        state: ac.state || undefined,
        zipCode: ac.zipCode || undefined,
        services: (Array.isArray(ac.services) ? ac.services : null) as string[] | null,
        fiberSpeeds: (Array.isArray(ac.fiberSpeeds) ? ac.fiberSpeeds : null) as string[] | null,
        internetAir: typeof ac.internetAir === 'boolean' ? ac.internetAir : null,
        createdAt: ac.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return null
  }
}

async function getAllConversations() {
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
      status: conv.status as 'NEW' | 'ADDRESS_REQUESTED' | 'CHECKING' | 'RESPONDED' | 'CLOSED',
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

export default async function ConversationPage({ params }: PageProps) {
  const [conversation, allConversations] = await Promise.all([
    getConversation(params.id),
    getAllConversations(),
  ])

  if (!conversation) {
    notFound()
  }

  return (
    <AppShell>
      {/* Fixed height container - fills screen minus header */}
      <div className="h-[calc(100vh-80px)] flex gap-4">
        {/* Left Sidebar - Conversation List */}
        <div className="hidden lg:block w-80 h-full overflow-hidden flex-shrink-0">
          <div className="h-full overflow-y-auto pr-2">
            <ConversationList
              conversations={allConversations}
              selectedId={params.id}
            />
          </div>
        </div>

        {/* Middle - Message Thread (fills remaining space) */}
        <div className="flex-1 h-full min-w-0">
          <ClientMessageThread
            conversationId={conversation.id}
            customer={conversation.customer}
            messages={conversation.messages}
            status={conversation.status}
          />
        </div>

        {/* Right Sidebar - Customer Info */}
        <div className="hidden lg:block w-80 h-full overflow-hidden flex-shrink-0">
          <div className="h-full overflow-y-auto pl-2">
            <CustomerSidebar
              customer={conversation.customer}
              availabilityChecks={conversation.availabilityChecks}
              conversationCount={allConversations.filter(c => c.customerId === conversation.customerId).length}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
