import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`
    }
    return `${diffInHours}h ago`
  }
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  return formatDate(d)
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-500',
    ADDRESS_REQUESTED: 'bg-amber-500',
    CHECKING: 'bg-purple-500',
    RESPONDED: 'bg-green-500',
    CLOSED: 'bg-gray-500',
  }
  return colors[status] || 'bg-gray-500'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'New',
    ADDRESS_REQUESTED: 'Address Needed',
    CHECKING: 'Checking',
    RESPONDED: 'Responded',
    CLOSED: 'Closed',
  }
  return labels[status] || status
}
