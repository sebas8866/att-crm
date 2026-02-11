'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Search,
  FileText,
  ArrowRight,
  Clock,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigationCommands = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    shortcut: 'D',
    action: '/',
  },
  {
    id: 'conversations',
    name: 'Conversations',
    icon: MessageSquare,
    shortcut: 'C',
    action: '/conversations',
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    shortcut: 'U',
    action: '/customers',
  },
  {
    id: 'att-checker',
    name: 'AT&T Checker',
    icon: Zap,
    shortcut: 'A',
    action: '/att-checker',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    shortcut: 'N',
    action: '/analytics',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    shortcut: 'S',
    action: '/settings',
  },
]

const quickActions = [
  {
    id: 'new-conversation',
    name: 'New Conversation',
    icon: Plus,
    action: () => alert('Create new conversation'),
  },
  {
    id: 'new-customer',
    name: 'New Customer',
    icon: Plus,
    action: () => alert('Create new customer'),
  },
  {
    id: 'att-check',
    name: 'Run AT&T Availability Check',
    icon: Zap,
    action: () => alert('Open AT&T checker'),
  },
]

const recentItems = [
  {
    id: 'conv-1',
    name: 'John Doe - Fiber Inquiry',
    icon: MessageSquare,
    type: 'Conversation',
    action: '/conversations/1',
  },
  {
    id: 'conv-2',
    name: 'Jane Smith - Installation Request',
    icon: MessageSquare,
    type: 'Conversation',
    action: '/conversations/2',
  },
  {
    id: 'customer-1',
    name: 'Acme Corp',
    icon: Users,
    type: 'Customer',
    action: '/customers/1',
  },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange]
  )

  const handleSelect = (action: string | (() => void)) => {
    if (typeof action === 'string') {
      runCommand(() => router.push(action))
    } else {
      runCommand(action)
    }
  }

  // Keyboard shortcut to open command palette
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              onSelect={() => handleSelect(action.action)}
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Navigation">
          {navigationCommands.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => handleSelect(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              <CommandShortcut>⌘{item.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {recentItems.length > 0 && (
          <CommandGroup heading="Recent">
            {recentItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.action)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
