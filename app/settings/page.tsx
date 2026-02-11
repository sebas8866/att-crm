import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Save,
  Key,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react'
import { formatPhoneNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Telnyx configuration
const TELNYX_PHONE_NUMBER = '+18128183171'
const WEBHOOK_URL = 'https://att-crm.vercel.app/api/telnyx/webhook'

export default function SettingsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your CRM preferences and account settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Telnyx SMS Integration - Top Card */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <CardTitle>Telnyx SMS</CardTitle>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  Active
                </Badge>
              </div>
              <CardDescription>Your SMS messaging configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your SMS Number (Send this to customers)</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formatPhoneNumber(TELNYX_PHONE_NUMBER)} 
                    readOnly 
                    className="font-mono text-lg bg-white"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(TELNYX_PHONE_NUMBER)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={WEBHOOK_URL} 
                    readOnly 
                    className="text-sm bg-white"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(WEBHOOK_URL)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste this URL in your Telnyx Messaging Profile settings
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Inbound SMS Enabled</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Outbound SMS Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Auto-reply Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input defaultValue="My Home Promotions" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="info@myhomepromotions.com" />
              </div>
              <Button><Save className="h-4 w-4 mr-2" />Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Email notifications are sent to info@myhomepromotions.com when new messages arrive.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <Button variant="outline"><Key className="h-4 w-4 mr-2" />Update Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
