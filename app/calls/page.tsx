import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Voicemail, 
  Clock,
  Play,
  Search,
  Filter,
  Info
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPhoneNumber, getInitials, formatRelativeDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getCalls() {
  try {
    const calls = await prisma.call.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return calls
  } catch (error) {
    console.error('Error fetching calls:', error)
    return []
  }
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  RINGING: { 
    label: 'Ringing', 
    color: 'text-blue-700', 
    bg: 'bg-blue-100',
    icon: Phone
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    color: 'text-green-700', 
    bg: 'bg-green-100',
    icon: Phone
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'text-slate-700', 
    bg: 'bg-slate-100',
    icon: Phone
  },
  MISSED: { 
    label: 'Missed', 
    color: 'text-red-700', 
    bg: 'bg-red-100',
    icon: PhoneIncoming
  },
  VOICEMAIL: { 
    label: 'Voicemail', 
    color: 'text-purple-700', 
    bg: 'bg-purple-100',
    icon: Voicemail
  },
  FAILED: { 
    label: 'Failed', 
    color: 'text-amber-700', 
    bg: 'bg-amber-100',
    icon: Phone
  },
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default async function CallsPage() {
  const calls = await getCalls()

  // Calculate stats
  const totalCalls = calls.length;
  const missedCalls = calls.filter(c => c.status === 'MISSED').length;
  const voicemails = calls.filter(c => c.status === 'VOICEMAIL').length;
  const totalDuration = calls.reduce((acc, c) => acc + (c.duration || 0), 0);
  const avgDuration = totalCalls > 0 ? Math.floor(totalDuration / totalCalls) : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Call Center</h1>
            <p className="text-slate-500 mt-0.5">Manage incoming and outgoing calls.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search calls..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Calls</p>
                  <p className="text-2xl font-bold text-slate-900">{totalCalls}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Missed Calls</p>
                  <p className="text-2xl font-bold text-slate-900">{missedCalls}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <PhoneIncoming className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Voicemails</p>
                  <p className="text-2xl font-bold text-slate-900">{voicemails}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Voicemail className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Avg Duration</p>
                  <p className="text-2xl font-bold text-slate-900">{formatDuration(avgDuration)}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calls List */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>View and manage your call history</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {calls.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No calls yet</p>
                <p className="text-sm text-slate-400 mt-1">Calls will appear here when customers call your number</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {calls.map((call) => {
                  const status = statusConfig[call.status] || statusConfig.RINGING
                  const StatusIcon = status.icon
                  const customerName = call.customer?.name || formatPhoneNumber(call.phoneNumber)

                  return (
                    <div key={call.id} className="p-4 sm:p-6 flex items-start gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-slate-100">
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                          {getInitials(call.customer?.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{customerName}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500">{formatPhoneNumber(call.phoneNumber)}</p>

                        {call.notes && (
                          <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{call.notes}</p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            {call.direction === 'INBOUND' ? (
                              <PhoneIncoming className="h-3 w-3" />
                            ) : (
                              <PhoneOutgoing className="h-3 w-3" />
                            )}
                            {call.direction.toLowerCase()}
                          </span>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                          <span>•</span>
                          <span>{formatRelativeDate(call.createdAt.toISOString())}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {call.recordingUrl && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Play className="h-3 w-3" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-amber-600" />
              Voice Calls
            </CardTitle>
            <CardDescription>Voice functionality coming soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-slate-600">
                Voice calls are not currently configured. SMS messaging is fully active with Telnyx.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="font-medium text-slate-900">Your SMS Number:</p>
              <p className="text-2xl font-mono font-bold text-blue-600 mt-1">+1 (812) 818-3171</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
