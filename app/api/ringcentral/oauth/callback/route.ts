import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const RC_SERVER = 'https://platform.ringcentral.com'
// HARDCODED to match oauth route EXACTLY
const REDIRECT_URI = 'https://att-crm.vercel.app/api/ringcentral/oauth/callback'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Check for errors
  if (error) {
    return NextResponse.json({ 
      error: 'OAuth authorization failed',
      details: errorDescription || error 
    }, { status: 400 })
  }
  
  // Verify state
  const storedState = req.cookies.get('rc_oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.json({ 
      error: 'Invalid state parameter',
      message: 'Security check failed. Please try again.' 
    }, { status: 400 })
  }
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
  }
  
  // Exchange code for tokens
  const clientId = process.env.RINGCENTRAL_CLIENT_ID
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'RingCentral credentials not configured' }, { status: 500 })
  }
  
  try {
    // Use HARDCODED redirect URI - must match oauth route exactly
    const tokenResponse = await fetch(`${RC_SERVER}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      return NextResponse.json({
        error: 'Failed to exchange code for token',
        details: errorData
      }, { status: 500 })
    }
    
    const tokens = await tokenResponse.json()
    
    // Return success with tokens (in production, store these securely)
    return NextResponse.json({
      success: true,
      message: 'RingCentral OAuth completed successfully!',
      access_token: tokens.access_token,  // FULL TOKEN - copy this!
      expires_in: tokens.expires_in,
      refresh_token: tokens.refresh_token || 'Not provided',
      scope: tokens.scope,
      owner_id: tokens.owner_id,
      endpoint_id: tokens.endpoint_id,
      note: 'COPY THE FULL access_token ABOVE and send it to Henry',
      next_steps: [
        'Copy the entire access_token value (long string)',
        'Send it to Henry to add to Vercel'
      ]
    })
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({
      error: 'OAuth callback failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
