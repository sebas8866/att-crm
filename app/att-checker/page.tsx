import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Globe, MapPin, Wifi, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ATTCheckerPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AT&T Service Checker</h1>
          <p className="text-muted-foreground">
            Check service availability for your customers using the official AT&T availability tool.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Check Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-white">Official AT&T Checker</CardTitle>
              <CardDescription className="text-blue-100">
                Use AT&T&apos;s official availability tool for the most accurate results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="https://www.att.com/internet/availability/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 h-12 font-semibold">
                  Open AT&T Availability Tool
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>What You&apos;ll Check</CardTitle>
              <CardDescription>
                Services available through the official checker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">AT&T Fiber</p>
                  <p className="text-sm text-muted-foreground">Ultra-fast internet with symmetrical speeds up to 5 Gbps</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Internet Air</p>
                  <p className="text-sm text-muted-foreground">5G home internet for areas without fiber</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg mt-4">
                <p className="text-sm text-slate-600">
                  <strong>Tip:</strong> After checking availability, return to the conversation and update the customer with the results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
