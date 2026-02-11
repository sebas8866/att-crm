'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  Search,
  Plus,
  Moon,
  Sun,
  UserPlus,
  MessageSquare,
  Wifi,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from './Sidebar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TopBarProps {
  onCommandPaletteOpen: () => void
}

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/conversations': 'Conversations',
  '/calls': 'Calls',
  '/customers': 'Customers',
  '/pipeline': 'Pipeline',
  '/att-checker': 'AT&T Checker',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/team': 'Team',
}

// Separate dialog component that's not inside dropdown
function NewConversationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phone, setPhone] = React.useState('')
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    try {
      // First create/get customer
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      })
      
      if (customerRes.ok) {
        const customer = await customerRes.json()
        // Create conversation
        const convRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: customer.id }),
        })
        
        if (convRes.ok) {
          const conv = await convRes.json()
          router.push(`/conversations/${conv.id}`)
          onClose()
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-lg font-semibold dark:text-white">Start New Conversation</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="phone" className="dark:text-slate-300">Phone Number</Label>
              <Input 
                id="phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567" 
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !phone.trim()}>
              {loading ? 'Creating...' : 'Start Conversation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NewCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber: phone }),
      })
      
      if (res.ok) {
        const customer = await res.json()
        router.push(`/customers/${customer.id}`)
        onClose()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h2 className="text-lg font-semibold dark:text-white">Add New Customer</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <Label htmlFor="cust-name" className="dark:text-slate-300">Name (optional)</Label>
              <Input 
                id="cust-name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="cust-phone" className="dark:text-slate-300">Phone Number</Label>
              <Input 
                id="cust-phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567" 
                className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !phone.trim()}>
              {loading ? 'Creating...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TopBar({ onCommandPaletteOpen }: TopBarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [convDialogOpen, setConvDialogOpen] = React.useState(false)
  const [custDialogOpen, setCustDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    return {
      href,
      label: breadcrumbMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1),
    }
  })

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/95 dark:border-slate-800">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="relative z-50">
              <MobileSidebar />
            </div>

            {/* Breadcrumbs - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <Link
                    href={crumb.href}
                    className={cn(
                      'hover:text-slate-900 dark:hover:text-white transition-colors',
                      index === breadcrumbs.length - 1 && 'text-slate-900 dark:text-white font-medium'
                    )}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            {/* Page title on mobile */}
            <span className="md:hidden font-semibold text-slate-900 dark:text-white">
              {breadcrumbMap[pathname] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <Button
              variant="outline"
              className="hidden sm:flex h-9 justify-start text-sm text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 w-40 lg:w-64"
              onClick={onCommandPaletteOpen}
            >
              <Search className="mr-2 h-4 w-4" />
              Search...
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-9 w-9 dark:text-slate-400"
              onClick={onCommandPaletteOpen}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Add button with custom dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 shadow-lg z-50 py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setConvDialogOpen(true)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
                    >
                      <MessageSquare className="h-4 w-4" />
                      New Conversation
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setCustDialogOpen(true)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
                    >
                      <UserPlus className="h-4 w-4" />
                      New Customer
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                    <Link
                      href="/att-checker"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
                    >
                      <Wifi className="h-4 w-4" />
                      AT&T Availability Check
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Dark mode toggle */}
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 dark:text-slate-400"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Dialogs - Rendered at root level to avoid positioning issues */}
      <NewConversationDialog 
        open={convDialogOpen} 
        onClose={() => setConvDialogOpen(false)} 
      />
      <NewCustomerDialog 
        open={custDialogOpen} 
        onClose={() => setCustDialogOpen(false)} 
      />
    </>
  )
}
