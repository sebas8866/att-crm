import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const COMMISSION_AMOUNT = 200

async function getCommissions() {
  try {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const lastMonthStart = startOfMonth(subMonths(today, 1))
    const lastMonthEnd = endOfMonth(subMonths(today, 1))

    // Get all commissions
    const allCommissions = await prisma.commission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get this month's commissions
    const thisMonthCommissions = allCommissions.filter(c => {
      const date = new Date(c.createdAt)
      return date >= monthStart && date <= monthEnd
    })

    // Get last month's commissions
    const lastMonthCommissions = allCommissions.filter(c => {
      const date = new Date(c.createdAt)
      return date >= lastMonthStart && date <= lastMonthEnd
    })

    // Calculate stats
    const pending = allCommissions.filter(c => c.status === 'PENDING').length
    const earned = allCommissions.filter(c => c.status === 'EARNED').length
    const paid = allCommissions.filter(c => c.status === 'PAID').length
    const chargeback = allCommissions.filter(c => c.status === 'CHARGEBACK').length

    const totalEarned = allCommissions
      .filter(c => c.status === 'EARNED' || c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0)
    
    const totalPaid = allCommissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0)

    const pendingAmount = allCommissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.amount, 0)

    return {
      commissions: allCommissions,
      thisMonth: thisMonthCommissions,
      lastMonth: lastMonthCommissions,
      stats: {
        total: allCommissions.length,
        pending,
        earned,
        paid,
        chargeback,
        totalEarned,
        totalPaid,
        pendingAmount,
      }
    }
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return {
      commissions: [],
      thisMonth: [],
      lastMonth: [],
      stats: {
        total: 0,
        pending: 0,
        earned: 0,
        paid: 0,
        chargeback: 0,
        totalEarned: 0,
        totalPaid: 0,
        pendingAmount: 0,
      }
    }
  }
}

export default async function CommissionsPage() {
  const { commissions, thisMonth, lastMonth, stats } = await getCommissions()

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commissions</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Track earnings - ${COMMISSION_AMOUNT} per sale
            </p>
          </div>
          <Link href="/installations">
            <Button>View Installations</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Earned</p>
                  <p className="text-xl font-bold">${stats.totalEarned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Paid</p>
                  <p className="text-xl font-bold">${stats.totalPaid.toLocaleString()}</p>
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
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-xl font-bold">${stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">This Month</p>
                  <p className="text-xl font-bold">{thisMonth.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Breakdown */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                All Commissions ({commissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No commissions yet. Complete installations to earn commissions.</p>
                ) : (
                  commissions.map((commission) => (
                    <div 
                      key={commission.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {commission.customerName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{commission.customerName}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(commission.createdAt), 'MMM d, yyyy')} • {commission.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">${commission.amount}</p>
                        <Badge 
                          variant={
                            commission.status === 'PAID' ? 'default' :
                            commission.status === 'EARNED' ? 'secondary' :
                            commission.status === 'CHARGEBACK' ? 'destructive' :
                            'outline'
                          }
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm">Earned</span>
                  </div>
                  <span className="font-medium">{stats.earned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">Paid</span>
                  </div>
                  <span className="font-medium">{stats.paid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm">Chargeback</span>
                  </div>
                  <span className="font-medium">{stats.chargeback}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">This Month</span>
                  <span className="font-bold">{thisMonth.length} sales</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Last Month</span>
                  <span className="font-bold">{lastMonth.length} sales</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Difference</span>
                    <span className={`font-bold ${
                      thisMonth.length >= lastMonth.length ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {thisMonth.length >= lastMonth.length ? '+' : ''}
                      {thisMonth.length - lastMonth.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
