# AT&T Authorized Retailer CRM

A complete customer relationship management system for AT&T Authorized Retailers with SMS integration, AT&T service availability checking, and AI-powered responses.

## Features

- **📱 SMS Conversations** - Two-way messaging with customers via Twilio
- **🔍 AT&T Service Checker** - Automated checking of Fiber and Internet Air availability
- **🤖 AI-Powered Responses** - Smart message processing using NVIDIA Kimi K2.5
- **📊 Dashboard** - Real-time conversation management and status tracking
- **👥 Customer Management** - Complete customer profiles with address tracking

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Twilio SDK
- Playwright (browser automation)
- NVIDIA AI API

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd att-crm
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Set up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push directly (for development)
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | ✅ |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending SMS | ✅ |
| `NVIDIA_API_KEY` | NVIDIA AI API key | Optional |
| `NEXT_PUBLIC_APP_URL` | Your app URL (for webhooks) | ✅ |

## Twilio Webhook Setup

1. Go to your Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Under "Messaging", set the webhook URL:
   - **A message comes in**: `https://your-domain.com/api/twilio/webhook`
   - **HTTP POST**

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables for Vercel

Make sure to set all required environment variables in the Vercel dashboard:
- `DATABASE_URL` - Use Vercel Postgres or Neon
- All Twilio credentials
- `NEXT_PUBLIC_APP_URL` - Your production URL

## Database Schema

The system uses Prisma with the following main entities:

- **Customer** - Contact information and addresses
- **Conversation** - Message threads with status tracking
- **Message** - Individual SMS messages (inbound/outbound)
- **AvailabilityCheck** - AT&T service check results

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/twilio/webhook` | POST | Receive SMS from Twilio |
| `/api/twilio/send` | POST | Send SMS reply |
| `/api/att/check` | POST | Check AT&T availability |
| `/api/ai/process` | POST | Process message with AI |
| `/api/conversations` | GET | List all conversations |
| `/api/conversations/[id]` | GET | Get conversation details |
| `/api/conversations/[id]/status` | PATCH | Update conversation status |

## Conversation Status Flow

```
NEW → ADDRESS_REQUESTED → CHECKING → RESPONDED → CLOSED
```

- **NEW** - New conversation started
- **ADDRESS_REQUESTED** - Waiting for customer address
- **CHECKING** - AT&T availability check in progress
- **RESPONDED** - Response sent to customer
- **CLOSED** - Conversation completed

## AI Features

The system uses NVIDIA Kimi K2.5 to:
- Extract addresses from customer messages
- Determine customer intent
- Generate contextual responses
- Handle conversation flow automatically

If NVIDIA API is not configured, the system falls back to pattern matching.

## Troubleshooting

### Playwright Issues

For serverless environments, you may need to use `playwright-core` with a custom chromium build:

```bash
npm install @sparticuz/chromium
```

Then update `lib/att-checker.ts` to use the serverless-compatible chromium.

### Twilio Webhook Not Working

1. Verify your `NEXT_PUBLIC_APP_URL` is correct
2. Check Twilio webhook URL is set to `https://your-domain.com/api/twilio/webhook`
3. Ensure the route is accessible (not blocked by auth)

### Database Connection Issues

1. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
2. For local development, you can use SQLite by changing the provider in `prisma/schema.prisma`

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
# RingCentral Integration Deployed
