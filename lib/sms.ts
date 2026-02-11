// RingCentral SMS Provider - Direct REST API
// API Reference: https://developers.ringcentral.com/guide/messaging
// SAFETY: ONLY uses phone number +18007209957 - NO OTHER NUMBERS EVER

const RC_SERVER = 'https://platform.ringcentral.com';

// HARDcoded for SAFETY - only this number can ever be used
const AUTHORIZED_PHONE_NUMBER = '+18007209957';

export interface SendSMSOptions {
  to: string;
  body: string;
  conversationId?: string;
}

// Get access token using JWT
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const jwt = process.env.RINGCENTRAL_JWT;
  
  if (!clientId || !clientSecret || !jwt) {
    console.error('Missing RingCentral credentials');
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
      console.error('Token error:', error);
      return null;
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
}

export async function sendSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: 'Failed to authenticate with RingCentral' };
    }
    
    // Normalize phone numbers to E.164
    const normalizedTo = normalizePhoneNumber(to);
    const fromNumber = AUTHORIZED_PHONE_NUMBER;

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
      console.error('SMS send error:', error);
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

// Retry logic for failed sends
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
    console.log(`RingCentral send failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
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

// Test connection to RingCentral
export async function testRingCentralConnection(): Promise<{
  connected: boolean;
  extension?: string;
  name?: string;
  error?: string;
}> {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { connected: false, error: 'Authentication failed' };
    }
    
    const response = await fetch(`${RC_SERVER}/restapi/v1.0/account/~/extension/~`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return { connected: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    return {
      connected: true,
      extension: data.extensionNumber,
      name: data.name,
    };
  } catch (error) {
    console.error('RingCentral connection test failed:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get list of available phone numbers - READ ONLY
export async function getPhoneNumbers(): Promise<{
  success: boolean;
  numbers?: Array<{ phoneNumber: string; type: string; usageType?: string }>;
  error?: string;
}> {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: 'Authentication failed' };
    }
    
    const response = await fetch(`${RC_SERVER}/restapi/v1.0/account/~/extension/~/phone-number`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    const numbers = (data.records || []).map((record: any) => ({
      phoneNumber: record.phoneNumber,
      type: record.type,
      usageType: record.usageType,
    }));
    
    return {
      success: true,
      numbers,
    };
  } catch (error) {
    console.error('Failed to get phone numbers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
