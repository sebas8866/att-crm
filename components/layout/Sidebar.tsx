'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  Zap,
  Star,
  LogOut,
  Bell,
  Home,
  Menu,
  Phone,
  Kanban,
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  X,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/components/auth/UserContext'

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
  { icon: Phone, label: 'Calls', href: '/calls' },
  { icon: Users, label: 'Customers', href: '/customers' },
  { icon: Kanban, label: 'Pipeline', href: '/pipeline' },
  { icon: Calendar, label: 'Installations', href: '/installations' },
  { icon: TrendingUp, label: 'Ad Performance', href: '/ads' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Shield, label: 'AT&T Checker', href: '/att-checker' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

const favorites = [
  { icon: Star, label: 'Starred', href: '/starred' },
  { icon: Zap, label: 'Automation', href: '/automation' },
]

// Desktop Sidebar
export function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useUser()
  
  const userDisplayName = user?.name || user?.email?.split('@')[0] || 'Administrator'
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                       user?.email?.[0].toUpperCase() || 'A'

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 dark:border-slate-800">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
          <Home className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[15px] dark:text-white">My Home</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Promotions CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">Main Menu</p>
        </div>
        
        <nav className="px-2 space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {user?.isAdmin && (
          <>
            <div className="px-4 mt-6 mb-2">
              <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Admin Only</p>
            </div>
            <nav className="px-2 space-y-0.5">
              <Link
                href="/commissions"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <DollarSign className="h-4 w-4" />
                <span>Commissions</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          </>
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-auto py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-800 text-white text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium truncate dark:text-white">{userDisplayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userDisplayName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <Badge className="mt-1 text-[10px]" variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                {user?.role}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.href = '/login'
              }}
              className="gap-2 text-red-600 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

// Mobile Sidebar - Full Screen
export function MobileSidebar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                       user?.email?.[0].toUpperCase() || 'U'

  const handleLogout = async () => {
    setIsOpen(false)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleNavigate = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  return (
    <React.Fragment>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 w-full h-full bg-white dark:bg-slate-900 z-[9999] flex flex-col"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">My Home</p>
                <p className="text-xs text-slate-500">Promotions CRM</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-6 bg-white dark:bg-slate-900">
            <div className="space-y-2">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-colors text-left',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <item.icon className={cn("h-6 w-6 flex-shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>

            {user?.isAdmin && (
              <>
                <p className="text-xs font-bold text-amber-500 uppercase mt-8 mb-3 px-1">Admin</p>
                <button
                  onClick={() => handleNavigate('/commissions')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-left"
                >
                  <DollarSign className="h-6 w-6 flex-shrink-0" />
                  <span>Commissions</span>
                </button>
                <button
                  onClick={() => handleNavigate('/leaderboard')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-left"
                >
                  <Trophy className="h-6 w-6 flex-shrink-0" />
                  <span>Leaderboard</span>
                </button>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarFallback className="bg-slate-800 text-white text-base">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 bg-red-50 hover:bg-red-100"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}
