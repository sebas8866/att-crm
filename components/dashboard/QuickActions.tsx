'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  MessageSquare,
  Zap,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  icon: React.ElementType
  label: string
  href: string
  color: string
  description: string
}

const quickActions: QuickAction[] = [
  {
    icon: MessageSquare,
    label: 'New Conversation',
    href: '/conversations',
    color: 'bg-blue-500/10 text-blue-500',
    description: 'Start chatting with a customer',
  },
  {
    icon: Zap,
    label: 'AT&T Check',
    href: '/att-checker',
    color: 'bg-amber-500/10 text-amber-500',
    description: 'Check service availability',
  },
  {
    icon: Users,
    label: 'Add Customer',
    href: '/customers',
    color: 'bg-purple-500/10 text-purple-500',
    description: 'Create a new customer record',
  },
  {
    icon: FileText,
    label: 'View Reports',
    href: '/analytics',
    color: 'bg-emerald-500/10 text-emerald-500',
    description: 'See analytics and insights',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 group hover:border-primary/50"
            >
              <div className={action.color + " h-10 w-10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform"}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
