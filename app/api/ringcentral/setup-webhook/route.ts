import { NextRequest, NextResponse } from 'next/server'

const RC_SERVER = 'https://platform.ringcentral.com';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clientId = process.env.RINGCENTRAL_CLIENT_ID;
    const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
    const jwt = process.env.RINGCENTRAL_JWT;
    
    if (!clientId || !clientSecret || !jwt) {
      return NextResponse.json({
        error: 'Missing credentials',
        message: 'Set RINGCENTRAL_CLIENT_ID, CLIENT_SECRET, and JWT'
      }, { status: 500 });
    }

    // Authenticate with JWT
    const tokenResponse = await fetch(`${RC_SERVER}/restapi/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      return NextResponse.json({
        error: 'Authentication failed',
        details: error
      }, { status: 500 });
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Create webhook subscription
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/ringcentral/webhook`;
    
    const subscriptionResponse = await fetch(`${RC_SERVER}/restapi/v1.0/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        eventFilters: [
          '/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS'
        ],
        deliveryMode: {
          transportType: 'WebHook',
          address: webhookUrl
        }
      })
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.json();
      return NextResponse.json({
        error: 'Failed to create webhook subscription',
        details: error,
        webhookUrl
      }, { status: 500 });
    }

    const subscription = await subscriptionResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Webhook subscription created!',
      subscriptionId: subscription.id,
      webhookUrl,
      expiresIn: subscription.expiresIn,
      status: subscription.status
    });

  } catch (error) {
    console.error('Webhook setup error:', error);
    return NextResponse.json({
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
