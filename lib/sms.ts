// SMS Provider - Supports both Twilio (active) and RingCentral (backup)
// TWILIO is the active provider

const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';
const RC_SERVER = 'https://platform.ringcentral.com';

// Twilio phone number (active)
const TWILIO_PHONE_NUMBER = '+18128183171';

// RingCentral phone number (backup - kept for future use)
const RINGCENTRAL_PHONE_NUMBER = '+18007209957';

export interface SendSMSOptions {
  to: string;
  body: string;
  conversationId?: string;
}

// ==================== TWILIO (ACTIVE PROVIDER) ====================

export async function sendSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  // Try Twilio first (active provider)
  const twilioResult = await sendTwilioSMS({ to, body });
  if (twilioResult.success) {
    return twilioResult;
  }
  
  // If Twilio fails, try RingCentral as backup
  console.log('Twilio failed, trying RingCentral backup...');
  return await sendRingCentralSMS({ to, body });
}

async function sendTwilioSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken) {
      return { success: false, error: 'Twilio credentials not configured' };
    }
    
    const normalizedTo = normalizePhoneNumber(to);
    
    console.log('Sending SMS via Twilio:', { 
      from: fromNumber, 
      to: normalizedTo, 
      bodyLength: body.length 
    });
    
    const response = await fetch(
      `${TWILIO_API_URL}/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: normalizedTo,
          Body: body
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twilio API error:', errorData);
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}` 
      };
    }
    
    const data = await response.json();
    console.log('Twilio SMS sent successfully:', data.sid);
    
    return {
      success: true,
      id: data.sid,
    };
  } catch (error) {
    console.error('Twilio send SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== RINGCENTRAL (BACKUP PROVIDER) ====================

async function getRingCentralAccessToken(): Promise<string | null> {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const jwt = process.env.RINGCENTRAL_JWT;
  
  if (!clientId || !clientSecret || !jwt) {
    console.error('RingCentral credentials not configured');
    return null;
  }
  
  try {
    const response = await fetch(`${RC_SERVER}/restapi/oauth/token`, {
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
    
    if (!response.ok) {
      const error = await response.json();
      console.error('RingCentral token error:', error);
      return null;
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('RingCentral get token error:', error);
    return null;
  }
}

async function sendRingCentralSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const accessToken = await getRingCentralAccessToken();
    
    if (!accessToken) {
      return { success: false, error: 'Failed to authenticate with RingCentral' };
    }
    
    const normalizedTo = normalizePhoneNumber(to);
    const fromNumber = process.env.RINGCENTRAL_PHONE_NUMBER || RINGCENTRAL_PHONE_NUMBER;
    
    console.log('Sending SMS via RingCentral:', { 
      from: fromNumber, 
      to: normalizedTo, 
      bodyLength: body.length 
    });
    
    const response = await fetch(`${RC_SERVER}/restapi/v1.0/account/~/extension/~/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        from: { phoneNumber: fromNumber },
        to: [{ phoneNumber: normalizedTo }],
        text: body
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('RingCentral SMS error:', error);
      return { 
        success: false, 
        error: error.message || `HTTP ${response.status}` 
      };
    }
    
    const data = await response.json();
    console.log('RingCentral SMS sent successfully:', data.id);
    
    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('RingCentral send SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== SHARED FUNCTIONS ====================

export async function sendSMSWithRetry(
  options: SendSMSOptions,
  maxRetries = 3
): Promise<{ success: boolean; id?: string; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendSMS(options);
    
    if (result.success) {
      return result;
    }
    
    const isTransientError = result.error?.includes('timeout') ||
      result.error?.includes('network') ||
      result.error?.includes('rate limit');
    
    if (!isTransientError || attempt === maxRetries) {
      return result;
    }
    
    const delay = Math.pow(2, attempt - 1) * 1000;
    console.log(`SMS send failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// ==================== PROVIDER STATUS ====================

export async function getProviderStatus(): Promise<{
  twilio: { configured: boolean; phoneNumber?: string };
  ringcentral: { configured: boolean; phoneNumber?: string };
}> {
  return {
    twilio: {
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || TWILIO_PHONE_NUMBER
    },
    ringcentral: {
      configured: !!(process.env.RINGCENTRAL_CLIENT_ID && process.env.RINGCENTRAL_CLIENT_SECRET),
      phoneNumber: process.env.RINGCENTRAL_PHONE_NUMBER || RINGCENTRAL_PHONE_NUMBER
    }
  };
}

// Stub for getPhoneNumbers - returns hardcoded info
export async function getPhoneNumbers(): Promise<{
  success: boolean;
  numbers?: Array<{ phoneNumber: string; type: string }>;
  error?: string;
}> {
  return {
    success: true,
    numbers: [
      { phoneNumber: TWILIO_PHONE_NUMBER, type: 'twilio' },
      { phoneNumber: RINGCENTRAL_PHONE_NUMBER, type: 'ringcentral' }
    ]
  };
}

// Stub for testRingCentralConnection - kept for backward compatibility
export async function testRingCentralConnection(): Promise<{
  connected: boolean;
  extension?: string;
  name?: string;
  error?: string;
}> {
  return {
    connected: false,
    error: 'RingCentral not configured'
  };
}
