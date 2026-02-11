import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '2024-01-01'
    const endDate = searchParams.get('endDate') || '2024-12-31'
    
    // Read API key from environment
    const apiKey = process.env.TRIPLE_WHALE_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TRIPLE_WHALE_API_KEY environment variable not set' },
        { status: 503 }
      )
    }

    // Try multiple Triple Whale endpoints
    const endpoints = [
      `https://api.triplewhale.com/api/v2/attribution/overview?from=${startDate}&to=${endDate}`,
      `https://api.triplewhale.com/api/v2/attribution/summary?from=${startDate}&to=${endDate}`,
      `https://api.triplewhale.com/api/v2/attribution?from=${startDate}&to=${endDate}`,
    ]

    let lastError = null
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          const formatted = formatTripleWhaleData(data)
          return NextResponse.json(formatted)
        }
        
        lastError = await response.text()
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error'
        continue
      }
    }

    // All endpoints failed
    return NextResponse.json(
      { 
        error: 'Triple Whale API failed on all endpoints',
        details: lastError,
        tried: endpoints
      },
      { status: 503 }
    )

  } catch (error) {
    console.error('Triple Whale error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function formatTripleWhaleData(data: any) {
  let rawCampaigns: any[] = []
  
  if (Array.isArray(data)) {
    rawCampaigns = data
  } else if (data.campaigns) {
    rawCampaigns = data.campaigns
  } else if (data.data) {
    rawCampaigns = data.data
  } else if (data.results) {
    rawCampaigns = data.results
  } else if (data.summary) {
    // Handle summary format
    return {
      campaigns: [{
        id: 'summary',
        name: 'Total Summary',
        platform: 'All',
        status: 'ACTIVE',
        spend: data.summary.spend || 0,
        impressions: data.summary.impressions || 0,
        clicks: data.summary.clicks || 0,
        conversions: data.summary.conversions || data.summary.purchases || 0,
        roas: data.summary.roas || 0,
        cpa: data.summary.cpa || 0,
        ctr: data.summary.ctr || 0,
      }],
      metrics: {
        totalSpend: data.summary.spend || 0,
        totalRevenue: (data.summary.spend || 0) * (data.summary.roas || 0),
        totalConversions: data.summary.conversions || data.summary.purchases || 0,
        totalClicks: data.summary.clicks || 0,
        totalImpressions: data.summary.impressions || 0,
        roas: data.summary.roas || 0,
        ctr: data.summary.ctr || 0,
        cpc: data.summary.cpc || 0,
        cpm: data.summary.cpm || 0,
      }
    }
  }
  
  const campaigns = rawCampaigns.map((camp: any, index: number) => ({
    id: camp.id || String(index),
    name: camp.name || camp.campaignName || 'Campaign ' + (index + 1),
    platform: camp.platform || camp.channel || 'Meta',
    status: camp.status || 'ACTIVE',
    spend: parseFloat(camp.spend || camp.cost || 0),
    impressions: parseInt(camp.impressions || camp.imps || 0),
    clicks: parseInt(camp.clicks || 0),
    conversions: parseInt(camp.conversions || camp.purchases || camp.orders || 0),
    roas: parseFloat(camp.roas || camp.returnOnAdSpend || 0),
    cpa: parseFloat(camp.cpa || camp.costPerPurchase || 0),
    ctr: parseFloat(camp.ctr || camp.clickThroughRate || 0),
  }))

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.spend * c.roas), 0)

  return {
    campaigns,
    metrics: {
      totalSpend,
      totalRevenue,
      totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
      totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    }
  }
}
