interface AIResponse {
  extractedAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
  };
  intent?: 'address_provide' | 'question' | 'availability_check' | 'general' | 'opt_out';
  suggestedResponse?: string;
  confidence: number;
}

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export async function processMessageWithAI(
  message: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AIResponse> {
  try {
    if (!NVIDIA_API_KEY) {
      console.warn('NVIDIA_API_KEY not set, using fallback processing');
      return fallbackProcessing(message);
    }

    const systemPrompt = `You are an AI assistant for an AT&T Authorized Retailer. Your job is to:
1. Extract addresses from customer messages
2. Determine customer intent
3. Generate helpful, professional responses

When extracting addresses, return them in this format:
- Street address
- City
- State (2-letter code)
- ZIP code

Intents:
- address_provide: Customer provided or confirmed an address
- question: Customer is asking a question
- availability_check: Customer wants to check service availability
- general: General conversation
- opt_out: Customer wants to stop receiving messages

Respond in JSON format only:
{
  "extractedAddress": { "street": "", "city": "", "state": "", "zipCode": "", "fullAddress": "" },
  "intent": "",
  "suggestedResponse": "",
  "confidence": 0.0
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return fallbackProcessing(message);
    }

    const parsed = JSON.parse(content);
    return {
      extractedAddress: parsed.extractedAddress,
      intent: parsed.intent,
      suggestedResponse: parsed.suggestedResponse,
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return fallbackProcessing(message);
  }
}

function fallbackProcessing(message: string): AIResponse {
  const lowerMessage = message.toLowerCase();
  
  // Simple address extraction patterns
  const addressPatterns = [
    /(\d+\s+[\w\s]+(?:st|nd|rd|th|ave|blvd|rd|ln|dr|ct|way|pl| Hwy|highway)?\.?)/i,
    /(\d{5}(-\d{4})?)/,
  ];

  const hasAddress = addressPatterns.some(pattern => pattern.test(message));
  
  // Intent detection
  let intent: AIResponse['intent'] = 'general';
  
  if (lowerMessage.includes('address') || hasAddress) {
    intent = 'address_provide';
  } else if (lowerMessage.includes('available') || lowerMessage.includes('service') || lowerMessage.includes('internet') || lowerMessage.includes('fiber')) {
    intent = 'availability_check';
  } else if (lowerMessage.includes('?')) {
    intent = 'question';
  } else if (lowerMessage.includes('stop') || lowerMessage.includes('unsubscribe') || lowerMessage.includes('opt out')) {
    intent = 'opt_out';
  }

  return {
    intent,
    suggestedResponse: generateFallbackResponse(intent, lowerMessage),
    confidence: 0.5,
  };
}

function generateFallbackResponse(intent: AIResponse['intent'], message: string): string {
  switch (intent) {
    case 'address_provide':
      return "Thank you for providing your address! Let me check AT&T service availability for you. This will just take a moment.";
    case 'availability_check':
      return "I'd be happy to check AT&T service availability for you. Could you please provide your full address including street, city, state, and ZIP code?";
    case 'question':
      return "Thank you for your question! One of our AT&T representatives will get back to you shortly with an answer.";
    case 'opt_out':
      return "You've been unsubscribed from our messages. If you need assistance in the future, feel free to reach out. Have a great day!";
    default:
      return "Thank you for reaching out to AT&T! How can we help you today? We can check service availability, answer questions about our plans, or connect you with a representative.";
  }
}

export async function generateAddressRequestResponse(): Promise<string> {
  return "Hi! Thank you for contacting AT&T. To check what services are available at your location, could you please provide your full address? Include your street address, city, state, and ZIP code. 🏠";
}

export async function generateAvailabilityResponse(
  services: string[],
  fiberSpeeds?: string[],
  hasInternetAir?: boolean
): Promise<string> {
  if (services.includes('fiber') && fiberSpeeds && fiberSpeeds.length > 0) {
    const speedsText = fiberSpeeds.join(', ');
    return `Great news! 🎉 AT&T Fiber is available at your address with speeds up to ${speedsText} Mbps! Fiber provides the fastest, most reliable internet with symmetrical upload and download speeds. Would you like to learn more about our Fiber plans or schedule an installation?`;
  }
  
  if (hasInternetAir) {
    return `Good news! AT&T Internet Air is available at your address. Internet Air delivers high-speed wireless internet using our reliable 5G network - perfect for streaming, gaming, and working from home. No installation appointment needed! Would you like to learn more about our Internet Air plans?`;
  }
  
  return `I checked AT&T availability at your address, and unfortunately we don't currently offer Fiber or Internet Air service there. However, we may have other options available or be expanding to your area soon. Would you like me to have a representative contact you about alternative solutions or notify you when service becomes available?`;
}
