import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Calendar
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getAnalytics() {
  try {
    const totalConversations = await prisma.conversation.count()
    const totalCustomers = await prisma.customer.count()
    const totalMessages = await prisma.message.count()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const conversationsToday = await prisma.conversation.count({
      where: { createdAt: { gte: today } }
    })
    
    const statusCounts = await prisma.conversation.groupBy({
      by: ['status'],
      _count: { status: true }
    })
    
    const statusMap = Object.fromEntries(
      statusCounts.map(s => [s.status, s._count.status])
    )
    
    return {
      totalConversations,
      totalCustomers,
      totalMessages,
      conversationsToday,
      newCount: statusMap['NEW'] || 0,
      respondedCount: statusMap['RESPONDED'] || 0,
      closedCount: statusMap['CLOSED'] || 0,
      checkingCount: statusMap['CHECKING'] || 0,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      totalConversations: 0,
      totalCustomers: 0,
      totalMessages: 0,
      conversationsToday: 0,
      newCount: 0,
      respondedCount: 0,
      closedCount: 0,
      checkingCount: 0,
    }
  }
}

export default async function AnalyticsPage() {
  const stats = await getAnalytics()

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your CRM performance and conversation metrics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Unique contacts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">Total messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversationsToday}</div>
              <p className="text-xs text-muted-foreground">New conversations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{stats.newCount}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Awaiting first response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Checking</CardTitle>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{stats.checkingCount}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">AT&T availability check</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Responded</CardTitle>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{stats.respondedCount}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Waiting for customer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{stats.closedCount}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Completed conversations</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Your CRM activity over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Detailed charts coming soon</p>
                <p className="text-sm mt-1">Track response times and conversion rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
