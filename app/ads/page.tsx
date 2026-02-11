'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, DollarSign, ShoppingCart, BarChart3, Activity, AlertCircle, RefreshCw } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'

interface Campaign {
  id: string
  name: string
  platform: string
  status: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  roas: number
  cpa: number
  ctr: number
}

interface Metrics {
  totalSpend: number
  totalRevenue: number
  totalConversions: number
  totalClicks: number
  totalImpressions: number
  roas: number
  ctr: number
  cpc: number
  cpm: number
}

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const endDate = format(new Date(), 'yyyy-MM-dd')
      
      const res = await fetch(`/api/triple-whale?startDate=${startDate}&endDate=${endDate}`)
      const data = await res.json()
      
      if (!res.ok) {
        // If API fails, show error and fall back to demo
        setError(data.error || 'Triple Whale API not connected')
        loadDemoData()
        setIsMock(true)
      } else {
        if (data.campaigns && data.campaigns.length > 0) {
          setCampaigns(data.campaigns)
          setMetrics(data.metrics)
          setIsMock(false)
        } else {
          // No campaigns found
          setError('No campaign data found in Triple Whale for this date range')
          loadDemoData()
          setIsMock(true)
        }
      }
    } catch (err) {
      console.error('Error fetching Triple Whale data:', err)
      setError('Failed to connect to Triple Whale API')
      loadDemoData()
      setIsMock(true)
    } finally {
      setLoading(false)
    }
  }

  const loadDemoData = () => {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'AT&T Fiber - English (DEMO)',
        platform: 'Meta',
        status: 'ACTIVE',
        spend: 1250.50,
        impressions: 45000,
        clicks: 890,
        conversions: 45,
        roas: 3.2,
        cpa: 27.80,
        ctr: 1.98
      },
      {
        id: '2',
        name: 'AT&T Fiber - Spanish (DEMO)',
        platform: 'Meta',
        status: 'ACTIVE',
        spend: 890.25,
        impressions: 32000,
        clicks: 650,
        conversions: 32,
        roas: 2.8,
        cpa: 27.80,
        ctr: 2.03
      },
    ]

    const mockMetrics: Metrics = {
      totalSpend: 3211.50,
      totalRevenue: 10500.00,
      totalConversions: 117,
      totalClicks: 2340,
      totalImpressions: 120000,
      roas: 3.27,
      ctr: 1.95,
      cpc: 1.37,
      cpm: 26.76
    }

    setCampaigns(mockCampaigns)
    setMetrics(mockMetrics)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-500">Loading Triple Whale data...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ad Performance</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Powered by Triple Whale • Real-time campaign analytics
            </p>
          </div>
          
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="warning" className="border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {error}. Showing demo data instead.
              <div className="mt-2 text-sm">
                To connect real data:
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Verify your Triple Whale API key is correct</li>
                  <li>Ensure your API key has access to your ad accounts</li>
                  <li>Check that campaigns exist in Triple Whale for the selected date range</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Data Badge */}
        {isMock && !error && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              Currently showing demo data. Connect your Triple Whale account to see real metrics.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        {metrics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Spend</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSpend)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">ROAS</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.roas.toFixed(2)}x</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Conversions</p>
                    <p className="text-2xl font-bold mt-1">{formatNumber(metrics.totalConversions)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campaigns Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Campaign Performance</CardTitle>
            {isMock && <Badge variant="outline">Demo Data</Badge>}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Campaign</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Spend</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Impressions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Clicks</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">CTR</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Conv</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-xs text-slate-500">{campaign.platform}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(campaign.spend)}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(campaign.impressions)}</td>
                        <td className="py-3 px-4 text-right">{formatNumber(campaign.clicks)}</td>
                        <td className="py-3 px-4 text-right">{campaign.ctr.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right">{campaign.conversions}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={campaign.roas >= 3 ? 'text-emerald-600 font-medium' : 'text-slate-600'}>
                            {campaign.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
