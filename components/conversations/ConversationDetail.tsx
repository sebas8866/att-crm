'use client'

import * as React from 'react'
import { MessageThread } from './MessageThread'
import { CustomerSidebar } from './CustomerSidebar'
import { ConversationList } from './ConversationList'

interface ConversationDetailProps {
  conversationId: string
  conversations?: any[]
}

// Mock data for demonstration
const mockConversation = {
  id: '1',
  customerId: '1',
  status: 'RESPONDED',
  customer: {
    id: '1',
    phoneNumber: '+15551234567',
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    createdAt: '2024-01-15T10:00:00Z',
  },
  messages: [
    {
      id: '1',
      body: "Hi, I'm interested in getting AT&T Fiber at my home. Can you help me check if it's available?",
      direction: 'INBOUND',
      status: 'READ',
      createdAt: '2024-02-05T14:30:00Z',
    },
    {
      id: '2',
      body: "Hello! I'd be happy to help you check AT&T Fiber availability. Could you please provide your full address?",
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      createdAt: '2024-02-05T14:32:00Z',
    },
    {
      id: '3',
      body: 'Sure, my address is 123 Main St, Dallas, TX 75201',
      direction: 'INBOUND',
      status: 'READ',
      createdAt: '2024-02-05T14:35:00Z',
    },
    {
      id: '4',
      body: 'Great! Let me check AT&T availability for your address right now.',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      createdAt: '2024-02-05T14:36:00Z',
    },
    {
      id: '5',
      body: 'Excellent news! AT&T Fiber is available at your address with speeds up to 5 Gbps. You can also get Internet Air as a wireless backup option. Would you like me to help you schedule an installation?',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      createdAt: '2024-02-05T14:40:00Z',
    },
  ],
  availabilityChecks: [
    {
      id: '1',
      status: 'FIBER_AVAILABLE',
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      services: ['fiber', 'internet', 'phone'],
      fiberSpeeds: ['300 Mbps', '500 Mbps', '1 Gbps', '2 Gbps', '5 Gbps'],
      internetAir: true,
      createdAt: '2024-02-05T14:38:00Z',
    },
  ],
}

const mockConversations = [
  mockConversation,
  {
    id: '2',
    customerId: '2',
    status: 'NEW',
    customer: {
      id: '2',
      phoneNumber: '+15559876543',
      name: 'Jane Smith',
      email: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      createdAt: '2024-02-05T13:00:00Z',
    },
    messages: [
      {
        id: '6',
        body: 'Hello, do you offer internet service in Houston?',
        direction: 'INBOUND',
        status: 'READ',
        createdAt: '2024-02-05T13:00:00Z',
      },
    ],
    availabilityChecks: [],
  },
  {
    id: '3',
    customerId: '3',
    status: 'CHECKING',
    customer: {
      id: '3',
      phoneNumber: '+15555678901',
      name: null,
      email: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      createdAt: '2024-02-05T12:00:00Z',
    },
    messages: [
      {
        id: '7',
        body: 'Please check availability for 456 Oak Ave, Austin, TX 78701',
        direction: 'INBOUND',
        status: 'READ',
        createdAt: '2024-02-05T12:00:00Z',
      },
    ],
    availabilityChecks: [
      {
        id: '2',
        status: 'PENDING',
        address: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        services: null,
        fiberSpeeds: null,
        internetAir: null,
        createdAt: '2024-02-05T12:05:00Z',
      },
    ],
  },
]

export function ConversationDetail({ conversationId, conversations }: ConversationDetailProps) {
  // In real implementation, fetch conversation data
  const conversation = mockConversations.find(c => c.id === conversationId) || mockConversation
  const conversationList = conversations || mockConversations

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message)
    // Implement message sending
  }

  const handleStatusChange = (status: string) => {
    console.log('Changing status to:', status)
    // Implement status change
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 h-[calc(100vh-140px)]">
      {/* Conversation List */}
      <div className="hidden lg:block lg:col-span-4 xl:col-span-3 h-full">
        <ConversationList
          conversations={conversationList}
          selectedId={conversationId}
        />
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-5 xl:col-span-6 h-full">
        <MessageThread
          conversationId={conversation.id}
          customer={conversation.customer}
          messages={conversation.messages}
          status={conversation.status}
          onSendMessage={handleSendMessage}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Customer Sidebar */}
      <div className="hidden lg:block lg:col-span-3 h-full overflow-auto">
        <CustomerSidebar
          customer={conversation.customer}
          availabilityChecks={conversation.availabilityChecks}
          conversationCount={3}
        />
      </div>
    </div>
  )
}
