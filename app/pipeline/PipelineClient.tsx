'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials, formatRelativeDate, formatPhoneNumber } from '@/lib/utils'
import { AppShell } from '@/components/layout/AppShell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, MoveRight, Phone, GripVertical } from 'lucide-react'

// Define pipeline stages with colors - COMPACT LABELS
const pipelineStages = [
  { key: 'NEW', label: 'New', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'NEED_TO_CALL', label: 'To Call', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { key: 'CALL_SCHEDULED', label: 'Scheduled', color: 'bg-cyan-500', textColor: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { key: 'ADDRESS_REQUESTED', label: 'Address', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { key: 'CHECKING', label: 'Checking', color: 'bg-purple-500', textColor: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { key: 'RESPONDED', label: 'Responded', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'CALLED_NO_ANSWER', label: 'No Answer', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  { key: 'NOT_INTERESTED', label: 'Not Int.', color: 'bg-slate-500', textColor: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30' },
  { key: 'FOLLOW_UP', label: 'Follow Up', color: 'bg-pink-500', textColor: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { key: 'PENDING_INSTALL', label: 'Pending', color: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { key: 'CLOSED', label: 'Closed', color: 'bg-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/30' },
]

interface Customer {
  id: string
  name: string | null
  phoneNumber: string
  email: string | null
}

interface Conversation {
  id: string
  status: string
  lastMessageAt: Date | null
  createdAt: Date
  customer: Customer
  messages: Array<{ id: string; body: string; createdAt: Date }>
  availabilityChecks: Array<{ id: string; status: string; services?: any }>
}

interface PipelinePageProps {
  pipeline: Array<{
    key: string
    label: string
    color: string
    textColor: string
    bgColor: string
    conversations: Conversation[]
  }>
  stats: {
    total: number
    active: number
    closed: number
    needsAttention: number
  }
}

function PipelineCard({
  conversation,
  onMove,
  onDragStart,
}: {
  conversation: Conversation
  onMove: (conversationId: string, newStatus: string) => void
  onDragStart: (e: React.DragEvent, conversationId: string) => void
}) {
  const customer = conversation.customer
  const lastMessage = conversation.messages[0]
  const hasService = Array.isArray(conversation.availabilityChecks[0]?.services) && conversation.availabilityChecks[0]?.services.length > 0

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, conversation.id)}
      className="p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group cursor-move"
    >
      <div className="flex items-start gap-1.5">
        <div className="cursor-grab active:cursor-grabbing pt-0.5">
          <GripVertical className="h-3 w-3 text-slate-300" />
        </div>
        <Avatar className="h-6 w-6 flex-shrink-0">
          <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
            {getInitials(customer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <Link
              href={`/conversations/${conversation.id}`}
              className="font-medium text-xs text-slate-900 dark:text-white truncate hover:text-blue-600"
            >
              {customer.name || formatPhoneNumber(customer.phoneNumber)}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <div className="px-2 py-1 text-xs font-medium text-slate-500">Move to:</div>
                {pipelineStages.filter(s => s.key !== conversation.status).map((stage) => (
                  <DropdownMenuItem
                    key={stage.key}
                    onClick={() => onMove(conversation.id, stage.key)}
                    className="text-xs cursor-pointer py-1"
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${stage.color} mr-2`} />
                    {stage.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {lastMessage && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
              {lastMessage.body.substring(0, 35)}...
            </p>
          )}

          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              {formatRelativeDate(conversation.lastMessageAt?.toISOString() || conversation.createdAt.toISOString())}
            </span>

            <div className="flex items-center gap-0.5">
              {hasService && (
                <span className="text-[8px] px-1 py-0 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
                  svc
                </span>
              )}
              <Link href={`tel:${customer.phoneNumber}`}>
                <Button variant="ghost" size="icon" className="h-4 w-4 -mr-1">
                  <Phone className="h-2.5 w-2.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientPipelinePage({ pipeline: initialPipeline, stats }: PipelinePageProps) {
  const [pipeline, setPipeline] = useState(initialPipeline)
  const [isUpdating, setIsUpdating] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const router = useRouter()

  const handleDragStart = useCallback((e: React.DragEvent, conversationId: string) => {
    setDraggedId(conversationId)
    e.dataTransfer.effectAllowed = 'move'
    // Make the drag image look better
    e.dataTransfer.setData('text/plain', conversationId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageKey)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
    setDragOverStage(null)
    
    if (!draggedId) return
    
    // Check if conversation is already in this stage
    const currentStage = pipeline.find(stage => 
      stage.conversations.some(c => c.id === draggedId)
    )
    
    if (currentStage?.key === stageKey) {
      setDraggedId(null)
      return
    }
    
    await handleMove(draggedId, stageKey)
    setDraggedId(null)
  }, [draggedId, pipeline])

  const handleMove = useCallback(async (conversationId: string, newStatus: string) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    
    // Optimistically update UI
    setPipeline(prev => {
      const newPipeline = prev.map(stage => ({
        ...stage,
        conversations: stage.conversations.filter(c => c.id !== conversationId)
      }))
      
      const conversation = prev.flatMap(s => s.conversations).find(c => c.id === conversationId)
      if (conversation) {
        const targetStage = newPipeline.find(s => s.key === newStatus)
        if (targetStage) {
          targetStage.conversations.unshift({ ...conversation, status: newStatus })
        }
      }
      
      return newPipeline
    })
    
    // Send to API
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error moving conversation:', error)
      alert('Failed to move conversation')
      // Revert by refreshing
      window.location.reload()
    } finally {
      setIsUpdating(false)
    }
  }, [isUpdating, router])

  return (
    <AppShell>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Pipeline</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Drag and drop customers between stages, or click the 3 dots to move.</p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
            <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{stats.total} Total</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{stats.active} Active</span>
            </div>
            <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">{stats.needsAttention} Need Attention</span>
            </div>
          </div>
        </div>

        {/* Kanban Board - Horizontal Scroll */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 h-full min-w-max pb-2">
            {pipeline.map((stage) => (
              <div
                key={stage.key}
                className={`w-52 flex-shrink-0 flex flex-col h-full transition-all duration-200 ${
                  dragOverStage === stage.key
                    ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900'
                    : ''
                }`}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div className={`${stage.bgColor} rounded-t-lg p-2 border-b-2 ${stage.textColor.replace('text', 'border')} dark:border-slate-700`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{stage.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 dark:bg-slate-700 dark:text-slate-300">
                      {stage.conversations.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards Container */}
                <div className={`flex-1 rounded-b-lg p-1.5 overflow-hidden transition-colors duration-200 ${
                  dragOverStage === stage.key
                    ? 'bg-blue-100/50 dark:bg-blue-900/20'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}>
                  <ScrollArea className="h-full">
                    <div className="space-y-1.5">
                      {stage.conversations.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                          {dragOverStage === stage.key ? 'Drop here' : '-'}
                        </p>
                      ) : (
                        stage.conversations.map((conversation) => (
                          <PipelineCard
                            key={conversation.id}
                            conversation={conversation}
                            onMove={handleMove}
                            onDragStart={handleDragStart}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
