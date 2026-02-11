import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; response?: NextResponse } {
  // Get IP address
  const ip = request.ip || 'unknown'
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()

  // Clean up old entries
  if (store[key] && now > store[key].resetTime) {
    delete store[key]
  }

  // Initialize or increment
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs
    }
  } else {
    store[key].count++
  }

  // Check limit
  if (store[key].count > maxRequests) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { status: 429 }
      )
    }
  }

  return { success: true }
}

// Higher limit for auth endpoints
export function authRateLimit(request: NextRequest) {
  return rateLimit(request, 5, 60000) // 5 attempts per minute
}

// Standard API rate limit
export function apiRateLimit(request: NextRequest) {
  return rateLimit(request, 100, 60000) // 100 requests per minute
}
