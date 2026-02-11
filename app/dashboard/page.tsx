import { StatsCards } from '@/components/dashboard/StatsCards'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getInitials, formatRelativeDate, formatPhoneNumber } from '@/lib/utils'
import { MessageSquare, TrendingUp, ArrowUpRight, Zap, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  try {
    // Get counts
    const totalConversations = await prisma.conversation.count()
    const pendingConversations = await prisma.conversation.count({
      where: { status: { in: ['NEW', 'ADDRESS_REQUESTED', 'CHECKING'] } },
    })
    const closedConversations = await prisma.conversation.count({
      where: { status: 'CLOSED' },
    })
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayConversations = await prisma.conversation.count({
      where: { createdAt: { gte: today } },
    })
    
    const totalCustomers = await prisma.customer.count()
    
    // Get recent conversations with messages
    const recentConversations = await prisma.conversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 6,
    })

    // Get unread count
    const unreadCount = await prisma.conversation.count({
      where: { status: 'NEW' },
    })

    // Calculate conversion rate (closed / total * 100)
    const conversionRate = totalConversations > 0 
      ? Math.round((closedConversations / totalConversations) * 100) 
      : 0

    return {
      stats: {
        totalConversations,
        pendingConversations,
        todayConversations,
        totalCustomers,
        unreadCount,
        conversionRate,
        closedConversations,
      },
      recentConversations: recentConversations.map((conv) => ({
        id: conv.id,
        customer: {
          name: conv.customer.name,
          phoneNumber: conv.customer.phoneNumber,
        },
        status: conv.status,
        lastMessage: conv.messages[0]?.body || 'No messages yet',
        time: conv.lastMessageAt?.toISOString() || conv.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      stats: {
        totalConversations: 0,
        pendingConversations: 0,
        todayConversations: 0,
        totalCustomers: 0,
        unreadCount: 0,
        conversionRate: 0,
        closedConversations: 0,
      },
      recentConversations: [],
    }
  }
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100' },
  ADDRESS_REQUESTED: { label: 'Address Needed', color: 'text-amber-700', bg: 'bg-amber-100' },
  CHECKING: { label: 'Checking', color: 'text-purple-700', bg: 'bg-purple-100' },
  RESPONDED: { label: 'Responded', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  CLOSED: { label: 'Closed', color: 'text-slate-700', bg: 'bg-slate-100' },
}

export default async function DashboardPage() {
  const { stats, recentConversations } = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Link 
          href="/conversations" 
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all conversations
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Conversations</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalConversations}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{stats.todayConversations} today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Response</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingConversations}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {stats.unreadCount > 0 && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  {stats.unreadCount} unread
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Customers</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs font-medium text-slate-500">Unique contacts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">AT&T Checker</p>
                <p className="text-lg font-semibold mt-1">Check Availability</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <Link 
              href="/att-checker"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white/90 hover:text-white"
            >
              Open tool
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Conversations */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-base font-semibold">Recent Conversations</CardTitle>
              </div>
              {stats.unreadCount > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {stats.unreadCount} new
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {recentConversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No conversations yet</p>
                <p className="text-sm text-slate-400 mt-1">When customers text you, they&apos;ll appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentConversations.map((conversation) => {
                  const status = statusConfig[conversation.status] || statusConfig.NEW
                  const customerName = conversation.customer.name || formatPhoneNumber(conversation.customer.phoneNumber)

                  return (
                    <Link
                      key={conversation.id}
                      href={`/conversations/${conversation.id}`}
                      className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors group"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white text-xs">
                          {getInitials(conversation.customer.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-900 truncate">{customerName}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {formatRelativeDate(conversation.time)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 truncate mt-0.5">{conversation.lastMessage}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/conversations">
                <Button variant="outline" className="w-full justify-start h-11">
                  <MessageSquare className="h-4 w-4 mr-2 text-slate-400" />
                  View Conversations
                </Button>
              </Link>
              
              <Link href="/att-checker">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Zap className="h-4 w-4 mr-2 text-slate-400" />
                  Check AT&T Availability
                </Button>
              </Link>
              
              <Link href="/customers">
                <Button variant="outline" className="w-full justify-start h-11">
                  <Users className="h-4 w-4 mr-2 text-slate-400" />
                  View Customers
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                {stats.closedConversations} closed out of {stats.totalConversations} total conversations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
