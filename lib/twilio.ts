import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error('Twilio environment variables are not set');
}

const client = twilio(accountSid, authToken);

export interface SendSMSOptions {
  to: string;
  body: string;
  statusCallback?: string;
}

export async function sendSMS({ to, body, statusCallback }: SendSMSOptions) {
  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
      statusCallback,
    });

    return {
      success: true,
      sid: message.sid,
      status: message.status,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function validateTwilioRequest(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  return twilio.validateRequest(
    authToken,
    signature,
    url,
    params
  );
}

export { client };
