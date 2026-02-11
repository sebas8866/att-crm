'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageThread } from '@/components/conversations/MessageThread'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Loader2 } from 'lucide-react'

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
  availabilityChecks: Array<{
    id: string
    status: string
    services?: string[] | null
    fiberSpeeds?: string[] | null
    internetAir?: boolean | null
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }>
}

const statusOptions = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'ADDRESS_REQUESTED', label: 'Address Needed', color: 'bg-amber-100 text-amber-700' },
  { value: 'CHECKING', label: 'Checking', color: 'bg-purple-100 text-purple-700' },
  { value: 'RESPONDED', label: 'Responded', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'NEED_TO_CALL', label: 'Need to Call', color: 'bg-orange-100 text-orange-700' },
  { value: 'CALLED_NO_ANSWER', label: 'Called - No Answer', color: 'bg-red-100 text-red-700' },
  { value: 'CALL_SCHEDULED', label: 'Call Scheduled', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-slate-100 text-slate-700' },
  { value: 'FOLLOW_UP', label: 'Follow Up', color: 'bg-pink-100 text-pink-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-700' },
]

export function ClientConversationView({
  conversationId,
  customer,
  messages: initialMessages,
  status: initialStatus,
  availabilityChecks,
}: ClientMessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [currentStatus, setCurrentStatus] = useState(initialStatus)
  const [isSending, setIsSending] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const router = useRouter()

  // Poll for new messages
  useState(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`)
        if (response.ok) {
          const data = await response.json()
          if (data.messages) {
            setMessages(data.messages)
            setCurrentStatus(data.status)
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error)
      }
    }, 3000)

    return () => clearInterval(interval)
  })

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
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCall = async () => {
    setIsCalling(true)
    try {
      const response = await fetch('/api/calls/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          to: customer.phoneNumber,
        }),
      })

      if (response.ok) {
        // In production, this would open a dialer or initiate the call
        alert(`Calling ${customer.phoneNumber}...`)
      }
    } catch (error) {
      console.error('Error making call:', error)
    } finally {
      setIsCalling(false)
    }
  }

  // Get service info from availability checks
  const latestCheck = availabilityChecks[0]
  const hasFiber = latestCheck?.services?.includes('fiber')
  const hasInternetAir = latestCheck?.internetAir
  const fiberSpeeds = latestCheck?.fiberSpeeds || []

  const currentStatusConfig = statusOptions.find(s => s.value === currentStatus) || statusOptions[0]

  return (
    <div className="h-full flex flex-col">
      {/* Header with status and actions */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">{customer.name || customer.phoneNumber}</h2>
            <Badge className={currentStatusConfig.color}>
              {currentStatusConfig.label}
            </Badge>
          </div>
          
          <Button 
            onClick={handleCall}
            disabled={isCalling}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCalling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            Call
          </Button>
        </div>

        {/* Status buttons */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentStatus === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(option.value)}
              disabled={isUpdatingStatus}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Service Info */}
        {latestCheck && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">AT&T Services:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {hasFiber && (
                <Badge className="bg-blue-100 text-blue-700">Fiber Available</Badge>
              )}
              {hasInternetAir && (
                <Badge className="bg-cyan-100 text-cyan-700">Internet Air</Badge>
              )}
              {!hasFiber && !hasInternetAir && (
                <Badge variant="outline">No Service Available</Badge>
              )}
            </div>            
            {fiberSpeeds.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Speeds: {fiberSpeeds.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          conversationId={conversationId}
          customer={customer}
          messages={messages}
          status={currentStatus}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}
