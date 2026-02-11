'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
} from 'date-fns'
import { 
  Calendar, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Plus,
  DollarSign,
} from 'lucide-react'

const COMMISSION_AMOUNT = 200

interface Customer {
  id: string
  name: string | null
  phoneNumber: string
}

interface Installation {
  id: string
  customerId: string
  conversationId: string | null
  installDate: string
  status: string
  reminderSent: boolean
  customer: Customer
}

interface InstallationsPageProps {
  allInstallations: Installation[]
  upcomingInstallations: Installation[]
  completedWithoutCommission: Installation[]
}

// Schedule New Installation Dialog
function ScheduleInstallationDialog({ onSchedule }: { onSchedule: (data: { customerName: string, phoneNumber: string, installDate: string, notes?: string }) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [installDate, setInstallDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || !installDate) return

    setLoading(true)
    try {
      await onSchedule({ customerName, phoneNumber, installDate, notes })
      setOpen(false)
      setCustomerName('')
      setPhoneNumber('')
      setInstallDate('')
      setNotes('')
    } catch (error) {
      console.error('Error scheduling:', error)
      alert('Failed to schedule installation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Installation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="customerName">Customer Name (optional)</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
          <div>
            <Label htmlFor="installDate">Installation Date *</Label>
            <Input
              id="installDate"
              type="date"
              value={installDate}
              onChange={(e) => setInstallDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Installation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function InstallationsPageClient({ 
  allInstallations: initialInstallations, 
  upcomingInstallations: initialUpcoming,
  completedWithoutCommission: initialCompleted 
}: InstallationsPageProps) {
  const router = useRouter()
  const [allInstallations, setAllInstallations] = useState(initialInstallations)
  const [upcomingInstallations, setUpcomingInstallations] = useState(initialUpcoming)
  const [completedWithoutCommission, setCompletedWithoutCommission] = useState(initialCompleted)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const calendarInstallations = allInstallations.filter(i => {
    const date = new Date(i.installDate)
    return date >= monthStart && date <= monthEnd
  })

  const handleSchedule = async (data: { customerName: string, phoneNumber: string, installDate: string, notes?: string }) => {
    const response = await fetch('/api/installations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to schedule')
    }

    const newInstallation = await response.json()
    setAllInstallations(prev => [newInstallation, ...prev])
    router.refresh()
  }

  const handleComplete = async (installationId: string, customerId: string, customerName: string) => {
    setLoadingId(installationId)
    try {
      const response = await fetch(`/api/installations/${installationId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, customerName }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete')
      }

      router.refresh()
    } catch (error) {
      console.error('Error completing:', error)
      alert('Failed to complete installation')
    } finally {
      setLoadingId(null)
    }
  }

  const handleSendReminder = async (installationId: string, phoneNumber: string) => {
    setLoadingId(installationId + '_reminder')
    try {
      const response = await fetch(`/api/installations/${installationId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to send reminder')
      }

      router.refresh()
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Installation Calendar</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Manage all installations globally - ${COMMISSION_AMOUNT} commission per completion
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/commissions">
              <Button variant="outline" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Commissions
              </Button>
            </Link>
            <ScheduleInstallationDialog onSchedule={handleSchedule} />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold">{allInstallations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Upcoming (7d)</p>
                  <p className="text-xl font-bold">{upcomingInstallations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-xl font-bold">
                    {allInstallations.filter(i => i.status === 'COMPLETED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Potential Earnings</p>
                  <p className="text-xl font-bold">
                    ${allInstallations.filter(i => i.status === 'SCHEDULED').length * COMMISSION_AMOUNT}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(today, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
                
                {days.map((day) => {
                  const dayInstallations = calendarInstallations.filter((i) =>
                    isSameDay(new Date(i.installDate), day)
                  )
                  const isTodayDate = isToday(day)

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[80px] p-2 border rounded-lg
                        ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'bg-white dark:bg-slate-800'}
                      `}
                    >
                      <div className={`
                        text-xs font-medium mb-1
                        ${isTodayDate ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayInstallations.slice(0, 2).map((install) => (
                          <Link
                            key={install.id}
                            href={`/conversations/${install.conversationId}`}
                            className={`block text-[10px] px-1.5 py-0.5 rounded truncate ${
                              install.status === 'COMPLETED' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {install.customer.name || install.customer.phoneNumber}
                          </Link>
                        ))}
                        {dayInstallations.length > 2 && (
                          <div className="text-[10px] text-slate-500">+{dayInstallations.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Next 7 Days ({upcomingInstallations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingInstallations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No upcoming installations</p>
                ) : (
                  upcomingInstallations.map((install) => (
                    <div key={install.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {install.customer.name || install.customer.phoneNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(install.installDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!install.reminderSent ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={() => handleSendReminder(install.id, install.customer.phoneNumber)}
                              disabled={loadingId === install.id + '_reminder'}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {loadingId === install.id + '_reminder' ? 'Sending...' : 'Remind'}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Link href={`tel:${install.customer.phoneNumber}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </Link>
                        <Link href={`/conversations/${install.conversationId}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            View
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 ml-auto"
                          onClick={() => handleComplete(install.id, install.customerId, install.customer.name || install.customer.phoneNumber)}
                          disabled={loadingId === install.id}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {loadingId === install.id ? 'Completing...' : 'Complete (+$200)'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Completed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedWithoutCommission.slice(0, 5).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No completed installations</p>
                ) : (
                  completedWithoutCommission.slice(0, 5).map((install) => (
                    <div key={install.id} className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                      <div>
                        <p className="text-sm font-medium">{install.customer.name || install.customer.phoneNumber}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(install.installDate), 'MMM d')}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">+$200</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Installations ({allInstallations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allInstallations.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No installations scheduled yet.</p>
              ) : (
                allInstallations.slice(0, 20).map((install) => (
                  <div 
                    key={install.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        install.status === 'COMPLETED' ? 'bg-emerald-500' :
                        install.status === 'CANCELLED' ? 'bg-red-500' :
                        install.status === 'RESCHEDULED' ? 'bg-amber-500' :
                        'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium">{install.customer.name || install.customer.phoneNumber}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(install.installDate), 'MMM d, yyyy')} • {install.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {install.reminderSent && (
                        <Badge variant="outline" className="text-[10px]">Reminder Sent</Badge>
                      )}
                      <Link href={`/conversations/${install.conversationId}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
              {allInstallations.length > 20 && (
                <p className="text-sm text-slate-500 text-center py-2">
                  +{allInstallations.length - 20} more installations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
