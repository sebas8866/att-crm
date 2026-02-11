'use client'

import * as React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { UserProvider } from '@/components/auth/UserContext'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  return (
    <UserProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar onCommandPaletteOpen={() => setCommandPaletteOpen(true)} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      </div>
    </UserProvider>
  )
}
