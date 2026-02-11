import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Phone, Mail, MapPin, MessageSquare } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPhoneNumber, getInitials } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { conversations: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer database and view their conversation history.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription>{customers.length} total customers</CardDescription>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-muted-foreground">No customers yet</p>
                <p className="text-sm text-muted-foreground mt-1">Customers will appear here when they text your number</p>
              </div>
            ) : (
              <div className="divide-y">
                {customers.map((customer) => (
                  <div key={customer.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">
                          {customer.name || formatPhoneNumber(customer.phoneNumber)}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhoneNumber(customer.phoneNumber)}
                          </span>
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                          {customer.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.city}, {customer.state}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {customer._count.conversations} conversations
                      </Badge>
                      
                      <Link href={`/conversations?customer=${customer.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
