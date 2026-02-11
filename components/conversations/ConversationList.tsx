'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeDate, getInitials, formatPhoneNumber } from '@/lib/utils'
import { Search, Filter, MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Conversation {
  id: string
  customerId: string
  status: string
  lastMessageAt: string
  createdAt: string
  customer: {
    id: string
    phoneNumber: string
    name: string | null
    email: string | null
  }
  messages: Array<{
    id: string
    body: string
    direction: 'INBOUND' | 'OUTBOUND'
    createdAt: string
  }>
  availabilityChecks: Array<{
    id: string
    status: string
    createdAt: string
  }>
}

export type { Conversation }

interface ConversationListProps {
  conversations?: Conversation[]
  selectedId?: string
  isLoading?: boolean
}

const statusConfig: Record<string, { label: string; color: string; variant: 'default' | 'secondary' | 'warning' | 'success' }> = {
  NEW: { label: 'New', color: 'bg-blue-500', variant: 'default' },
  ADDRESS_REQUESTED: { label: 'Address Needed', color: 'bg-amber-500', variant: 'warning' },
  CHECKING: { label: 'Checking', color: 'bg-purple-500', variant: 'secondary' },
  RESPONDED: { label: 'Responded', color: 'bg-emerald-500', variant: 'success' },
  CLOSED: { label: 'Closed', color: 'bg-gray-500', variant: 'secondary' },
  NEED_TO_CALL: { label: 'Need to Call', color: 'bg-orange-500', variant: 'warning' },
  CALLED_NO_ANSWER: { label: 'No Answer', color: 'bg-red-500', variant: 'secondary' },
  CALL_SCHEDULED: { label: 'Call Scheduled', color: 'bg-cyan-500', variant: 'default' },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-slate-500', variant: 'secondary' },
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-pink-500', variant: 'warning' },
  PENDING_INSTALL: { label: 'Pending Install', color: 'bg-indigo-500', variant: 'default' },
}

function ConversationSkeleton() {
  return (
    <div className="p-4 border-b">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

function ConversationItem({
  conversation,
  isSelected,
}: {
  conversation: Conversation
  isSelected: boolean
}) {
  const lastMessage = conversation.messages[0]
  const status = statusConfig[conversation.status] || { label: conversation.status, color: 'bg-gray-500', variant: 'secondary' as const }
  const customerName = conversation.customer.name || formatPhoneNumber(conversation.customer.phoneNumber)

  return (
    <Link href={`/conversations/${conversation.id}`}>
      <div
        className={cn(
          'p-4 border-b cursor-pointer transition-all hover:bg-accent/50 group',
          isSelected && 'bg-accent border-l-4 border-l-primary'
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className={cn('h-10 w-10', isSelected && 'ring-2 ring-primary')}>
            <AvatarFallback className={cn(
              'text-xs font-medium',
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {getInitials(conversation.customer.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={cn(
                'font-medium truncate',
                isSelected && 'text-primary'
              )}>
                {customerName}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(conversation.lastMessageAt)}
              </span>
            </div>

            {lastMessage && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {lastMessage.direction === 'OUTBOUND' && <span className="text-primary">You: </span>}
                {lastMessage.body}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={status.variant}
                className="text-xs px-1.5 py-0"
              >
                {status.label}
              </Badge>

              {conversation.availabilityChecks.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Checked
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function ConversationList({
  conversations,
  selectedId,
  isLoading = false,
}: ConversationListProps) {
  const [search, setSearch] = React.useState('')

  const filteredConversations = React.useMemo(() => {
    if (!conversations) return []
    if (!search) return conversations

    const searchLower = search.toLowerCase()
    return conversations.filter((conv) =>
      conv.customer.name?.toLowerCase().includes(searchLower) ||
      conv.customer.phoneNumber.includes(search) ||
      conv.messages[0]?.body.toLowerCase().includes(searchLower)
    )
  }, [conversations, search])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Badge variant="secondary">
            {conversations?.length || 0}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {isLoading ? (
            <>
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
            </>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
              />
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
