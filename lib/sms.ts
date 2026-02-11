// RingCentral SMS Provider
// API Reference: https://developers.ringcentral.com/guide/messaging
// SAFETY: ONLY uses phone number +18007209957 - NO OTHER NUMBERS EVER

import { SDK } from 'ringcentral';

const RC_SERVER = 'https://platform.ringcentral.com';

// HARDcoded for SAFETY - only this number can ever be used
const AUTHORIZED_PHONE_NUMBER = '+18007209957';

export interface SendSMSOptions {
  to: string;
  body: string;
  conversationId?: string;
}

// Initialize RingCentral SDK
function getRingCentralSDK() {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('RingCentral credentials not configured');
  }
  
  return new SDK({
    server: RC_SERVER,
    clientId,
    clientSecret,
  });
}

// Authenticate with JWT or Access Token
async function authenticateRingCentral() {
  const rcsdk = getRingCentralSDK();
  const platform = rcsdk.platform();
  
  // Try access token first (from OAuth flow)
  const accessToken = process.env.RINGCENTRAL_ACCESS_TOKEN;
  if (accessToken) {
    try {
      platform.auth().setData({ access_token: accessToken });
      // Test the token with a simple request
      await platform.get('/restapi/v1.0/account/~/extension/~');
      console.log('Authenticated with access token');
      return platform;
    } catch (error) {
      console.log('Access token failed, trying JWT...');
    }
  }
  
  // Fall back to JWT
  const jwt = process.env.RINGCENTRAL_JWT;
  if (!jwt) {
    throw new Error('No authentication method available. Set RINGCENTRAL_ACCESS_TOKEN or RINGCENTRAL_JWT');
  }
  
  try {
    await platform.login({ jwt });
    console.log('Authenticated with JWT');
    return platform;
  } catch (error) {
    console.error('RingCentral authentication failed:', error);
    throw error;
  }
}

export async function sendSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    // SAFETY: Hardcoded number - NEVER uses any other number
    const fromNumber = AUTHORIZED_PHONE_NUMBER;
    
    // Extra safety check - verify env var matches if set
    const envNumber = process.env.RINGCENTRAL_PHONE_NUMBER;
    if (envNumber && normalizePhoneNumber(envNumber) !== AUTHORIZED_PHONE_NUMBER) {
      console.error('SAFETY: Env phone number mismatch - using hardcoded authorized number');
    }

    // Normalize phone numbers to E.164
    const normalizedTo = normalizePhoneNumber(to);

    console.log('Sending SMS via RingCentral:', { 
      from: fromNumber, 
      to: normalizedTo, 
      bodyLength: body.length 
    });

    const platform = await authenticateRingCentral();
    
    const payload = {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: normalizedTo }],
      text: body,
    };

    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', payload);
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
      result.error?.includes('ECONNRESET') ||
      result.error?.includes('ETIMEDOUT') ||
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
// SAFETY: Only reads extension info, NEVER modifies anything
export async function testRingCentralConnection(): Promise<{
  connected: boolean;
  extension?: string;
  name?: string;
  error?: string;
}> {
  try {
    const platform = await authenticateRingCentral();
    // SAFETY: GET request only - reads current user extension, doesn't modify
    const response = await platform.get('/restapi/v1.0/account/~/extension/~');
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
// SAFETY: Only GET request, never modifies anything
export async function getPhoneNumbers(): Promise<{
  success: boolean;
  numbers?: Array<{ phoneNumber: string; type: string; usageType?: string }>;
  error?: string;
}> {
  try {
    const platform = await authenticateRingCentral();
    // SAFETY: GET request only - reads phone numbers, doesn't modify
    const response = await platform.get('/restapi/v1.0/account/~/extension/~/phone-number');
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
