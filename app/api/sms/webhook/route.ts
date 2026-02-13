import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS, normalizePhoneNumber } from '@/lib/sms';
import { sendNewMessageEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Re-export to handle /api/sms/webhook as well
export { POST, GET } from '../telnyx/webhook/route';
