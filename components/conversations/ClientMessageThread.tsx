'use client'

import { useState, useEffect } from 'react'
import { MessageThread } from '@/components/conversations/MessageThread'
import { useRouter } from 'next/navigation'

interface ClientMessageThreadProps {
  conversationId: string
  customer: {
    id: string
    phoneNumber: string
    name: string | null
    email: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
  }
  messages: Array<{
    id: string
    body: string
    direction: 'INBOUND' | 'OUTBOUND'
    status?: string
    createdAt: string
  }>
  status: string
}

export function ClientMessageThread({
  conversationId,
  customer: initialCustomer,
  messages: initialMessages,
  status: initialStatus,
}: ClientMessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [currentStatus, setCurrentStatus] = useState(initialStatus)
  const [customer, setCustomer] = useState(initialCustomer)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()

  // Poll for new messages every 2 seconds
  useEffect(() => {
    let isMounted = true
    let lastMessagesJson = JSON.stringify(initialMessages)
    let lastStatus = initialStatus
    
    const pollMessages = async () => {
      if (!isMounted) return
      
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (response.ok && isMounted) {
          const data = await response.json()
          if (data.messages) {
            const newMessagesJson = JSON.stringify(data.messages)
            if (newMessagesJson !== lastMessagesJson) {
              lastMessagesJson = newMessagesJson
              setMessages(data.messages)
            }
            if (data.status !== lastStatus) {
              lastStatus = data.status
              setCurrentStatus(data.status)
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }

    pollMessages()
    const interval = setInterval(pollMessages, 2000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [conversationId, initialMessages, initialStatus])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: message }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.message) {
          setMessages(prev => [...prev, data.message])
        }
        router.refresh()
      } else {
        const error = await response.json()
        alert('Failed to send message: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error sending message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    }
  }

  const handleCustomerUpdate = async (data: Partial<typeof customer>) => {
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedCustomer = await response.json()
        setCustomer(updatedCustomer)
        router.refresh()
      } else {
        alert('Failed to update customer')
      }
    } catch (error) {
      alert('Error updating customer')
    }
  }

  return (
    <MessageThread
      conversationId={conversationId}
      customer={customer}
      messages={messages}
      status={currentStatus}
      onSendMessage={handleSendMessage}
      onStatusChange={handleStatusChange}
      onCustomerUpdate={handleCustomerUpdate}
      isSending={isSending}
    />
  )
}
