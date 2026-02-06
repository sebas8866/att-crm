import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} at ${formatTime(d)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    ADDRESS_REQUESTED: 'bg-yellow-100 text-yellow-800',
    CHECKING: 'bg-purple-100 text-purple-800',
    RESPONDED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SENT: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    FIBER_AVAILABLE: 'bg-green-100 text-green-800',
    INTERNET_AIR_AVAILABLE: 'bg-blue-100 text-blue-800',
    NOT_AVAILABLE: 'bg-red-100 text-red-800',
    ERROR: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'New',
    ADDRESS_REQUESTED: 'Address Requested',
    CHECKING: 'Checking Availability',
    RESPONDED: 'Responded',
    CLOSED: 'Closed',
    PENDING: 'Pending',
    SENT: 'Sent',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    FIBER_AVAILABLE: 'Fiber Available',
    INTERNET_AIR_AVAILABLE: 'Internet Air Available',
    NOT_AVAILABLE: 'Not Available',
    ERROR: 'Error',
  };
  return labels[status] || status;
}
