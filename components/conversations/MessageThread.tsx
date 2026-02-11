'use client'

import * as React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn, formatTime, getInitials } from '@/lib/utils'
import {
  Send,
  Phone,
  MoreHorizontal,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  Edit2,
  Wifi,
  Save,
  X,
  User,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Message {
  id: string
  body: string
  direction: 'INBOUND' | 'OUTBOUND' | string
  status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ' | string
  provider?: string
  externalId?: string | null
  createdAt: string
}

interface Customer {
  id: string
  phoneNumber: string
  name: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

interface MessageThreadProps {
  conversationId: string
  customer: Customer
  messages: Message[]
  status: string
  onSendMessage?: (message: string) => void
  onStatusChange?: (status: string) => void
  onCustomerUpdate?: (data: Partial<Customer>) => void
  isSending?: boolean
}

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'New', color: 'bg-blue-500' },
  ADDRESS_REQUESTED: { label: 'Address Needed', color: 'bg-amber-500' },
  CHECKING: { label: 'Checking', color: 'bg-purple-500' },
  RESPONDED: { label: 'Responded', color: 'bg-emerald-500' },
  CLOSED: { label: 'Closed', color: 'bg-gray-500' },
  NEED_TO_CALL: { label: 'Need to Call', color: 'bg-orange-500' },
  CALLED_NO_ANSWER: { label: 'No Answer', color: 'bg-red-500' },
  CALL_SCHEDULED: { label: 'Call Scheduled', color: 'bg-cyan-500' },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-slate-500' },
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-pink-500' },
  PENDING_INSTALL: { label: 'Pending Install', color: 'bg-indigo-500' },
}

function MessageBubble({
  message,
  customerName,
}: {
  message: Message
  customerName: string
}) {
  const isInbound = message.direction === 'INBOUND'

  const statusIcon = {
    PENDING: <Clock className="h-3 w-3" />,
    SENT: <Check className="h-3 w-3" />,
    DELIVERED: <CheckCheck className="h-3 w-3" />,
    READ: <CheckCheck className="h-3 w-3 text-blue-500" />,
    FAILED: <AlertCircle className="h-3 w-3 text-red-500" />,
  }

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isInbound ? '' : 'flex-row-reverse ml-auto'
      )}
    >
      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs',
          isInbound ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-blue-600 text-white'
        )}>
          {getInitials(isInbound ? customerName : 'You')}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'rounded-2xl px-4 py-2.5 max-w-[calc(100%-44px)]',
        isInbound
          ? 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'
          : 'bg-blue-600 text-white rounded-tr-none'
      )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs',
            isInbound ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
          )}
        >
          <span>{formatTime(message.createdAt)}</span>
          {!isInbound && message.status && statusIcon[message.status as keyof typeof statusIcon]}
        </div>
      </div>
    </div>
  )
}

export function MessageThread({
  conversationId,
  customer,
  messages,
  status,
  onSendMessage,
  onStatusChange,
  onCustomerUpdate,
  isSending = false,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = React.useState('')
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [editedName, setEditedName] = React.useState(customer.name || '')
  const [isSaving, setIsSaving] = React.useState(false)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)

  const customerName = customer.name || customer.phoneNumber
  const currentStatus = statusConfig[status] || { label: status || 'Unknown', color: 'bg-gray-500' }

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  // Update edited name when customer changes
  React.useEffect(() => {
    setEditedName(customer.name || '')
  }, [customer.name])

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage && !isSending) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSaveName = async () => {
    if (editedName.trim() !== customer.name) {
      setIsSaving(true)
      await onCustomerUpdate?.({ name: editedName.trim() })
      setIsSaving(false)
    }
    setIsEditingName(false)
  }

  const handleStatusUpdate = (newStatus: string) => {
    onStatusChange?.(newStatus)
  }

  // Build AT&T checker URL with customer address
  const getAttCheckerUrl = () => {
    if (customer.address && customer.zipCode) {
      const address = encodeURIComponent(`${customer.address}, ${customer.city || ''}, ${customer.state || ''} ${customer.zipCode}`)
      return `/att-checker?address=${address}`
    }
    return '/att-checker'
  }

  const quickReplies = [
    "Thank you for your interest in AT&T services!",
    "Let me check the availability for your address.",
    "AT&T Fiber is available at your location with speeds up to 5 Gbps!",
    "I'll schedule a technician for your installation.",
    "Is there anything else I can help you with today?",
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="border-b dark:border-slate-700 py-3 px-4 flex-shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{getInitials(customerName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 text-sm w-48 dark:bg-slate-800"
                    placeholder="Customer name"
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => {
                      setEditedName(customer.name || '')
                      setIsEditingName(false)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{customerName}</h3>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="secondary" className="text-xs dark:bg-slate-800 dark:text-slate-300">
                  {customer.phoneNumber}
                </Badge>
                <div className={cn('h-2 w-2 rounded-full', currentStatus.color)} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link href={`tel:${customer.phoneNumber}`}>
              <Button variant="ghost" size="icon" className="dark:text-slate-400 dark:hover:text-white">
                <Phone className="h-4 w-4" />
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="dark:text-slate-400 dark:hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-slate-800 dark:border-slate-700">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Change Pipeline Stage
                </div>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownMenuItem 
                    key={key}
                    onClick={() => handleStatusUpdate(key)}
                    className={cn(
                      "text-xs cursor-pointer dark:text-slate-300 dark:focus:bg-slate-700",
                      status === key && "bg-slate-100 dark:bg-slate-700"
                    )}
                  >
                    <div className={`h-2 w-2 rounded-full ${config.color} mr-2`} />
                    {config.label}
                    {status === key && <span className="ml-auto text-[10px]">( current)</span>}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator className="dark:bg-slate-700" />
                
                <Link href={getAttCheckerUrl()}>
                  <DropdownMenuItem className="cursor-pointer dark:text-slate-300 dark:focus:bg-slate-700">
                    <Wifi className="h-4 w-4 mr-2" />
                    Run AT&T Check
                  </DropdownMenuItem>
                </Link>
                
                <Link href={`/customers/${customer.id}`}>
                  <DropdownMenuItem className="cursor-pointer dark:text-slate-300 dark:focus:bg-slate-700">
                    <User className="h-4 w-4 mr-2" />
                    View Customer Profile
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area only */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              customerName={customerName}
            />
          ))
        )}
      </div>

      {/* Quick Replies - Fixed at bottom */}
      <div className="border-t dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap text-xs dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              onClick={() => setNewMessage(reply)}
            >
              {reply.slice(0, 30)}...
            </Button>
          ))}
        </div>
      </div>

      {/* Composer - Fixed at bottom */}
      <div className="border-t dark:border-slate-700 p-4 flex-shrink-0 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            className="min-h-[60px] resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
