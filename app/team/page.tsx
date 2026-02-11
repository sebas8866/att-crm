'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Plus, 
  Shield, 
  User, 
  Mail, 
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'AGENT'
  isActive: boolean
  createdAt: string
  _count: {
    conversationsAssigned: number
    callsAnswered: number
  }
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('AGENT')

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear form
        setName('')
        setEmail('')
        setPassword('')
        setRole('AGENT')
        // Refresh user list
        fetchUsers()
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.isActive).length
  const adminUsers = users.filter(u => u.role === 'ADMIN').length

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-500 mt-0.5">Manage users, permissions, and access levels.</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Members</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{totalUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{activeUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{adminUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Users List */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage access and permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No team members yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 sm:p-6 flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{user.name || user.email}</p>
                          {user.role === 'ADMIN' && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px]">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {!user.isActive && (
                            <Badge variant="outline" className="text-slate-400 text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{user._count.conversationsAssigned} conversations</span>
                          <span>•</span>
                          <span>{user._count.callsAnswered} calls</span>
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add User Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add New User
              </CardTitle>
              <CardDescription>Create a new team member account</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com" 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                  >
                    <option value="AGENT">Agent - Can respond to conversations</option>
                    <option value="ADMIN">Admin - Full access</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
