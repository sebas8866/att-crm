import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RC_SERVER = 'https://platform.ringcentral.com'
const CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/ringcentral/oauth/callback`

export async function GET(req: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json({ error: 'RINGCENTRAL_CLIENT_ID not configured' }, { status: 500 })
  }

  // Generate state for security
  const state = Buffer.from(Math.random().toString()).toString('base64').substring(0, 20)
  
  // Build authorization URL
  const authUrl = new URL(`${RC_SERVER}/restapi/oauth/authorize`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('brand_id', '')
  
  // Store state in cookie for verification
  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('rc_oauth_state', state, { 
    httpOnly: true, 
    secure: true,
    maxAge: 600 // 10 minutes
  })
  
  return response
}
