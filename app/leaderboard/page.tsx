import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Phone,
  Medal,
  Award,
  Star
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAgentStats() {
  try {
    const today = new Date()
    const monthStart = startOfMonth(today)

    // Get all agents
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Get all conversations with assigned agents
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true,
        customer: true,
      },
    })

    // Get all commissions
    const commissions = await prisma.commission.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }).catch(() => []) // Fallback if table doesn't exist

    // Get all calls
    const calls = await prisma.call.findMany({
      where: {
        answeredById: { not: null },
      },
    }).catch(() => []) // Fallback if table doesn't exist

    // Calculate stats per agent
    const agentStats = agents.map(agent => {
      const agentConversations = conversations.filter(c => c.assignedToId === agent.id)
      
      const agentMessages = agentConversations.reduce((sum, conv) => {
        return sum + conv.messages.filter(m => m.direction === 'OUTBOUND').length
      }, 0)
      
      const agentCalls = calls.filter(c => c.answeredById === agent.id)
      const totalCallDuration = agentCalls.reduce((sum, c) => sum + (c.duration || 0), 0)
      
      const conversions = agentConversations.filter(c => c.status === 'CLOSED').length
      
      const agentCommissions = commissions.filter(c => {
        const relatedConv = agentConversations.find(conv => 
          conv.customerId === c.customerId
        )
        return relatedConv !== undefined
      })
      const commissionAmount = agentCommissions.reduce((sum, c) => sum + c.amount, 0)

      let totalResponseTime = 0
      let responseCount = 0
      agentConversations.forEach(conv => {
        const messages = conv.messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        for (let i = 1; i < messages.length; i++) {
          if (messages[i].direction === 'OUTBOUND' && messages[i-1].direction === 'INBOUND') {
            const responseTime = new Date(messages[i].createdAt).getTime() - 
                                 new Date(messages[i-1].createdAt).getTime()
            if (responseTime < 24 * 60 * 60 * 1000) {
              totalResponseTime += responseTime
              responseCount++
            }
          }
        }
      })
      
      const avgResponseTime = responseCount > 0 
        ? Math.round(totalResponseTime / responseCount / 1000 / 60)
        : 0

      return {
        id: agent.id,
        name: agent.name || agent.email.split('@')[0],
        email: agent.email,
        conversations: agentConversations.length,
        messages: agentMessages,
        calls: agentCalls.length,
        callDuration: Math.round(totalCallDuration / 60),
        conversions,
        commissionAmount,
        avgResponseTime,
        score: conversions * 10 + agentMessages * 0.5 + agentCalls.length * 2,
      }
    })

    return agentStats.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('Error fetching agent stats:', error)
    return []
  }
}

async function getTeamStats() {
  try {
    const today = new Date()
    const monthStart = startOfMonth(today)

    const [
      totalConversations,
      totalCommissions,
      totalCalls,
      activeAgents,
    ] = await Promise.all([
      prisma.conversation.count(),
      prisma.commission.aggregate({
        where: {
          createdAt: { gte: monthStart },
          status: { in: ['EARNED', 'PAID'] },
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
      prisma.call.count().catch(() => 0),
      prisma.user.count({ where: { role: 'AGENT' } }),
    ])

    return {
      totalConversations,
      totalCommissions: totalCommissions._sum.amount || 0,
      totalCalls,
      activeAgents,
    }
  } catch (error) {
    console.error('Error fetching team stats:', error)
    return {
      totalConversations: 0,
      totalCommissions: 0,
      totalCalls: 0,
      activeAgents: 0,
    }
  }
}

function LeaderboardRow({ 
  agent, 
  rank 
}: { 
  agent: Awaited<ReturnType<typeof getAgentStats>>[number]
  rank: number 
}) {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="h-6 w-6 flex items-center justify-center font-bold text-slate-400">{rank}</span>
    }
  }

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200'
      case 2:
        return 'bg-slate-50 dark:bg-slate-800 border-slate-200'
      case 3:
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'
      default:
        return 'bg-white dark:bg-slate-900'
    }
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${getRankStyle()}`}>
      <div className="flex-shrink-0">
        {getRankIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">{agent.name}</h3>
          {rank === 1 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
        </div>
        <p className="text-sm text-slate-500 truncate">{agent.email}</p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-lg">{agent.conversions}</p>
          <p className="text-xs text-slate-500">Sales</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">${agent.commissionAmount}</p>
          <p className="text-xs text-slate-500">Earned</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="font-bold text-lg">{agent.calls}</p>
          <p className="text-xs text-slate-500">Calls</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="font-bold text-lg">{agent.avgResponseTime}m</p>
          <p className="text-xs text-slate-500">Avg Response</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-blue-600">{Math.round(agent.score)}</p>
          <p className="text-xs text-slate-500">Score</p>
        </div>
      </div>
    </div>
  )
}

export default async function LeaderboardPage() {
  const [agentStats, teamStats] = await Promise.all([
    getAgentStats(),
    getTeamStats(),
  ])

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Agent Leaderboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Performance rankings based on sales, calls, and response time
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Star className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active Agents</p>
                  <p className="text-xl font-bold">{teamStats.activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Conversations</p>
                  <p className="text-xl font-bold">{teamStats.totalConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Calls</p>
                  <p className="text-xl font-bold">{teamStats.totalCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Commissions (This Month)</p>
                  <p className="text-xl font-bold">${teamStats.totalCommissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentStats.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No agent data available yet. Activity will appear here once agents start handling conversations.
              </p>
            ) : (
              <div className="space-y-3">
                {agentStats.map((agent, index) => (
                  <LeaderboardRow 
                    key={agent.id} 
                    agent={agent} 
                    rank={index + 1} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Info */}
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-base">How Scoring Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>Agent scores are calculated based on:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Sales (Closed Deals):</strong> 10 points each</li>
              <li><strong>Outbound Messages:</strong> 0.5 points each</li>
              <li><strong>Calls Answered:</strong> 2 points each</li>
            </ul>
            <p className="mt-2">Response time and commission earnings are also tracked but don&apos;t affect the score directly.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
