// Type definitions for the AT&T CRM

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_PHONE_NUMBER: string;
      NVIDIA_API_KEY?: string;
      NEXT_PUBLIC_APP_URL: string;
    }
  }
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  customerId: string;
  status: 'NEW' | 'ADDRESS_REQUESTED' | 'CHECKING' | 'RESPONDED' | 'CLOSED';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  messages: Message[];
  availabilityChecks: AvailabilityCheck[];
}

export interface Message {
  id: string;
  conversationId: string;
  customerId: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  twilioSid: string | null;
  createdAt: Date;
}

export interface AvailabilityCheck {
  id: string;
  customerId: string;
  conversationId: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'PENDING' | 'FIBER_AVAILABLE' | 'INTERNET_AIR_AVAILABLE' | 'NOT_AVAILABLE' | 'ERROR';
  services: string[];
  fiberSpeeds: string[] | null;
  internetAir: boolean | null;
  notes: string | null;
  checkedAt: Date;
  createdAt: Date;
}

export {};
