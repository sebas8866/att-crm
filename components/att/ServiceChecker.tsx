'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Zap,
  MapPin,
  Wifi,
  Router,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Send,
  Loader2,
  Gauge,
  Clock,
} from 'lucide-react'

interface ServiceCheckResult {
  status: 'FIBER_AVAILABLE' | 'INTERNET_AIR_AVAILABLE' | 'NOT_AVAILABLE' | 'ERROR' | 'PENDING'
  services: string[]
  fiberSpeeds?: string[]
  internetAir?: boolean
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  notes?: string
}

interface ServiceCheckerProps {
  onCheck?: (address: {
    street: string
    city: string
    state: string
    zipCode: string
  }) => Promise<ServiceCheckResult>
  onSendResults?: (result: ServiceCheckResult) => void
}

const mockCheck = async (address: {
  street: string
  city: string
  state: string
  zipCode: string
}): Promise<ServiceCheckResult> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock result - in real implementation, this would call the actual API
  const isDallas = address.city.toLowerCase().includes('dallas')
  const isAustin = address.city.toLowerCase().includes('austin')

  if (isDallas) {
    return {
      status: 'FIBER_AVAILABLE',
      services: ['AT&T Fiber', 'AT&T Internet', 'AT&T Phone', 'AT&T TV'],
      fiberSpeeds: ['300 Mbps', '500 Mbps', '1 Gbps', '2 Gbps', '5 Gbps'],
      internetAir: true,
      address,
      notes: 'AT&T Fiber is available at this address with multi-gig speeds!',
    }
  } else if (isAustin) {
    return {
      status: 'INTERNET_AIR_AVAILABLE',
      services: ['AT&T Internet Air', 'AT&T Wireless'],
      internetAir: true,
      address,
      notes: 'Internet Air (5G Home Internet) is available at this location.',
    }
  } else {
    return {
      status: 'NOT_AVAILABLE',
      services: [],
      address,
      notes: 'AT&T services are not currently available at this address.',
    }
  }
}

function ResultCard({ result }: { result: ServiceCheckResult }) {
  const statusConfig = {
    FIBER_AVAILABLE: {
      title: 'Fiber Available!',
      icon: Zap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-200',
    },
    INTERNET_AIR_AVAILABLE: {
      title: 'Internet Air Available',
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-200',
    },
    NOT_AVAILABLE: {
      title: 'Not Available',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-200',
    },
    ERROR: {
      title: 'Check Failed',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-200',
    },
    PENDING: {
      title: 'Checking...',
      icon: Loader2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-200',
    },
  }

  const config = statusConfig[result.status]
  const Icon = config.icon

  return (
    <Card className={cn('border-2', config.borderColor)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn('h-12 w-12 rounded-full flex items-center justify-center', config.bgColor)}>
            <Icon className={cn('h-6 w-6', config.color)} />
          </div>
          <div>
            <CardTitle className={config.color}>{config.title}</CardTitle>
            <CardDescription>
              {result.address.street}, {result.address.city}, {result.address.state} {result.address.zipCode}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {result.notes && (
          <p className="text-sm text-muted-foreground">{result.notes}</p>
        )}

        {result.services.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Available Services</h4>
            <div className="flex flex-wrap gap-2">
              {result.services.map((service) => (
                <Badge key={service} variant="secondary">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.fiberSpeeds && result.fiberSpeeds.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Fiber Speeds</h4>
            <div className="grid grid-cols-2 gap-2">
              {result.fiberSpeeds.map((speed) => (
                <div
                  key={speed}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                >
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{speed}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.internetAir && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10">
            <Router className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-sm text-blue-600">Internet Air Available</p>
              <p className="text-xs text-blue-600/70">5G Home Internet option available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ServiceChecker({ onCheck, onSendResults }: ServiceCheckerProps) {
  const [address, setAddress] = React.useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<ServiceCheckResult | null>(null)
  const [history, setHistory] = React.useState<ServiceCheckResult[]>([])

  const handleCheck = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const checkFn = onCheck || mockCheck
      const checkResult = await checkFn(address)
      setResult(checkResult)
      setHistory((prev) => [checkResult, ...prev])
    } catch (error) {
      console.error('Check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendResults = () => {
    if (result && onSendResults) {
      onSendResults(result)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>AT&T Service Availability Checker</CardTitle>
              <CardDescription>
                Check AT&T Fiber and Internet Air availability for any address
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="123 Main Street"
                  className="pl-9"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="Dallas"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="TX"
                  maxLength={2}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <Input
                  placeholder="75201"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            onClick={handleCheck}
            disabled={isLoading || !address.street || !address.city || !address.state || !address.zipCode}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check Availability
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <>
          <ResultCard result={result} />

          <div className="flex justify-end">
            <Button onClick={handleSendResults} variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Send Results to Customer
            </Button>
          </div>
        </>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(1, 4).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {item.address.street}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.address.city}, {item.address.state} {item.address.zipCode}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === 'FIBER_AVAILABLE'
                        ? 'success'
                        : item.status === 'INTERNET_AIR_AVAILABLE'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {item.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
