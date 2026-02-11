'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, formatPhoneNumber, getInitials } from '@/lib/utils'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Edit,
  MessageSquare,
  Zap,
  ExternalLink,
} from 'lucide-react'

interface AvailabilityCheck {
  id: string
  status: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  services?: string[] | null
  fiberSpeeds?: string[] | null
  internetAir?: boolean | null
  createdAt: string
}

interface Customer {
  id: string
  phoneNumber: string
  name: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  createdAt: string
}

interface CustomerSidebarProps {
  customer: Customer
  availabilityChecks: AvailabilityCheck[]
  conversationCount: number
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  if (!value) return null

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function AvailabilityCard({ check }: { check: AvailabilityCheck }) {
  const statusConfig = {
    FIBER_AVAILABLE: {
      label: 'Fiber Available',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      icon: Zap,
    },
    INTERNET_AIR_AVAILABLE: {
      label: 'Internet Air Available',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      icon: Zap,
    },
    NOT_AVAILABLE: {
      label: 'Not Available',
      color: 'bg-red-500/10 text-red-600 border-red-200',
      icon: MapPin,
    },
    PENDING: {
      label: 'Checking...',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      icon: Clock,
    },
    ERROR: {
      label: 'Check Failed',
      color: 'bg-gray-500/10 text-gray-600 border-gray-200',
      icon: MapPin,
    },
  }

  const config = statusConfig[check.status as keyof typeof statusConfig] || statusConfig.ERROR
  const Icon = config.icon

  return (
    <div className={cn('p-3 rounded-lg border', config.color)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">{config.label}</span>
      </div>

      {check.services && check.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {check.services.map((service) => (
            <Badge key={service} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>
      )}

      {check.fiberSpeeds && check.fiberSpeeds.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Speeds:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {check.fiberSpeeds.map((speed) => (
              <Badge key={speed} variant="secondary" className="text-xs">
                {speed}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs mt-2 opacity-70">
        {check.address}, {check.city}, {check.state} {check.zipCode}
      </p>

      <p className="text-xs mt-1 opacity-50">
        Checked {formatDate(check.createdAt)}
      </p>
    </div>
  )
}

export function CustomerSidebar({
  customer,
  availabilityChecks,
  conversationCount,
}: CustomerSidebarProps) {
  const customerName = customer.name || formatPhoneNumber(customer.phoneNumber)

  return (
    <div className="space-y-4">
      {/* Customer Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{getInitials(customerName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{customerName}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {conversationCount} conversation{conversationCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-1">
          <InfoItem
            icon={Phone}
            label="Phone"
            value={formatPhoneNumber(customer.phoneNumber)}
          />
          <InfoItem
            icon={Mail}
            label="Email"
            value={customer.email}
          />
          {(customer.address || customer.city) && (
            <InfoItem
              icon={MapPin}
              label="Address"
              value={
                customer.address
                  ? `${customer.address}${customer.city ? `, ${customer.city}, ${customer.state} ${customer.zipCode}` : ''}`
                  : `${customer.city}, ${customer.state} ${customer.zipCode}`
              }
            />
          )}
          <InfoItem
            icon={Calendar}
            label="Customer Since"
            value={formatDate(customer.createdAt)}
          />
        </CardContent>
      </Card>

      {/* Availability Checks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Service Checks</CardTitle>
            <Button variant="ghost" size="sm">
              <Zap className="h-4 w-4 mr-1" />
              New Check
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {availabilityChecks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No availability checks yet</p>
            </div>
          ) : (
            availabilityChecks.map((check) => (
              <AvailabilityCard key={check.id} check={check} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Zap className="h-4 w-4 mr-2" />
            Run AT&T Check
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
