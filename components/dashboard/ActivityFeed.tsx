'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import {
  MessageSquare,
  Phone,
  Zap,
  UserPlus,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react'

interface Activity {
  id: string
  type: 'message' | 'call' | 'att_check' | 'customer_added' | 'status_change'
  title: string
  description?: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
}

interface ActivityFeedProps {
  activities?: Activity[]
}

const iconMap = {
  message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  call: { icon: Phone, color: 'text-green-500', bg: 'bg-green-500/10' },
  att_check: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  customer_added: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  status_change: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
}

// Default empty - will be populated from real data
const defaultActivities: Activity[] = []

function ActivityItem({ activity }: { activity: Activity }) {
  const config = iconMap[activity.type]
  const Icon = config.icon

  return (
    <div className="flex gap-3 py-3 group">
      <div className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
        config.bg
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.title}</p>
        {activity.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {activity.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {activity.user && (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {getInitials(activity.user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{activity.user.name}</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Feed</CardTitle>
          <Badge variant="secondary" className="animate-pulse">
            Live
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here as they happen
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
