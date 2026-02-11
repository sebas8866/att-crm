'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  BarChart3,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  subtitle?: string
}

function StatCard({ title, value, change, trend, icon: Icon, subtitle }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-24 w-24" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant={trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 inline" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 inline" />}
            {change}
          </Badge>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats?: {
    totalConversations: number
    pendingConversations: number
    closedToday: number
    conversionRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Default values if stats not provided
  const defaultStats = {
    totalConversations: 128,
    pendingConversations: 23,
    closedToday: 12,
    conversionRate: 68,
  }

  const data = stats || defaultStats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Conversations"
        value={data.totalConversations.toString()}
        change="+12.5%"
        trend="up"
        subtitle="vs last month"
        icon={MessageSquare}
      />
      <StatCard
        title="Pending"
        value={data.pendingConversations.toString()}
        change="-5.2%"
        trend="up"
        subtitle="needs attention"
        icon={Clock}
      />
      <StatCard
        title="Closed Today"
        value={data.closedToday.toString()}
        change="+8.3%"
        trend="up"
        subtitle="conversations resolved"
        icon={CheckCircle2}
      />
      <StatCard
        title="Conversion Rate"
        value={`${data.conversionRate}%`}
        change="+4.2%"
        trend="up"
        subtitle="vs last week"
        icon={BarChart3}
      />
    </div>
  )
}
