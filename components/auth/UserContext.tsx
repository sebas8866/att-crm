'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id?: string
  email: string
  name: string | null
  role: string
  isAdmin: boolean
}

interface UserContextType {
  user: User | null
  loading: boolean
  refresh: () => void
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
