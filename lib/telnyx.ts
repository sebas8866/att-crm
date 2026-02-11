// Telnyx SMS Provider Library
// API Reference: https://developers.telnyx.com/docs/api/v2/messages

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_PHONE_NUMBER = process.env.TELNYX_PHONE_NUMBER;
const TELNYX_API_URL = 'https://api.telnyx.com/v2/messages';

export interface SendSMSOptions {
  to: string;
  body: string;
  conversationId?: string;
}

export interface TelnyxMessageResponse {
  data: {
    id: string;
    record_type: string;
    direction: string;
    messaging_profile_id: string;
    from: {
      phone_number: string;
      carrier: string;
      line_type: string;
    };
    to: Array<{
      phone_number: string;
      status: string;
      carrier: string;
      line_type: string;
    }>;
    text: string;
    subject?: string;
    media?: Array<{
      url: string;
      content_type: string;
      sha256: string;
      size: number;
    }>;
    webhook_url?: string;
    webhook_failover_url?: string;
    encoding: string;
    sent_at?: string;
    completed_at?: string;
    cost?: {
      amount: string;
      currency: string;
    };
    cost_breakdown?: Array<{
      charge_amount: string;
      charge_currency: string;
      charge_type: string;
    }>;
    errors?: Array<{
      code: string;
      title: string;
      detail: string;
      source?: {
        pointer: string;
      };
      meta?: Record<string, any>;
    }>;
    cost_per_carrier?: Record<string, any>;
    is_spam?: boolean;
    dlr?: {
      code: number;
      code_description: string;
      status: string;
    };
  };
}

export async function sendTelnyxSMS({ to, body }: SendSMSOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    if (!TELNYX_API_KEY) {
      throw new Error('TELNYX_API_KEY environment variable is not set');
    }

    if (!TELNYX_PHONE_NUMBER) {
      throw new Error('TELNYX_PHONE_NUMBER environment variable is not set');
    }

    // Normalize phone numbers to E.164
    const normalizedTo = normalizePhoneNumber(to);
    const normalizedFrom = normalizePhoneNumber(TELNYX_PHONE_NUMBER);

    const payload = {
      from: normalizedFrom,
      to: normalizedTo,
      text: body,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/telnyx/webhook`,
    };

    const response = await fetch(TELNYX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.errors?.[0]?.detail || `HTTP ${response.status}`;
      throw new Error(`Telnyx API error: ${errorMessage}`);
    }

    const data: TelnyxMessageResponse = await response.json();

    return {
      success: true,
      id: data.data.id,
    };
  } catch (error) {
    console.error('Telnyx send SMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export interface TelnyxWebhookPayload {
  data: {
    id: string;
    record_type: string;
    event_type: string;
    occurred_at: string;
    payload: {
      id: string;
      record_type: string;
      direction: string;
      from: {
        phone_number: string;
        carrier: string;
        line_type: string;
      };
      to: Array<{
        phone_number: string;
        status: string;
        carrier: string;
        line_type: string;
      }>;
      text: string;
      received_at: string;
      cost?: {
        amount: string;
        currency: string;
      };
    };
  };
  meta: {
    attempt: number;
    delivered_to: string;
  };
}

export function parseTelnyxWebhook(body: any): {
  from: string;
  to: string;
  text: string;
  messageId: string;
  receivedAt: Date;
} | null {
  try {
    // Handle both direct payload and wrapped payload
    const data = body.data || body;
    const payload = data.payload || data;

    if (!payload.from?.phone_number || !payload.text) {
      console.error('Invalid Telnyx webhook payload:', body);
      return null;
    }

    return {
      from: payload.from.phone_number,
      to: payload.to?.[0]?.phone_number || '',
      text: payload.text,
      messageId: payload.id || data.id,
      receivedAt: payload.received_at 
        ? new Date(payload.received_at)
        : new Date(),
    };
  } catch (error) {
    console.error('Error parsing Telnyx webhook:', error);
    return null;
  }
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If already in E.164 format (+1XXXXXXXXXX)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Add +1 if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Add + if it's 11 digits and starts with 1
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// Retry logic for failed sends
export async function sendTelnyxSMSWithRetry(
  options: SendSMSOptions,
  maxRetries = 3
): Promise<{ success: boolean; id?: string; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendTelnyxSMS(options);
    
    if (result.success) {
      return result;
    }
    
    // Only retry on transient errors (5xx, timeout, network errors)
    const isTransientError = result.error?.includes('timeout') ||
      result.error?.includes('network') ||
      result.error?.includes('ECONNRESET') ||
      result.error?.includes('ETIMEDOUT');
    
    if (!isTransientError || attempt === maxRetries) {
      return result;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, attempt - 1) * 1000;
    console.log(`Telnyx send failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
