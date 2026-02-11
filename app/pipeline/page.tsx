import { prisma } from '@/lib/prisma'
import ClientPipelinePage from './PipelineClient'

export const dynamic = 'force-dynamic'

// Define pipeline stages
const pipelineStages = [
  { key: 'NEW', label: 'New Leads', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'NEED_TO_CALL', label: 'Need to Call', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { key: 'CALL_SCHEDULED', label: 'Call Scheduled', color: 'bg-cyan-500', textColor: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { key: 'ADDRESS_REQUESTED', label: 'Address Needed', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { key: 'CHECKING', label: 'Checking', color: 'bg-purple-500', textColor: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { key: 'RESPONDED', label: 'Responded', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'CALLED_NO_ANSWER', label: 'No Answer', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  { key: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-slate-500', textColor: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30' },
  { key: 'FOLLOW_UP', label: 'Follow Up', color: 'bg-pink-500', textColor: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { key: 'PENDING_INSTALL', label: 'Pending Install', color: 'bg-indigo-500', textColor: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { key: 'CLOSED', label: 'Closed', color: 'bg-gray-500', textColor: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/30' },
]

async function getPipelineData() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, name: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        availabilityChecks: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Group by status
    const pipeline = pipelineStages.map(stage => ({
      ...stage,
      conversations: conversations.filter(c => c.status === stage.key)
    }))

    // Calculate stats
    const stats = {
      total: conversations.length,
      active: conversations.filter(c => !['CLOSED', 'NOT_INTERESTED'].includes(c.status)).length,
      closed: conversations.filter(c => c.status === 'CLOSED').length,
      needsAttention: conversations.filter(c => ['NEW', 'NEED_TO_CALL', 'CALLED_NO_ANSWER'].includes(c.status)).length,
    }

    return { pipeline, stats }
  } catch (error) {
    console.error('Error fetching pipeline:', error)
    return { 
      pipeline: pipelineStages.map(s => ({ ...s, conversations: [] })), 
      stats: { total: 0, active: 0, closed: 0, needsAttention: 0 } 
    }
  }
}

export default async function PipelinePage() {
  const { pipeline, stats } = await getPipelineData()

  return <ClientPipelinePage pipeline={pipeline} stats={stats} />
}
